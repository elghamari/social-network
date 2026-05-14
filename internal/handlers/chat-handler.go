package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"soc-net/internal/hub"
	"soc-net/internal/types"
	"soc-net/internal/utils"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		origin := r.Header.Get("Origin")
		if origin == "http://localhost:3000" {
			return true
		}
		log.Printf("Connection blocked from origin: %s", origin)
		return false
	},
}

func (h *Handler) ServeWs(w http.ResponseWriter, r *http.Request) {
	uid := utils.GetUserId(r)
	if uid == "" {
		HandleError(w, types.NewForbiddenError("unauthorized access to websocket"))
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket Upgrade Error for User %s: %v", uid, err)
		return
	}

	p := &hub.Peer{
		Uid:  uid,
		Conn: conn,
		Out:  make(chan []byte, 256),
		Hub:  h.Hub,
	}

	h.Hub.Join <- p

	go p.ReadPump()
	go p.WritePump()
}

func (h *Handler) GetRecentContacts(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.WriteJson(w, http.StatusMethodNotAllowed, map[string]any{
			"error": "method not allowed",
		})
		return
	}

	userId := utils.GetUserId(r)
	if userId == "" {
		HandleError(w, types.NewForbiddenError("unauthorized access"))
		return
	}

	contacts, err := h.Services.Chat.GetRecentContacts(userId)
	if err != nil {
		HandleError(w, err)
		return
	}

	for i := range contacts {
		contacts[i].IsOnline = h.Hub.IsUserOnline(contacts[i].UserID)
	}

	utils.WriteJson(w, http.StatusOK, map[string]any{
		"data": contacts,
	})
}

func (h *Handler) GetPrivateHistory(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.WriteJson(w, http.StatusMethodNotAllowed, map[string]any{
			"error": "method not allowed",
		})
		return
	}

	currentUserId := utils.GetUserId(r)
	if currentUserId == "" {
		HandleError(w, types.NewForbiddenError("unauthorized access"))
		return
	}

	targetUserId := r.URL.Query().Get("targetId")
	if targetUserId == "" {
		HandleError(w, types.NewActionError("targetId is required"))
		return
	}

	var cursor int64 = 0 
	cursorStr := r.URL.Query().Get("cursor")
	
	if cursorStr != "" {
		var err error
		cursor, err = strconv.ParseInt(cursorStr, 10, 64)
		if err != nil {
			HandleError(w, types.NewActionError("invalid cursor format"))
			return
		}
	}

	history, err := h.Services.Chat.GetPrivateHistory(currentUserId, targetUserId, cursor)
	if err != nil {
		HandleError(w, err) 
		return
	}

	utils.WriteJson(w, http.StatusOK, map[string]any{
		"data": history,
	})
}

func (h *Handler) GetAvailableChatUsers(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.WriteJson(w, http.StatusMethodNotAllowed, map[string]any{
			"error": "method not allowed",
		})
		return
	}

	userId := utils.GetUserId(r)
	if userId == "" {
		HandleError(w, types.NewForbiddenError("unauthorized access"))
		return
	}

	users, err := h.Services.Chat.GetAvailableChatUsers(userId)
	if err != nil {
		HandleError(w, err) 
		return
	}

	for i := range users {
		users[i].IsOnline = h.Hub.IsUserOnline(users[i].UserID)
	}

	utils.WriteJson(w, http.StatusOK, map[string]any{
		"data": users,
	})
}

func (h *Handler) GetGroupHistory(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.WriteJson(w, http.StatusMethodNotAllowed, map[string]any{
			"error": "method not allowed",
		})
		return
	}

	currentUserId := utils.GetUserId(r)
	if currentUserId == "" {
		HandleError(w, types.NewForbiddenError("unauthorized access"))
		return
	}

	groupIdStr := r.URL.Query().Get("groupId")
	if groupIdStr == "" {
		HandleError(w, types.NewActionError("groupId is required"))
		return
	}

	groupId, err := strconv.Atoi(groupIdStr)
	if err != nil {
		HandleError(w, types.NewActionError("invalid groupId format"))
		return
	}

	var cursor int64 = 0
	cursorStr := r.URL.Query().Get("cursor")
	if cursorStr != "" {
		cursor, err = strconv.ParseInt(cursorStr, 10, 64)
		if err != nil {
			HandleError(w, types.NewActionError("invalid cursor format"))
			return
		}
	}

	history, err := h.Services.Chat.GetGroupHistory(groupId, currentUserId, cursor)
	if err != nil {
		HandleError(w, err) 
		return
	}

	utils.WriteJson(w, http.StatusOK, map[string]any{
		"data": history,
	})
}

func (h *Handler) MarkAsRead(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteJson(w, http.StatusMethodNotAllowed, map[string]any{
			"error": "method not allowed",
		})
		return
	}

	currentUserId := utils.GetUserId(r)
	if currentUserId == "" {
		HandleError(w, types.NewForbiddenError("unauthorized access"))
		return
	}

	var input struct {
		SenderId string `json:"senderId"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		HandleError(w, types.NewActionError("invalid request body"))
		return
	}

	if input.SenderId == "" {
		HandleError(w, types.NewActionError("senderId is required"))
		return
	}

	err := h.Services.Chat.MarkMessagesAsRead(currentUserId, input.SenderId)
	if err != nil {
		HandleError(w, err)
		return
	}
	payloadBytes, err := json.Marshal(input.SenderId)
	if err == nil {
		h.Hub.Events <- hub.Event{
			Kind:    "mark_as_read",
			OwnerID: currentUserId,
			Payload: payloadBytes,
		}
	} else {
		log.Printf("Error marshaling mark_as_read payload: %v", err)
	}

	utils.WriteJson(w, http.StatusOK, map[string]any{
		"message": "messages marked as read",
	})
}

func (h *Handler) MarkGroupAsRead(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteJson(w, http.StatusMethodNotAllowed, map[string]any{
			"error": "method not allowed",
		})
		return
	}

	currentUserId := utils.GetUserId(r)
	if currentUserId == "" {
		HandleError(w, types.NewForbiddenError("unauthorized access"))
		return
	}

	var input struct {
		GroupId       int   `json:"groupId"`
		LastMessageId int64 `json:"lastMessageId"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		HandleError(w, types.NewActionError("invalid request body"))
		return
	}

	if input.GroupId == 0 {
		HandleError(w, types.NewActionError("groupId is required"))
		return
	}

	err := h.Services.Chat.MarkGroupAsRead(input.GroupId, currentUserId, input.LastMessageId)
	if err != nil {
		HandleError(w, err) 
		return
	}
	payloadBytes, err := json.Marshal(map[string]int{"groupId": input.GroupId})
	if err == nil {
		h.Hub.Events <- hub.Event{
			Kind:    "mark_group_as_read",
			OwnerID: currentUserId,
			Payload: payloadBytes,
		}
	} else {
		log.Printf("Error marshaling mark_group_as_read payload: %v", err)
	}

	utils.WriteJson(w, http.StatusOK, map[string]any{
		"message": "group messages marked as read",
	})
}

func (h *Handler) GetSingleGroupUnreadCount(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.WriteJson(w, http.StatusMethodNotAllowed, map[string]any{"error": "method not allowed"})
		return
	}

	userId := utils.GetUserId(r)
	if userId == "" {
		HandleError(w, types.NewForbiddenError("unauthorized access"))
		return
	}
	groupIdStr := r.URL.Query().Get("groupId") 
	groupId, _ := strconv.Atoi(groupIdStr)

	count, err := h.Services.Chat.GetSingleGroupUnreadCount(groupId, userId)
	if err != nil {
		HandleError(w, err)
		return
	}

	utils.WriteJson(w, http.StatusOK, map[string]any{
		"unreadCount": count,
	})
}
package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"soc-net/internal/hub"
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

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	p := hub.NewPeer(uid, conn, h.Hub)

	h.Hub.Join(p)

	go p.ReadPump()
	go p.WritePump()
}

func (h *Handler) MarkAsRead(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteJson(w, http.StatusMethodNotAllowed, map[string]any{
			"error": "method not allowed",
		})
		return
	}

	currentUserId := utils.GetUserId(r)

	var input struct {
		SenderId string `json:"senderId"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{
			"error": "invalid request body",
		})
		return
	}

	if input.SenderId == "" {
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{
			"error": "senderId is required",
		})
		return
	}

	if err := h.Services.Chat.MarkMessagesAsRead(currentUserId, input.SenderId); err != nil {
		utils.WriteJson(w, http.StatusInternalServerError, map[string]any{
			"error": err.Error(),
		})
		return
	}

	payloadBytes, _ := json.Marshal(input.SenderId)
	h.Hub.Dispatch(hub.Event{
		Kind:    "mark_as_read",
		OwnerID: currentUserId,
		Payload: payloadBytes,
	})

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

	var input struct {
		GroupId       int   `json:"groupId"`
		LastMessageId int64 `json:"lastMessageId"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{
			"error": "invalid request body",
		})
		return
	}

	if input.GroupId == 0 {
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{
			"error": "groupId is required",
		})
		return
	}

	if err := h.Services.Chat.MarkGroupAsRead(input.GroupId, currentUserId, input.LastMessageId); err != nil {
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{
			"error": err.Error(),
		})
		return
	}

	payloadBytes, _ := json.Marshal(map[string]int{"groupId": input.GroupId})
	h.Hub.Dispatch(hub.Event{
		Kind:    "mark_group_as_read",
		OwnerID: currentUserId,
		Payload: payloadBytes,
	})

	utils.WriteJson(w, http.StatusOK, map[string]any{
		"message": "group messages marked as read",
	})
}

func (h *Handler) GetRecentContacts(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.WriteJson(w, http.StatusMethodNotAllowed, map[string]any{
			"error": "method not allowed",
		})
		return
	}

	userId := utils.GetUserId(r)

	contacts, err := h.Services.Chat.GetRecentContacts(userId)
	if err != nil {
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{
			"error": err.Error(),
		})
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

	targetUserId := r.URL.Query().Get("targetId")
	if targetUserId == "" {
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{
			"error": "targetId is required",
		})
		return
	}

	cursorStr := r.URL.Query().Get("cursor")
	cursor, _ := strconv.ParseInt(cursorStr, 10, 64)

	history, err := h.Services.Chat.GetPrivateHistory(currentUserId, targetUserId, cursor)
	if err != nil {
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{
			"error": err.Error(),
		})
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

	users, err := h.Services.Chat.GetAvailableChatUsers(userId)
	if err != nil {
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{
			"error": err.Error(),
		})
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

	groupIdStr := r.URL.Query().Get("groupId")
	if groupIdStr == "" {
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{
			"error": "groupId is required",
		})
		return
	}

	groupId, err := strconv.Atoi(groupIdStr)
	if err != nil {
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{
			"error": "invalid groupId format",
		})
		return
	}

	cursorStr := r.URL.Query().Get("cursor")
	cursor, _ := strconv.ParseInt(cursorStr, 10, 64)

	history, err := h.Services.Chat.GetGroupHistory(groupId, currentUserId, cursor)
	if err != nil {
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{
			"error": err.Error(),
		})
		return
	}

	utils.WriteJson(w, http.StatusOK, map[string]any{
		"data": history,
	})
}

package handlers

import (
	"encoding/json"
	"net/http"
	"soc-net/internal/types"
	"soc-net/internal/utils"
)

// ============================================================
// Groups — /api/groups
// ============================================================

func (h *Handler) Groups(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		h.GetGroups(w, r)
	case http.MethodPost:
		h.CreateGroup(w, r)
	default:
		utils.WriteJson(w, http.StatusMethodNotAllowed, map[string]any{
			"error": "Method not allowed",
		})
	}
}

func (h *Handler) CreateGroup(w http.ResponseWriter, r *http.Request) {
	userId := utils.GetUserId(r)

	path, err := utils.HandleImageUpload(r, "coverImage")
	if err != nil {
		HandleError(w, err)
		return
	}

	coverPath := ""
	if path != nil {
		coverPath = *path
	}

	group := types.Group{
		Title:       r.FormValue("title"),
		Description: r.FormValue("description"),
		CoverPath:   coverPath,
	}

	group, err = h.Services.Group.CreateGroup(userId, group)
	if err != nil {
		HandleError(w, err)
		return
	}

	utils.WriteJson(w, http.StatusOK, map[string]any{
		"group": group,
	})
}

func (h *Handler) GetGroups(w http.ResponseWriter, r *http.Request) {
	userId := utils.GetUserId(r)
	tab := r.URL.Query().Get("tab")
	query := r.URL.Query().Get("query")
	cursor := r.URL.Query().Get("cursor")

	groups, err := h.Services.Group.ListGroups(userId, tab, query, cursor)
	if err != nil {
		HandleError(w, err)
		return
	}

	utils.WriteJson(w, http.StatusOK, map[string]any{
		"groups": groups,
	})
}

func (h *Handler) Group(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.WriteJson(w, http.StatusMethodNotAllowed, map[string]any{
			"error": "Method not allowed",
		})
		return
	}

	userId := utils.GetUserId(r)
	groupId := r.PathValue("id")

	group, err := h.Services.Group.GetGroup(groupId, userId)
	if err != nil {
		HandleError(w, err)
		return
	}

	if group.Id == "" {
		utils.WriteJson(w, http.StatusNotFound, map[string]any{
			"error": "Group not found",
		})
		return
	}

	utils.WriteJson(w, http.StatusOK, map[string]any{
		"group": group,
	})
}

// ============================================================
// GroupPosts — /api/groups/{id}/events
// ============================================================

func (h *Handler) GroupPosts(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		h.GetGroupPosts(w, r)
	case http.MethodPost:
		h.CreatePost(w, r)
	default:
		utils.WriteJson(w, http.StatusMethodNotAllowed, map[string]any{
			"error": "Method not allowed",
		})
	}
}

// ============================================================
// Invitations — /api/groups/{id}/manage/invitations
// ============================================================

func (h *Handler) GroupInvitations(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		h.GetInvitableUsers(w, r)

	case http.MethodPost:
		h.SendGroupInvitation(w, r)

	case http.MethodPut:
		h.AcceptGroupInvitation(w, r)

	case http.MethodDelete:
		if r.URL.Query().Get("userId") != "" {
			h.RevokeGroupInvitation(w, r)

		} else {
			h.DeclineGroupInvitation(w, r)

		}

	default:
		utils.WriteJson(w, http.StatusMethodNotAllowed, map[string]any{
			"error": "Method not allowed",
		})
	}
}

func (h *Handler) GetInvitableUsers(w http.ResponseWriter, r *http.Request) {
	userId := utils.GetUserId(r)
	groupId := r.PathValue("id")
	query := r.URL.Query().Get("query")
	cursor := r.URL.Query().Get("cursor")

	users, err := h.Services.Group.GetInvitableUsers(groupId, userId, query, cursor)
	if err != nil {
		HandleError(w, err)
		return
	}

	utils.WriteJson(w, http.StatusOK, map[string]any{
		"users": users,
	})
}

func (h *Handler) SendGroupInvitation(w http.ResponseWriter, r *http.Request) {
	var body struct {
		UserId string `json:"userId"`
	}

	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{
			"error": "Invalid request body",
		})
		return
	}
	inviterId := utils.GetUserId(r)
	groupId := r.PathValue("id")
	userId := body.UserId

	if err := h.Services.Group.SendGroupInvitation(groupId, inviterId, userId); err != nil {
		HandleError(w, err)
		return
	}

	utils.WriteJson(w, http.StatusOK, nil)
}

func (h *Handler) RevokeGroupInvitation(w http.ResponseWriter, r *http.Request) {
	revokerId := utils.GetUserId(r)
	groupId := r.PathValue("id")
	userId := r.URL.Query().Get("userId")

	if err := h.Services.Group.RevokeGroupInvitation(groupId, revokerId, userId); err != nil {
		HandleError(w, err)
		return
	}

	utils.WriteJson(w, http.StatusOK, nil)
}

func (h *Handler) AcceptGroupInvitation(w http.ResponseWriter, r *http.Request) {
	userId := utils.GetUserId(r)
	groupId := r.PathValue("id")

	if err := h.Services.Group.AcceptGroupInvitation(groupId, userId); err != nil {
		HandleError(w, err)
		return
	}

	utils.WriteJson(w, http.StatusOK, nil)
}

func (h *Handler) DeclineGroupInvitation(w http.ResponseWriter, r *http.Request) {
	userId := utils.GetUserId(r)
	groupId := r.PathValue("id")

	if err := h.Services.Group.DeclineGroupInvitation(groupId, userId); err != nil {
		HandleError(w, err)
		return
	}

	utils.WriteJson(w, http.StatusOK, nil)

}

// ============================================================
// Join Requests — /api/groups/{id}/manage/requests
// ============================================================

func (h *Handler) GroupJoinRequests(w http.ResponseWriter, r *http.Request) {

	userId := r.URL.Query().Get("userId")

	switch r.Method {
	case http.MethodGet:
		h.GetJoinRequestUsers(w, r)

	case http.MethodPost:
		h.SendJoinRequest(w, r)

	case http.MethodPut:
		h.ApproveJoinRequest(w, r)

	case http.MethodDelete:
		if userId != "" {
			h.RejectJoinRequest(w, r)

		} else {
			h.RevokeJoinRequest(w, r)

		}

	default:
		utils.WriteJson(w, http.StatusMethodNotAllowed, map[string]any{
			"error": "Method not allowed",
		})
	}
}

func (h *Handler) GetJoinRequestUsers(w http.ResponseWriter, r *http.Request) {
	userId := utils.GetUserId(r)
	groupId := r.PathValue("id")
	cursor := r.URL.Query().Get("cursor")

	users, err := h.Services.Group.GetJoinRequestUsers(groupId, userId, cursor)
	if err != nil {
		HandleError(w, err)
		return
	}

	utils.WriteJson(w, http.StatusOK, map[string]any{
		"users": users,
	})
}

func (h *Handler) SendJoinRequest(w http.ResponseWriter, r *http.Request) {
	var body struct {
		UserId string `json:"userId"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{
			"error": "Invalid request body",
		})
		return
	}

	userId := utils.GetUserId(r)
	groupId := r.PathValue("id")

	if err := h.Services.Group.SendJoinRequest(groupId, userId); err != nil {
		HandleError(w, err)
		return
	}

	utils.WriteJson(w, http.StatusOK, nil)
}

func (h *Handler) RevokeJoinRequest(w http.ResponseWriter, r *http.Request) {
	userId := utils.GetUserId(r)
	groupId := r.PathValue("id")

	if err := h.Services.Group.RevokeJoinRequest(groupId, userId); err != nil {
		HandleError(w, err)
		return
	}

	utils.WriteJson(w, http.StatusOK, nil)
}

func (h *Handler) ApproveJoinRequest(w http.ResponseWriter, r *http.Request) {
	var body struct {
		UserId string `json:"userId"`
	}

	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{
			"error": "Invalid request body",
		})
		return
	}

	approverId := utils.GetUserId(r)
	groupId := r.PathValue("id")
	userId := body.UserId

	if err := h.Services.Group.ApproveJoinRequest(groupId, approverId, userId); err != nil {
		HandleError(w, err)
		return
	}

	utils.WriteJson(w, http.StatusOK, nil)
}

func (h *Handler) RejectJoinRequest(w http.ResponseWriter, r *http.Request) {
	rejecterId := utils.GetUserId(r)
	groupId := r.PathValue("id")
	userId := r.URL.Query().Get("userId")

	if err := h.Services.Group.RejectJoinRequest(groupId, rejecterId, userId); err != nil {
		HandleError(w, err)
		return
	}

	utils.WriteJson(w, http.StatusOK, nil)
}

// ============================================================
// GroupEvents — /api/groups/{id}/events
// ============================================================

func (h *Handler) GroupEvents(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		h.GetEvents(w, r)
	case http.MethodPost:
		h.CreateEvent(w, r)
	case http.MethodPut:
		h.EventRespond(w, r)
	default:
		utils.WriteJson(w, http.StatusMethodNotAllowed, map[string]any{
			"error": "Method not allowed",
		})
	}
}

func (h *Handler) CreateEvent(w http.ResponseWriter, r *http.Request) {
	userId := utils.GetUserId(r)
	groupId := r.PathValue("id")

	event := types.Event{}
	if err := json.NewDecoder(r.Body).Decode(&event); err != nil {
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{
			"error": "Invalid request body",
		})
		return
	}

	event, err := h.Services.Group.CreateEvent(groupId, userId, event)
	if err != nil {
		HandleError(w, err)
		return
	}

	utils.WriteJson(w, http.StatusOK, map[string]any{
		"event": event,
	})
}

func (h *Handler) GetEvents(w http.ResponseWriter, r *http.Request) {
	userId := utils.GetUserId(r)
	groupId := r.PathValue("id")
	cursor := r.URL.Query().Get("cursor")

	events, err := h.Services.Group.ListEvents(groupId, userId, cursor)
	if err != nil {
		HandleError(w, err)
		return
	}

	utils.WriteJson(w, http.StatusOK, map[string]any{
		"events": events,
	})
}

func (h *Handler) EventRespond(w http.ResponseWriter, r *http.Request) {
	userId := utils.GetUserId(r)
	groupId := r.PathValue("id")

	eventResponse := types.EventResponse{}
	if err := json.NewDecoder(r.Body).Decode(&eventResponse); err != nil {
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{
			"error": "Invalid request body",
		})
		return
	}

	err := h.Services.Group.RespondToEvent(groupId, userId, eventResponse)
	if err != nil {
		HandleError(w, err)
		return
	}

	utils.WriteJson(w, http.StatusOK, nil)
}

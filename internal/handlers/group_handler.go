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

// Groups routes GET and POST requests for /api/groups
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

// CreateGroup handles POST /api/groups
// Parses multipart form data, creates a group, returns the created group.
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

// GetGroups handles GET /api/groups
// Supports tab filtering and search.
// Query params: tab (discover | joined | pending), query (search string)
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

// Group handles GET /api/groups/{id}
// Returns a single group with the current user's role.
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
// Join Requests (user-facing) — /api/groups/join
// ============================================================

// JoinRequests routes POST and DELETE for /api/groups/join
func (h *Handler) JoinRequests(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodPost:
		h.SubmitJoinRequest(w, r)
	case http.MethodDelete:
		h.CancelJoinRequest(w, r)
	default:
		utils.WriteJson(w, http.StatusMethodNotAllowed, map[string]any{
			"error": "Method not allowed",
		})
	}
}

// SubmitJoinRequest handles POST /api/groups/join
// Submits a join request for the authenticated user.
// Body: { groupId }
func (h *Handler) SubmitJoinRequest(w http.ResponseWriter, r *http.Request) {
	userId := utils.GetUserId(r)

	req := types.JoinRequest{}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{
			"error": "Invalid request body",
		})
		return
	}
	req.UserId = userId

	if err := h.Services.Group.SubmitJoinRequest(req); err != nil {
		HandleError(w, err)
		return
	}

	utils.WriteJson(w, http.StatusOK, nil)
}

// CancelJoinRequest handles DELETE /api/groups/join
// Cancels the authenticated user's pending join request.
// Query params: groupId
func (h *Handler) CancelJoinRequest(w http.ResponseWriter, r *http.Request) {
	userId := utils.GetUserId(r)

	req := types.JoinRequest{
		UserId:  userId,
		GroupId: r.URL.Query().Get("groupId"),
	}

	if err := h.Services.Group.CancelJoinRequest(req); err != nil {
		HandleError(w, err)
		return
	}

	utils.WriteJson(w, http.StatusOK, nil)
}

// ============================================================
// GroupPosts — /api/groups/{id}/events
// ============================================================

func (h *Handler) GroupPosts(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		// h.GetGroupPosts(w, r)
	case http.MethodDelete:
		// h.CancelJoinRequest(w, r)
	default:
		utils.WriteJson(w, http.StatusMethodNotAllowed, map[string]any{
			"error": "Method not allowed",
		})
	}
}

// ============================================================
// Invitations (member-facing) — /api/groups/{id}/manage/invite
// ============================================================

// GroupInvitations routes GET, POST, DELETE for /api/groups/{id}/manage/invite
func (h *Handler) GroupInvitations(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		h.GetInvitableUsers(w, r)
	case http.MethodPost:
		h.CreateGroupInvitation(w, r)
	case http.MethodDelete:
		h.RevokeGroupInvitation(w, r)
	default:
		utils.WriteJson(w, http.StatusMethodNotAllowed, map[string]any{
			"error": "Method not allowed",
		})
	}
}

// GetInvitableUsers handles GET /api/groups/{id}/manage/invite
// Returns all non-members that can be invited, with an IsInvited flag.
func (h *Handler) GetInvitableUsers(w http.ResponseWriter, r *http.Request) {
	userId := utils.GetUserId(r)
	groupId := r.PathValue("id")
	query := r.URL.Query().Get("query")
	cursor := r.URL.Query().Get("cursor")

	list, err := h.Services.Group.GetInvitableUsers(groupId, userId, query, cursor)
	if err != nil {
		HandleError(w, err)
		return
	}

	utils.WriteJson(w, http.StatusOK, map[string]any{
		"users": list,
	})
}

// CreateGroupInvitation handles POST /api/groups/{id}/manage/invite
// Sends an invitation to a user. Only group members can invite.
// Body: { userId }
func (h *Handler) CreateGroupInvitation(w http.ResponseWriter, r *http.Request) {
	userId := utils.GetUserId(r)
	groupId := r.PathValue("id")

	inv := types.Invitation{}
	if err := json.NewDecoder(r.Body).Decode(&inv); err != nil {
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{
			"error": "Invalid request body",
		})
		return
	}
	inv.GroupId = groupId

	if err := h.Services.Group.CreateGroupInvitation(groupId, userId, inv); err != nil {
		HandleError(w, err)
		return
	}

	utils.WriteJson(w, http.StatusOK, nil)
}

// RevokeGroupInvitation handles DELETE /api/groups/{id}/manage/invite
// Revokes a previously sent invitation. Only group members can revoke.
// Query params: userId
func (h *Handler) RevokeGroupInvitation(w http.ResponseWriter, r *http.Request) {
	userId := utils.GetUserId(r)

	inv := types.Invitation{
		GroupId: r.PathValue("id"),
		UserId:  r.URL.Query().Get("userId"),
	}

	if err := h.Services.Group.RevokeGroupInvitation(inv.GroupId, userId, inv); err != nil {
		HandleError(w, err)
		return
	}

	utils.WriteJson(w, http.StatusOK, nil)
}

// ============================================================
// Join Requests (creator-facing) — /api/groups/{id}/manage/requests
// ============================================================

// GroupJoinRequests routes GET, POST, DELETE for /api/groups/{id}/manage/requests
func (h *Handler) GroupJoinRequests(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		h.ListJoinRequestUsers(w, r)
	case http.MethodPost:
		h.ApproveJoinRequest(w, r)
	case http.MethodDelete:
		h.RejectJoinRequest(w, r)
	default:
		utils.WriteJson(w, http.StatusMethodNotAllowed, map[string]any{
			"error": "Method not allowed",
		})
	}
}

// ListJoinRequestUsers handles GET /api/groups/{id}/manage/requests
// Returns all users with pending join requests. Creator only.
func (h *Handler) ListJoinRequestUsers(w http.ResponseWriter, r *http.Request) {
	userId := utils.GetUserId(r)
	groupId := r.PathValue("id")

	list, err := h.Services.Group.ListJoinRequestUsers(groupId, userId)
	if err != nil {
		HandleError(w, err)
		return
	}

	utils.WriteJson(w, http.StatusOK, map[string]any{
		"list": list,
	})
}

// ApproveJoinRequest handles POST /api/groups/{id}/manage/requests
// Approves a user's join request and adds them as a member. Creator only.
// Body: { userId }
func (h *Handler) ApproveJoinRequest(w http.ResponseWriter, r *http.Request) {
	userId := utils.GetUserId(r)
	groupId := r.PathValue("id")

	req := types.JoinRequest{}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{
			"error": "Invalid request body",
		})
		return
	}
	req.GroupId = groupId

	if err := h.Services.Group.ApproveJoinRequest(groupId, userId, req); err != nil {
		HandleError(w, err)
		return
	}

	utils.WriteJson(w, http.StatusOK, nil)
}

// RejectJoinRequest handles DELETE /api/groups/{id}/manage/requests
// Rejects and removes a user's join request. Creator only.
// Query params: userId
func (h *Handler) RejectJoinRequest(w http.ResponseWriter, r *http.Request) {
	userId := utils.GetUserId(r)

	req := types.JoinRequest{
		GroupId: r.PathValue("id"),
		UserId:  r.URL.Query().Get("userId"),
	}

	if err := h.Services.Group.RejectJoinRequest(req.GroupId, userId, req); err != nil {
		HandleError(w, err)
		return
	}

	utils.WriteJson(w, http.StatusOK, nil)
}

// ============================================================
// GroupEvents — /api/groups/{id}/events
// ============================================================

// Events routes GET, POST, PUT for /api/groups/{id}/events
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

// CreateEvent handles POST /api/groups/{id}/events
// Creates a new event in the group. Members only.
// Body: { title, description, date }
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

// GetEvents handles GET /api/groups/{id}/events
// Returns all events for the group. Members only.
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

// EventRespond handles PUT /api/groups/{id}/events
// Usertes the authenticated user's Response for an event.
// Body: { eventId, response (GOING | NOT_GOING) }
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

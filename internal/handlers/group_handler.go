package handlers

import (
	"encoding/json"
	"net/http"
	"soc-net/internal/types"
	"soc-net/internal/utils"
)

// ===== /api/groups
func (h *Handler) Groups(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		h.GetGroups(w, r)
	case http.MethodPost:
		h.CreateGroup(w, r)
	default:
		utils.WriteJson(w, map[string]any{"status": http.StatusMethodNotAllowed})
	}
}

func (h *Handler) CreateGroup(w http.ResponseWriter, r *http.Request) {
	userId := utils.GetUserId(r)

	if err := r.ParseMultipartForm(10 << 20); err != nil {
		utils.WriteJson(w, map[string]any{"status": http.StatusBadRequest})
		return
	}

	var fileName string
	file, fileHeader, err := r.FormFile("coverImage")
	if err != nil {
		if err != http.ErrMissingFile {
			utils.WriteJson(w, map[string]any{"status": http.StatusBadRequest})
			return
		}
	} else {
		fileName = fileHeader.Filename
	}

	input := types.GroupInput{
		CreatorId:      userId,
		Title:          r.FormValue("title"),
		Description:    r.FormValue("description"),
		CoverImage:     file,
		CoverImageName: fileName,
	}

	if err := h.Services.Group.CreateGroup(input); err != nil {
		HandleError(w, err)
		return
	}

	utils.WriteJson(w, map[string]any{"status": http.StatusOK})
}

func (h *Handler) GetGroups(w http.ResponseWriter, r *http.Request) {
	userId := utils.GetUserId(r)
	tab := r.URL.Query().Get("tab")
	query := r.URL.Query().Get("query")

	groups, err := h.Services.Group.ListGroups(userId, tab, query)
	if err != nil {
		HandleError(w, err)
		return
	}

	utils.WriteJson(w, map[string]any{
		"status": http.StatusOK,
		"groups": groups,
	})
}

func (h *Handler) Group(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.WriteJson(w, map[string]any{"status": http.StatusMethodNotAllowed})
		return
	}

	userId := utils.GetUserId(r)
	groupId := r.PathValue("id")

	group, err := h.Services.Group.GetGroup(groupId, userId)
	if err != nil {
		HandleError(w, err)
		return
	}

	utils.WriteJson(w, map[string]any{
		"status": http.StatusOK,
		"group":  group,
	})
}

// ===== /api/groups/join
func (h *Handler) JoinRequests(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodPost:
		h.SubmitJoinRequest(w, r)
	case http.MethodDelete:
		h.CancelJoinRequest(w, r)
	default:
		utils.WriteJson(w, map[string]any{"status": http.StatusMethodNotAllowed})
	}
}

func (h *Handler) SubmitJoinRequest(w http.ResponseWriter, r *http.Request) {
	userId := utils.GetUserId(r)

	req := types.JoinRequest{}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteJson(w, map[string]any{"status": http.StatusBadRequest})
		return
	}
	req.UserId = userId

	if err := h.Services.Group.SubmitJoinRequest(req); err != nil {
		HandleError(w, err)
		return
	}

	utils.WriteJson(w, map[string]any{"status": http.StatusOK})
}

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

	utils.WriteJson(w, map[string]any{"status": http.StatusOK})
}

// ===== /api/groups/{id}/manage/invite
func (h *Handler) GroupInvitations(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		h.GetInvitableUsers(w, r)
	case http.MethodPost:
		h.CreateGroupInvitation(w, r)
	case http.MethodDelete:
		h.RevokeGroupInvitation(w, r)
	default:
		utils.WriteJson(w, map[string]any{"status": http.StatusMethodNotAllowed})
	}
}

func (h *Handler) GetInvitableUsers(w http.ResponseWriter, r *http.Request) {
	userId := utils.GetUserId(r)
	groupId := r.PathValue("id")

	list, err := h.Services.Group.GetInvitableUsers(groupId, userId)
	if err != nil {
		HandleError(w, err)
		return
	}

	utils.WriteJson(w, map[string]any{
		"status": http.StatusOK,
		"list":   list,
	})
}

func (h *Handler) CreateGroupInvitation(w http.ResponseWriter, r *http.Request) {
	userId := utils.GetUserId(r)
	groupId := r.PathValue("id")

	inv := types.Invitation{}
	if err := json.NewDecoder(r.Body).Decode(&inv); err != nil {
		utils.WriteJson(w, map[string]any{"status": http.StatusBadRequest})
		return
	}
	inv.GroupId = groupId

	if err := h.Services.Group.CreateGroupInvitation(groupId, userId, inv); err != nil {
		HandleError(w, err)
		return
	}

	utils.WriteJson(w, map[string]any{"status": http.StatusOK})
}

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

	utils.WriteJson(w, map[string]any{"status": http.StatusOK})
}

// ===== /api/groups/{id}/manage/requests
func (h *Handler) GroupJoinRequests(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		h.ListJoinRequestUsers(w, r)
	case http.MethodPost:
		h.ApproveJoinRequest(w, r)
	case http.MethodDelete:
		h.RejectJoinRequest(w, r)
	default:
		utils.WriteJson(w, map[string]any{"status": http.StatusMethodNotAllowed})
	}
}

func (h *Handler) ListJoinRequestUsers(w http.ResponseWriter, r *http.Request) {
	userId := utils.GetUserId(r)
	groupId := r.PathValue("id")

	list, err := h.Services.Group.ListJoinRequestUsers(groupId, userId)
	if err != nil {
		HandleError(w, err)
		return
	}

	utils.WriteJson(w, map[string]any{
		"status": http.StatusOK,
		"list":   list,
	})
}

func (h *Handler) ApproveJoinRequest(w http.ResponseWriter, r *http.Request) {
	userId := utils.GetUserId(r)
	groupId := r.PathValue("id")

	req := types.JoinRequest{}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteJson(w, map[string]any{"status": http.StatusBadRequest})
		return
	}
	req.GroupId = groupId

	if err := h.Services.Group.ApproveJoinRequest(groupId, userId, req); err != nil {
		HandleError(w, err)
		return
	}

	utils.WriteJson(w, map[string]any{"status": http.StatusOK})
}

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

	utils.WriteJson(w, map[string]any{"status": http.StatusOK})
}

func (h *Handler) Events(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		h.GetEvents(w, r)
	case http.MethodPost:
		h.CreateEvent(w, r)
	default:
		utils.WriteJson(w, map[string]any{"status": http.StatusMethodNotAllowed})
	}
}

func (h *Handler) CreateEvent(w http.ResponseWriter, r *http.Request) {
	userId := utils.GetUserId(r)
	groupId := r.PathValue("id")

	event := types.Event{}
	if err := json.NewDecoder(r.Body).Decode(&event); err != nil {
		utils.WriteJson(w, map[string]any{"status": http.StatusBadRequest})
		return
	}

	event, err := h.Services.Group.CreateEvent(groupId, userId, event)
	if err != nil {
		HandleError(w, err)
		return
	}

	utils.WriteJson(w, map[string]any{
		"status": http.StatusOK,
		"event":  event,
	})
}

func (h *Handler) GetEvents(w http.ResponseWriter, r *http.Request) {
	userId := utils.GetUserId(r)
	groupId := r.PathValue("id")

	events, err := h.Services.Group.ListEvents(groupId, userId)
	if err != nil {
		HandleError(w, err)
		return
	}

	utils.WriteJson(w, map[string]any{
		"status": http.StatusOK,
		"events": events,
	})
}

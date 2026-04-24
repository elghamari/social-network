package handlers

import (
	"encoding/json"
	"net/http"
	"soc-net/internal/types"
	"soc-net/internal/utils"
)

// ===== Group Handlers
func (h *Handler) Groups(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		h.ListGroups(w, r)

	case http.MethodPost:
		h.CreateGroup(w, r)

	default:
		utils.WriteJson(w, map[string]any{
			"status": http.StatusMethodNotAllowed,
		})
	}
}

func (h *Handler) ListGroups(w http.ResponseWriter, r *http.Request) {

	userId := utils.GetUserId(r)

	tab := r.URL.Query().Get("tab")
	query := r.URL.Query().Get("query")

	groups, err := h.Services.Groups.ListGroups(userId, tab, query)
	if err != nil {
		HandleError(w, err)
		return
	}

	utils.WriteJson(w, map[string]any{
		"status": http.StatusOK,
		"groups": groups,
	})
}

func (h *Handler) CreateGroup(w http.ResponseWriter, r *http.Request) {

	userId := utils.GetUserId(r)

	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		utils.WriteJson(w, map[string]any{
			"status": http.StatusBadRequest,
		})
		return
	}

	var fileName string

	file, fileHeader, err := r.FormFile("coverImage")
	if err != nil {
		if err != http.ErrMissingFile {
			utils.WriteJson(w, map[string]any{
				"status": http.StatusBadRequest,
			})
			return
		}
	} else {
		fileName = fileHeader.Filename
	}

	input := types.GroupInput{
		CreatorId:   userId,
		Title:       r.FormValue("title"),
		Description: r.FormValue("description"),

		CoverImage:     file,
		CoverImageName: fileName,
	}

	err = h.Services.Groups.CreateGroup(input)
	if err != nil {
		HandleError(w, err)
		return
	}

	utils.WriteJson(w, map[string]any{
		"status": http.StatusOK,
	})
}

func (h *Handler) GetGroup(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.WriteJson(w, map[string]any{
			"status": http.StatusMethodNotAllowed,
		})
		return
	}

	userId := utils.GetUserId(r)
	groupId := r.PathValue("id")

	group, err := h.Services.Groups.GetGroup(userId, groupId)
	if err != nil {
		HandleError(w, err)
		return
	}

	utils.WriteJson(w, map[string]any{
		"status": http.StatusOK,
		"group":  group,
	})
}

// ===== JoinRequest Handlers
func (h *Handler) JoinRequest(w http.ResponseWriter, r *http.Request) {

	switch r.Method {
	case http.MethodDelete:
		h.DeleteJoinRequest(w, r)

	case http.MethodPost:
		h.CreateJoinRequest(w, r)

	default:
		utils.WriteJson(w, map[string]any{
			"status": http.StatusMethodNotAllowed,
		})
	}
}

func (h *Handler) CreateJoinRequest(w http.ResponseWriter, r *http.Request) {

	userId := utils.GetUserId(r)

	req := types.JoinRequest{}
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		utils.WriteJson(w, map[string]any{
			"status": http.StatusBadRequest,
		})
		return
	}

	req.UserId = userId

	err = h.Services.Groups.RequestToJoinGroup(req)
	if err != nil {
		HandleError(w, err)
		return
	}

	utils.WriteJson(w, map[string]any{
		"status": http.StatusOK,
	})
}

func (h *Handler) DeleteJoinRequest(w http.ResponseWriter, r *http.Request) {

	userId := utils.GetUserId(r)
	groupId := r.URL.Query().Get("groupId")

	req := types.JoinRequest{
		UserId:  userId,
		GroupId: groupId,
	}

	err := h.Services.Groups.CancelToJoinGroup(req)
	if err != nil {
		HandleError(w, err)
		return
	}

	utils.WriteJson(w, map[string]any{
		"status": http.StatusOK,
	})
}

// ===== Group Manage Handler
func (h *Handler) ListInvitableUsers(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.WriteJson(w, map[string]any{
			"status": http.StatusMethodNotAllowed,
		})
		return
	}

	userId := utils.GetUserId(r)
	groupId := r.URL.Query().Get("groupId")

	list, err := h.Services.Groups.ListInvitableUsers(userId, groupId)
	if err != nil {
		HandleError(w, err)
		return
	}

	utils.WriteJson(w, map[string]any{
		"status": http.StatusOK,
		"list":   list,
	})
}

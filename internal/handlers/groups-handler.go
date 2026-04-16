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

	tab := r.URL.Query().Get("tab")
	query := r.URL.Query().Get("query")

	groups, err := h.Services.Groups.ListGroups(tab, query)
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
	if r.Method != http.MethodPost {
		utils.WriteJson(w, map[string]any{
			"status": http.StatusMethodNotAllowed,
		})
		return
	}

	input := types.GroupInput{}
	err := json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		utils.WriteJson(w, map[string]any{
			"status": http.StatusBadRequest,
		})
		return
	}

	// input.CreatorId = utils.GetUserId(r)
	input.CreatorId = "user"

	group, err := h.Services.Groups.CreateGroup(input)
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
	req := types.JoinRequest{}
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		utils.WriteJson(w, map[string]any{
			"status": http.StatusBadRequest,
			"fields": map[string]string{
				"input": "Invalid Input",
			},
		})
		return
	}

	req.UserId = "user"

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

	req := types.JoinRequest{
		UserId:  "user",
		GroupId: r.URL.Query().Get("groupId"),
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

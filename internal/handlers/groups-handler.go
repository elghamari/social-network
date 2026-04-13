package handlers

import (
	"encoding/json"
	"net/http"
	"soc-net/internal/types"
	"soc-net/internal/utils"
)

func (h *Handler) Groups(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.WriteJson(w, map[string]any{
			"status": http.StatusMethodNotAllowed,
		})
		return
	}

	tab := r.URL.Query().Get("tab")
	query := r.URL.Query().Get("query")

	groups, err := h.Services.Groups.FetchGroups(tab, query)
	if err != nil {
		HandleError(w, err)
		return
	}

	utils.WriteJson(w, map[string]any{
		"status": http.StatusOK,
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

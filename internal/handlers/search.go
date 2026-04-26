package handlers

import (
	"net/http"

	"soc-net/internal/utils"
)

func (h *Handler) Search(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")

	if len(query) < 2 {
		utils.WriteJson(w, map[string]any{
			"status": http.StatusOK,
			"users":  []any{},
		})
		return
	}

	users, err := h.Services.Search.SearchUsers(query)
	if err != nil {
		utils.WriteJson(w, map[string]any{
			"status": http.StatusInternalServerError,
			"error":  err.Error(),
		})
		return
	}

	utils.WriteJson(w, map[string]any{
		"status": http.StatusOK,
		"users":  users,
	})
}

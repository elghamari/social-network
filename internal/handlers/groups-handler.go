package handlers

import (
	"net/http"
	"soc-net/internal/utils"
)

func (h *Handler) Groups(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.WriteJson(w, map[string]any{
			"status": http.StatusMethodNotAllowed,
		})
	}

	
}

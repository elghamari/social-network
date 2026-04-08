package handlers

import (
	"encoding/json"
	"log"
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

	input.CreatorId = utils.GetUserId(r)

	group, err := h.Services.Groups.AddGroup(input)
	if err != nil {
		code := ErrorCode(err)
		if code != "" {
			utils.WriteJson(w, map[string]any{
				"status": http.StatusBadRequest,
				"code":   code,
			})
			return
		}
		utils.WriteJson(w, map[string]any{
			"status": http.StatusInternalServerError,
		})
		log.Println(err)
		return
	}

	utils.WriteJson(w, map[string]any{
		"status": http.StatusOK,
		"group":  group,
	})
}

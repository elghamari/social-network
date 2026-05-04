package handlers

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"soc-net/internal/services"
	"soc-net/internal/utils"
)

func (h *Handler) ToggleReaction(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteJson(w, http.StatusMethodNotAllowed, map[string]any{
			"error": "method not allowed",
		})
		return
	}

	userId := utils.GetUserId(r)

	postIdStr := r.URL.Query().Get("postId")
	if postIdStr == "" {
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{
			"error": "post ID is required",
		})
		return
	}

	postId, err := strconv.Atoi(postIdStr)
	if err != nil {
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{
			"error": "invalid post ID",
		})
		return
	}

	isLiked, totalLikes, err := h.Services.Reactions.UpdateReaction(userId, postId)
	if err != nil {
		if errors.Is(err, services.ErrPostNotFound) {
			utils.WriteJson(w, http.StatusNotFound, map[string]any{
				"error": err.Error(),
			})
			return
		}
		if errors.Is(err, services.ErrUnauthorizedAccess) {
			utils.WriteJson(w, http.StatusForbidden, map[string]any{
				"error": err.Error(),
			})
			return
		}

		fmt.Println("ToggleReaction Error:", err)
		utils.WriteJson(w, http.StatusInternalServerError, map[string]any{
			"error": "internal server error",
		})
		return
	}

	utils.WriteJson(w, http.StatusOK, map[string]any{
		"message":     "Reaction updated successfully",
		"is_liked":    isLiked,
		"total_likes": totalLikes,
	})
}

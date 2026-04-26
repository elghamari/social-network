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
		utils.WriteJson(w, map[string]any{"status": http.StatusMethodNotAllowed, "error": "method not allowed"})
		return
	}

	userId := utils.GetUserId(r)

	postIdStr := r.URL.Query().Get("postId")
	if postIdStr == "" {
		utils.WriteJson(w, map[string]any{"status": http.StatusBadRequest, "error": "post ID is required"})
		return
	}

	postId, err := strconv.Atoi(postIdStr)
	if err != nil {
		utils.WriteJson(w, map[string]any{"status": http.StatusBadRequest, "error": "invalid post ID"})
		return
	}

	isLiked, totalLikes, err := h.Services.Reactions.UpdateReaction(userId, postId)
	if err != nil {
		if errors.Is(err, services.ErrPostNotFound) {
			utils.WriteJson(w, map[string]any{"status": http.StatusNotFound, "error": err.Error()})
			return
		}
		if errors.Is(err, services.ErrUnauthorizedAccess) {
			utils.WriteJson(w, map[string]any{"status": http.StatusForbidden, "error": err.Error()})
			return
		}

		fmt.Println("ToggleReaction Error:", err)
		utils.WriteJson(w, map[string]any{"status": http.StatusInternalServerError, "error": "internal server error"})
		return
	}

	utils.WriteJson(w, map[string]any{
		"status":      http.StatusOK,
		"message":     "Reaction updated successfully",
		"is_liked":    isLiked,
		"total_likes": totalLikes,
	})
}

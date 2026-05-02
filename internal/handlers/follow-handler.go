package handlers

import (
	"net/http"

	"soc-net/internal/utils"
)

// POST /api/follow?target_id=<id>
func (h *Handler) FollowUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteJson(w, http.StatusMethodNotAllowed, map[string]any{"error": "Method not allowed"})
		return
	}

	userID := utils.GetUserId(r)
	targetID := r.URL.Query().Get("target_id")

	if targetID == "" {
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{"error": "target_id is required"})
		return
	}
	if userID == targetID {
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{"error": "cannot follow yourself"})
		return
	}

	finalStatus, err := h.Services.Follow.FollowUser(userID, targetID)
	if err != nil {
		utils.WriteJson(w, http.StatusInternalServerError, map[string]any{"error": "action failed"})
		return
	}

	utils.WriteJson(w, http.StatusOK, map[string]any{"follow_status": finalStatus})
}

// POST /api/follow/accept?target_id=<id>
func (h *Handler) AcceptFollowRequest(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteJson(w, http.StatusMethodNotAllowed, map[string]any{"error": "Method not allowed"})
		return
	}

	userID := utils.GetUserId(r)
	senderID := r.URL.Query().Get("target_id")

	if senderID == "" {
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{"error": "target_id is required"})
		return
	}

	if err := h.Services.Follow.AcceptFollowRequest(senderID, userID); err != nil {
		utils.WriteJson(w, http.StatusNotFound, map[string]any{"error": err.Error()})
		return
	}

	utils.WriteJson(w, http.StatusOK, map[string]any{"message": "request accepted"})
}

// POST /api/follow/decline?target_id=<id>
func (h *Handler) DeclineFollowRequest(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteJson(w, http.StatusMethodNotAllowed, map[string]any{"error": "Method not allowed"})
		return
	}

	userID := utils.GetUserId(r)
	senderID := r.URL.Query().Get("target_id")

	if senderID == "" {
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{"error": "target_id is required"})
		return
	}

	if err := h.Services.Follow.DeclineFollowRequest(senderID, userID); err != nil {
		utils.WriteJson(w, http.StatusInternalServerError, map[string]any{"error": "action failed"})
		return
	}

	utils.WriteJson(w, http.StatusOK, map[string]any{"message": "request declined"})
}

// DELETE /api/follow?target_id=<id>
func (h *Handler) UnfollowUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		utils.WriteJson(w, http.StatusMethodNotAllowed, map[string]any{"error": "Method not allowed"})
		return
	}

	userID := utils.GetUserId(r)
	targetID := r.URL.Query().Get("target_id")

	if targetID == "" {
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{"error": "target_id is required"})
		return
	}

	if err := h.Services.Follow.UnfollowUser(userID, targetID); err != nil {
		utils.WriteJson(w, http.StatusInternalServerError, map[string]any{"error": "action failed"})
		return
	}

	utils.WriteJson(w, http.StatusOK, map[string]any{"message": "unfollowed successfully"})
}
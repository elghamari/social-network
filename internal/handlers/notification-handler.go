package handlers

import (
	"encoding/json"
	"net/http"

	"soc-net/internal/types"
	"soc-net/internal/utils"
)

// GET /api/notifications
func (h *Handler) GetMyNotifications(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.WriteJson(w, http.StatusMethodNotAllowed, map[string]any{"error": "Method not allowed"})
		return
	}

	userID := utils.GetUserId(r)
	if userID == "" {
		HandleError(w, types.NewForbiddenError("unauthorized access"))
		return
	}

	notifs, err := h.Services.Notification.GetUserNotifications(userID)
	if err != nil {
		HandleError(w, err)
		return
	}

	if notifs == nil {
		notifs = []types.Notification{}
	}

	utils.WriteJson(w, http.StatusOK, map[string]any{
		"data": notifs,
	})
}

// POST /api/notifications/read
func (h *Handler) MarkNotificationAsRead(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteJson(w, http.StatusMethodNotAllowed, map[string]any{"error": "Method not allowed"})
		return
	}

	userID := utils.GetUserId(r)
	if userID == "" {
		HandleError(w, types.NewForbiddenError("unauthorized access"))
		return
	}

	var input struct {
		NotificationID int `json:"notification_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		HandleError(w, types.NewActionError("invalid request body"))
		return
	}

	if input.NotificationID <= 0 {
		HandleError(w, types.NewActionError("notification_id is required"))
		return
	}

	err := h.Services.Notification.MarkAsRead(input.NotificationID, userID)
	if err != nil {
		HandleError(w, err)
		return
	}

	utils.WriteJson(w, http.StatusOK, map[string]any{
		"message": "notification marked as read",
	})
}
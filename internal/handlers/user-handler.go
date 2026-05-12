package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"soc-net/internal/types"
	"soc-net/internal/utils"
)

// POST /api/follow?target_id=<id>
func (h *Handler) FollowUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteJson(w, http.StatusMethodNotAllowed, nil)
		return
	}

	userID := utils.GetUserId(r)
	targetID := r.URL.Query().Get("target_id")

	if targetID == "" {
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{
			"error": "target_id is required",
		})
		return
	}
	if userID == targetID {
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{
			"error": "cannot follow yourself",
		})
		return
	}

	finalStatus, err := h.Services.User.FollowUser(userID, targetID)
	if err != nil {
		utils.WriteJson(w, http.StatusInternalServerError, map[string]any{
			"error": "action failed",
		})
		return
	}

	// --------------------------------------------------------
	// Notification Logic for Follow
	// --------------------------------------------------------
	var notif types.Notification
	var shouldNotify bool

	if finalStatus == "pending" {
		notif = types.Notification{
			Type:       "follow_request",
			SenderID:   userID,
			ReceiverID: targetID,
			EntityID:   userID,
			Content:    "requested to follow you",
		}
		shouldNotify = true
	} else if finalStatus == "following" {
		notif = types.Notification{
			Type:       "follow",
			SenderID:   userID,
			ReceiverID: targetID,
			EntityID:   userID,
			Content:    "started following you",
		}
		shouldNotify = true
	}

	if shouldNotify {
		savedNotif, err := h.Services.Notification.CreateNotification(notif)
		if err != nil {
			log.Printf("Failed to save notification for user %s: %v", targetID, err)
		} else {
			h.Hub.PushNotification([]string{targetID}, savedNotif)
		}
	}
	// --------------------------------------------------------

	utils.WriteJson(w, http.StatusOK, map[string]any{
		"follow_status": finalStatus,
	})
}

// POST /api/follow/accept?target_id=<id>
func (h *Handler) AcceptFollowRequest(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteJson(w, http.StatusMethodNotAllowed, nil)
		return
	}

	userID := utils.GetUserId(r)
	senderID := r.URL.Query().Get("target_id")

	if senderID == "" {
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{
			"error": "target_id is required",
		})
		return
	}

	if err := h.Services.User.AcceptFollowRequest(senderID, userID); err != nil {
		HandleError(w, err)
		return
	}

	// --------------------------------------------------------
	// Notification Logic for Accept
	// --------------------------------------------------------
	if err := h.Services.Notification.DeleteNotification(userID, senderID, "follow_request"); err != nil {
		log.Printf("Non-critical error: failed to delete follow_request notification for user %s: %v", userID, err)
	}

	notif := types.Notification{
		Type:       "follow_accept",
		SenderID:   userID,
		ReceiverID: senderID,
		EntityID:   userID,
		Content:    "accepted your follow request",
	}

	savedNotif, err := h.Services.Notification.CreateNotification(notif)
	if err == nil {
		h.Hub.PushNotification([]string{senderID}, savedNotif)
	} else {
		log.Printf("Failed to save accept notification for user %s: %v", senderID, err)
	}
	// --------------------------------------------------------

	utils.WriteJson(w, http.StatusOK, nil)
}

// POST /api/follow/decline?target_id=<id>
func (h *Handler) DeclineFollowRequest(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteJson(w, http.StatusMethodNotAllowed, nil)
		return
	}

	userID := utils.GetUserId(r)
	senderID := r.URL.Query().Get("target_id")

	if senderID == "" {
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{
			"error": "target_id is required",
		})
		return
	}

	if err := h.Services.User.DeclineFollowRequest(senderID, userID); err != nil {
		utils.WriteJson(w, http.StatusInternalServerError, map[string]any{
			"error": "action failed",
		})
		return
	}

	// --------------------------------------------------------
	// Notification Logic for Decline
	// --------------------------------------------------------
	if err := h.Services.Notification.DeleteNotification(userID, senderID, "follow_request"); err != nil {
		log.Printf("Non-critical error: failed to delete follow_request notification for user %s: %v", userID, err)
	}
	// --------------------------------------------------------

	utils.WriteJson(w, http.StatusOK, nil)
}

// DELETE /api/follow?target_id=<id>
func (h *Handler) UnfollowUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		utils.WriteJson(w, http.StatusMethodNotAllowed, nil)
		return
	}

	userID := utils.GetUserId(r)
	targetID := r.URL.Query().Get("target_id")

	if targetID == "" {
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{
			"error": "target_id is required",
		})
		return
	}

	if err := h.Services.Notification.DeleteNotification(targetID, userID, "follow_request"); err != nil {
		log.Println(err)
	}
	if err := h.Services.Notification.DeleteNotification(targetID, userID, "follow"); err != nil {
		log.Println("Delete follow notif:", err)
	}
	if err := h.Services.User.UnfollowUser(userID, targetID); err != nil {
		utils.WriteJson(w, http.StatusInternalServerError, map[string]any{
			"error": "action failed",
		})
		return
	}

	utils.WriteJson(w, http.StatusOK, nil)
}

// GET /api/me
func (h *Handler) GetMe(w http.ResponseWriter, r *http.Request) {
	userID := utils.GetUserId(r)

	user, err := h.Services.Auth.GetUserById(userID)
	if err != nil {
		utils.WriteJson(w, http.StatusNotFound, map[string]any{"error": "user not found"})
		return
	}

	safeStr := func(s *string) string {
		if s == nil {
			return ""
		}
		return *s
	}

	followers, _ := h.Services.User.GetFollowers(userID)
	following, _ := h.Services.User.GetFollowing(userID)
	pending, _ := h.Services.User.GetPendingRequests(userID)

	utils.WriteJson(w, http.StatusOK, map[string]any{
		"user": map[string]any{
			"id":               user.ID,
			"first_name":       user.FirstName,
			"last_name":        user.LastName,
			"is_public":        user.IsPublic,
			"email":            user.Email,
			"avatar":           safeStr(user.Avatar),
			"about_me":         safeStr(user.AboutMe),
			"nickname":         safeStr(user.Nickname),
			"date_of_birth":    user.DateOfBirth,
			"follow_status":    "owner",
			"followers":        followers,
			"following":        following,
			"pending_requests": pending,
		},
	})
}

// GET /api/profile?profile_id=<id>
func (h *Handler) GetProfile(w http.ResponseWriter, r *http.Request) {
	viewerID := utils.GetUserId(r)
	targetID := r.URL.Query().Get("profile_id")
	if targetID == "" {
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{
			"errors": "profile_id is required",
		})
		return
	}

	target, err := h.Services.Auth.GetUserById(targetID)
	if err != nil {
		utils.WriteJson(w, http.StatusNotFound, map[string]any{
			"errors": "user not found",
		})
		return
	}

	followStatus, _ := h.Services.User.GetFollowStatus(viewerID, targetID)
	isOwner := viewerID == targetID
	canView := target.IsPublic || followStatus == "following" || isOwner

	var followers, following, pending []types.FollowerInfo
	if canView {
		followers, _ = h.Services.User.GetFollowers(targetID)
		following, _ = h.Services.User.GetFollowing(targetID)
		if isOwner {
			pending, _ = h.Services.User.GetPendingRequests(targetID)
		}
	}
	safeStr := func(s *string) string {
		if s == nil {
			return ""
		}
		return *s
	}
	utils.WriteJson(w, http.StatusOK, map[string]any{
		"user": types.UserProfileResponse{
			ID:              target.ID,
			FirstName:       target.FirstName,
			LastName:        target.LastName,
			IsPublic:        target.IsPublic,
			FollowStatus:    followStatus,
			Followers:       followers,
			Following:       following,
			Email:           target.Email,
			Avatar:          safeStr(target.Avatar),
			AboutMe:         safeStr(target.AboutMe),
			Nickname:        safeStr(target.Nickname),
			DateOfBirth:     target.DateOfBirth,
			PendingRequests: pending,
		},
	})
}

// PUT /api/profile/privacy
func (h *Handler) TogglePrivacy(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		utils.WriteJson(w, http.StatusMethodNotAllowed, map[string]any{"error": "Method not allowed"})
		return
	}

	var payload struct {
		IsPublic bool `json:"is_public"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{"error": "Invalid payload"})
		return
	}
	defer r.Body.Close()

	userID := utils.GetUserId(r)
	if payload.IsPublic {
		if err := h.Services.User.AcceptAllFollowRequests(userID); err != nil {
			utils.WriteJson(w, http.StatusInternalServerError, map[string]any{"error": "Failed to accept pending requests"})
			return
		}
	}
	if err := h.Services.Auth.UpdatePrivacy(userID, payload.IsPublic); err != nil {
		utils.WriteJson(w, http.StatusInternalServerError, map[string]any{"error": "Update failed"})
		return
	}

	utils.WriteJson(w, http.StatusOK, map[string]any{
		"is_public": payload.IsPublic,
	})
}

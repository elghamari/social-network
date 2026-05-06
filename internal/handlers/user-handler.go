package handlers

import (
	"encoding/json"
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
		utils.WriteJson(w, http.StatusNotFound, map[string]any{
			"error": err.Error(),
		})
		return
	}

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
		utils.WriteJson(w, http.StatusNotFound, map[string]any{
			"error": "user not found",
		})
		return
	}

	followers, _ := h.Services.User.GetFollowers(userID)
	following, _ := h.Services.User.GetFollowing(userID)
	pending, _ := h.Services.User.GetPendingRequests(userID)

	utils.WriteJson(w, http.StatusOK, map[string]any{
		"user": types.UserProfileResponse{
			ID:              user.ID,
			FirstName:       user.FirstName,
			LastName:        user.LastName,
			IsPublic:        user.IsPublic,
			Email:           user.Email,
			Avatar:          *user.Avatar,
			AboutMe:         *user.AboutMe,
			Nickname:        *user.Nickname,
			DateOfBirth:     user.DateOfBirth,
			FollowStatus:    "owner",
			Followers:       followers,
			Following:       following,
			PendingRequests: pending,
		},
	})
}

// GET /api/profile?profile_id=<id>
func (h *Handler) GetProfile(w http.ResponseWriter, r *http.Request) {
	viewerID := utils.GetUserId(r)
	targetID := r.URL.Query().Get("profile_id")

	if targetID == "" {
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{
			"error": "profile_id is required",
		})
		return
	}

	target, err := h.Services.Auth.GetUserById(targetID)
	if err != nil {
		utils.WriteJson(w, http.StatusNotFound, map[string]any{
			"error": "user not found",
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
			Avatar:          *target.Avatar,
			AboutMe:         *target.AboutMe,
			Nickname:        *target.Nickname,
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

	if err := h.Services.Auth.UpdatePrivacy(userID, payload.IsPublic); err != nil {
		utils.WriteJson(w, http.StatusInternalServerError, map[string]any{"error": "Update failed"})
		return
	}

	utils.WriteJson(w, http.StatusOK, map[string]any{
		"is_public": payload.IsPublic,
	})
}

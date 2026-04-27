package handlers

import (
	"encoding/json"
	"net/http"

	"soc-net/internal/types"
	"soc-net/internal/utils"
)

// GET /api/me
func (h *Handler) GetMe(w http.ResponseWriter, r *http.Request) {
	userID := utils.GetUserId(r)

	user, err := h.Services.Auth.GetUserById(userID)
	if err != nil {
		utils.WriteJson(w, map[string]any{
			"status": http.StatusNotFound,
			"error":  "user not found",
		})
		return
	}

	followers, _ := h.Services.Follow.GetFollowers(userID)
	following, _ := h.Services.Follow.GetFollowing(userID)
	pending, _ := h.Services.Follow.GetPendingRequests(userID)

	utils.WriteJson(w, map[string]any{
		"status": http.StatusOK,
		"user": types.UserProfileResponse{
			ID:              user.ID,
			FirstName:       user.FirstName,
			LastName:        user.LastName,
			IsPublic:        user.IsPublic,
			Email:           user.Email,
			AboutMe:         *user.AboutMe,
			Nickname:        *user.Nickname,
			DateOfBirth:     user.DateOfBirth,
			FollowStatus:    "owner",
			Avatar:          *user.Avatar,
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
		utils.WriteJson(w, map[string]any{
			"status": http.StatusBadRequest,
			"error":  "profile_id is required",
		})
		return
	}

	target, err := h.Services.Auth.GetUserById(targetID)
	if err != nil {
		utils.WriteJson(w, map[string]any{
			"status": http.StatusNotFound,
			"error":  "user not found",
		})
		return
	}

	followStatus, _ := h.Services.Follow.GetFollowStatus(viewerID, targetID)
	isOwner := viewerID == targetID

	if isOwner {
		followStatus = "owner"
	}

	canView := target.IsPublic || followStatus == "following" || isOwner

	var followers, following, pending []types.FollowerInfo
	if canView {
		followers, _ = h.Services.Follow.GetFollowers(targetID)
		following, _ = h.Services.Follow.GetFollowing(targetID)
		if isOwner {
			pending, _ = h.Services.Follow.GetPendingRequests(targetID)
		}
	}

	utils.WriteJson(w, map[string]any{
		"status": http.StatusOK,
		"user": types.UserProfileResponse{
			ID:              target.ID,
			FirstName:       target.FirstName,
			LastName:        target.LastName,
			Avatar:          *target.Avatar,
			Email:           target.Email,
			AboutMe:         *target.AboutMe,
			Nickname:        *target.Nickname,
			DateOfBirth:     target.DateOfBirth,
			IsPublic:        target.IsPublic,
			FollowStatus:    followStatus,
			Followers:       followers,
			Following:       following,
			PendingRequests: pending,
		},
	})
}

// PUT /api/profile/privacy
func (h *Handler) TogglePrivacy(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		utils.WriteJson(w, map[string]any{"status": http.StatusMethodNotAllowed})
		return
	}

	var payload struct {
		IsPublic bool `json:"is_public"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		utils.WriteJson(w, map[string]any{"status": http.StatusBadRequest, "error": "Invalid payload"})
		return
	}
	defer r.Body.Close()

	userID := utils.GetUserId(r)

	if err := h.Services.Auth.UpdatePrivacy(userID, payload.IsPublic); err != nil {
		utils.WriteJson(w, map[string]any{"status": http.StatusInternalServerError, "error": "Update failed"})
		return
	}

	utils.WriteJson(w, map[string]any{
		"status":    http.StatusOK,
		"is_public": payload.IsPublic,
	})
}

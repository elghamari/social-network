package handlers

import (
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
			IsPublic:        target.IsPublic,
			FollowStatus:    followStatus,
			Followers:       followers,
			Following:       following,
			PendingRequests: pending,
		},
	})
}

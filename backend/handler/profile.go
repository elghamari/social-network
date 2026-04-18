package handler

import (
	"net/http"

	"socialnetwork/modle"
	"socialnetwork/utils"
)

// GetMe returns the profile of the currently authenticated user.
// GET /me
func (h *Handler) GetMe(w http.ResponseWriter, r *http.Request) {
	userID := utils.GetUserId(r)
	if userID == "" {
		utils.WriteJson(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	userInfo, err := h.Services.AuthSrv.GetUserById(userID)
	if err != nil {
		utils.WriteJson(w, http.StatusInternalServerError, "user not found")
		return
	}

	followers, _ := h.Services.FollowSrv.GetFollowers(userID)
	following, _ := h.Services.FollowSrv.GetFollowing(userID)
	pending, _ := h.Services.FollowSrv.GetPendingRequests(userID)

	response := modle.UserProfileResponse{
		ID:              userInfo.ID,
		FirstName:       userInfo.FirstName,
		LastName:        userInfo.LastName,
		Followers:       followers,
		Following:       following,
		PendingRequests: pending,
	}
	utils.WriteJson(w, http.StatusOK, response)
}

// GetUserById returns the profile of any user by their ID.
// GET /profile?profile_id=<uuid>
func (h *Handler) GetUserById(w http.ResponseWriter, r *http.Request) {
	viewerID := utils.GetUserId(r)
	targetID := r.URL.Query().Get("profile_id")

	if targetID == "" {
		utils.WriteJson(w, http.StatusBadRequest, "profile_id is required")
		return
	}

	userTarget, err := h.Services.AuthSrv.GetUserById(targetID)
	if err != nil {
		utils.WriteJson(w, http.StatusNotFound, "user not found")
		return
	}

	followStatus, _ := h.Services.FollowSrv.GetFollowStatus(viewerID, targetID)

	isOwner := viewerID == targetID
	canViewFullProfile := userTarget.IsPublic || followStatus == "following" || isOwner

	var followers, following, pending []modle.FollowerInfo

	if canViewFullProfile {
		followers, _ = h.Services.FollowSrv.GetFollowers(targetID)
		following, _ = h.Services.FollowSrv.GetFollowing(targetID)
		if isOwner {
			pending, _ = h.Services.FollowSrv.GetPendingRequests(targetID)
		}
	}

	response := modle.UserProfileResponse{
		ID:              userTarget.ID,
		FirstName:       userTarget.FirstName,
		LastName:        userTarget.LastName,
		IsPublic:        userTarget.IsPublic,
		FollowStatus:    followStatus,
		Followers:       followers,
		Following:       following,
		PendingRequests: pending,
	}

	utils.WriteJson(w, http.StatusOK, response)
}

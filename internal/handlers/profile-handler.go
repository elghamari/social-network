package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"soc-net/internal/types"
	"soc-net/internal/utils"
)

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

	followers, _ := h.Services.Follow.GetFollowers(userID)
	following, _ := h.Services.Follow.GetFollowing(userID)
	pending, err := h.Services.Follow.GetPendingRequests(userID)
	if err != nil {
		fmt.Println("err------------------")
		return
	}

	aboutMe, nickname, avatar := "", "", ""
	if user.AboutMe != nil {
		aboutMe = *user.AboutMe
	}
	if user.Nickname != nil {
		nickname = *user.Nickname
	}
	if user.Avatar != nil {
		avatar = *user.Avatar
	}

	utils.WriteJson(w, http.StatusOK, map[string]any{
		"user": types.UserProfileResponse{
			ID:              user.ID,
			FirstName:       user.FirstName,
			LastName:        user.LastName,
			IsPublic:        user.IsPublic,
			Email:           user.Email,
			AboutMe:         aboutMe,
			Nickname:        nickname,
			DateOfBirth:     user.DateOfBirth,
			FollowStatus:    "owner",
			Avatar:          avatar,
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

	// حتى هنا خاصنا نـ checkiw على nil باش ما يطيحش السيرفر
	aboutMe, nickname, avatar := "", "", ""
	if target.AboutMe != nil {
		aboutMe = *target.AboutMe
	}
	if target.Nickname != nil {
		nickname = *target.Nickname
	}
	if target.Avatar != nil {
		avatar = *target.Avatar
	}

	utils.WriteJson(w, http.StatusOK, map[string]any{
		"user": types.UserProfileResponse{
			ID:              target.ID,
			FirstName:       target.FirstName,
			LastName:        target.LastName,
			Avatar:          avatar,
			Email:           target.Email,
			AboutMe:         aboutMe,
			Nickname:        nickname,
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

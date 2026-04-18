package handler

import (
	"net/http"

	"socialnetwork/utils"
)

/*
**
POST /api/follow/{id}
***
*/
func (h *Handler) FollowUser(w http.ResponseWriter, r *http.Request) {
	userID := utils.GetUserId(r)
	if userID == "" {
		utils.WriteJson(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	targetID := r.URL.Query().Get("target_id")
	if targetID == "" {
		utils.WriteJson(w, http.StatusBadRequest, map[string]string{"error": "target_id is required"})
		return
	}

	if userID == targetID {
		utils.WriteJson(w, http.StatusBadRequest, map[string]string{"error": "You cannot follow yourself"})
		return
	}

	status, err := h.Services.FollowSrv.GetFollowStatus(userID, targetID)
	if err != nil {
		utils.WriteJson(w, http.StatusInternalServerError, map[string]string{"error": "Database error"})
		return
	}
	if status != "none" {
		utils.WriteJson(w, http.StatusBadRequest, map[string]string{"error": "Request already exists", "status": status})
		return
	}

	isPublic, err := h.Services.FollowSrv.IsUserPublic(targetID)
	if err != nil {
		utils.WriteJson(w, http.StatusNotFound, map[string]string{"error": "User not found"})
		return
	}

	var finalStatus string
	if isPublic {
		err = h.Services.FollowSrv.FollowUserDirectly(userID, targetID)
		finalStatus = "following"
	} else {
		err = h.Services.FollowSrv.SendFollowRequest(userID, targetID)
		finalStatus = "pending"
	}

	if err != nil {
		utils.WriteJson(w, http.StatusInternalServerError, map[string]string{"error": "Action failed"})
		return
	}

	utils.WriteJson(w, http.StatusOK, map[string]string{
		"message": "Action completed successfully",
		"status":  finalStatus,
	})
}

/*
**
POST /api/follow/accept/{id}
***
*/

func (h *Handler) AcceptRequest(w http.ResponseWriter, r *http.Request) {
	userID := utils.GetUserId(r)
	if userID == "" {
		utils.WriteJson(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	targetID := r.URL.Query().Get("target_id")
	if targetID == "" {
		utils.WriteJson(w, http.StatusBadRequest, map[string]string{"error": "target_id is required"})
		return
	}

	err := h.Services.FollowSrv.AcceptFollowRequest(targetID, userID)
	if err != nil {
		if err.Error() == "no pending request found" {
			utils.WriteJson(w, http.StatusNotFound, map[string]string{"error": err.Error()})
		} else {
			utils.WriteJson(w, http.StatusInternalServerError, map[string]string{"error": "Database error"})
		}
		return
	}

	utils.WriteJson(w, http.StatusOK, map[string]string{"message": "Follow request accepted"})
}

func (h *Handler) DeclineFollowRequest(w http.ResponseWriter, r *http.Request) {
	userID := utils.GetUserId(r)
	if userID == "" {
		utils.WriteJson(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	targetID := r.URL.Query().Get("target_id")
	if targetID == "" {
		utils.WriteJson(w, http.StatusBadRequest, map[string]string{"error": "target_id is required"})
		return
	}

	err := h.Services.FollowSrv.DeclineFollowRequest(targetID, userID)
	if err != nil {

		utils.WriteJson(w, http.StatusInternalServerError, map[string]string{"error": "Database error"})

		return
	}

	utils.WriteJson(w, http.StatusOK, map[string]string{"message": "Follow request declined"})
}

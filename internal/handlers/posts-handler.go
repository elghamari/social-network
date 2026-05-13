package handlers

import (
	"net/http"
	"strconv"

	"soc-net/internal/types"
	"soc-net/internal/utils"
)

func (h *Handler) CreatePost(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteJson(w, http.StatusMethodNotAllowed, map[string]any{
			"error": "method not allowed",
		})
		return
	}

	userId := utils.GetUserId(r)

	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{
			"error": "failed to parse form data, file might be too large",
		})
		return
	}

	title := r.FormValue("title")
	description := r.FormValue("description")
	privacy := r.FormValue("privacy")
	groupIdStr := r.PathValue("id")
	privateUsers := r.Form["privateUsers"]

	var groupId *int
	if groupIdStr != "" {
		id, err := strconv.Atoi(groupIdStr)
		if err != nil {
			utils.WriteJson(w, http.StatusBadRequest, map[string]any{
				"error": "invalid group ID",
			})
			return
		}
		groupId = &id
	}

	imageUrl, err := utils.HandleImageUpload(r, "image")
	if err != nil {
		HandleError(w, err)
		return
	}

	input := types.PostInput{
		UserId:       userId,
		Title:        title,
		Description:  description,
		Privacy:      privacy,
		GroupId:      groupId,
		ImageUrl:     imageUrl,
		PrivateUsers: privateUsers,
	}

	postId, err := h.Services.Posts.CreatePost(input)
	if err != nil {
		HandleError(w, err)
		return
	}

	utils.WriteJson(w, http.StatusCreated, map[string]any{
		"message": "Post created successfully",
		"postId":  postId,
	})
}

func (h *Handler) GetFeedPosts(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.WriteJson(w, http.StatusMethodNotAllowed, map[string]any{
			"error": "method not allowed",
		})
		return
	}

	userId := utils.GetUserId(r)

	cursorStr := r.URL.Query().Get("cursor")
	cursor := 0
	var err error
	if cursorStr != "" {
		cursor, err = strconv.Atoi(cursorStr)
		if err != nil || cursor < 0 {
			utils.WriteJson(w, http.StatusBadRequest, map[string]any{
				"error": "invalid cursor",
			})
			return
		}
	}

	posts, err := h.Services.Posts.GetFeedPosts(userId, cursor)
	if err != nil {
		utils.WriteJson(w, http.StatusInternalServerError, map[string]any{
			"error": "internal server error",
		})
		return
	}

	if posts == nil {
		posts = []types.PostResponse{}
	}

	utils.WriteJson(w, http.StatusOK, map[string]any{
		"posts": posts,
	})
}

func (h *Handler) GetProfilePosts(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.WriteJson(w, http.StatusMethodNotAllowed, map[string]any{
			"error": "method not allowed",
		})
		return
	}

	currentUserId := utils.GetUserId(r)

	targetUserId := r.URL.Query().Get("profile_id")
	if targetUserId == "" {
		targetUserId = currentUserId
	}

	cursorStr := r.URL.Query().Get("cursor")
	cursor := 0
	var err error
	if cursorStr != "" {
		cursor, err = strconv.Atoi(cursorStr)
		if err != nil || cursor < 0 {
			utils.WriteJson(w, http.StatusBadRequest, map[string]any{
				"error": "invalid cursor",
			})
			return
		}
	}

	posts, err := h.Services.Posts.GetProfilePosts(currentUserId, targetUserId, cursor)
	if err != nil {
		HandleError(w, err)
		return
	}

	if posts == nil {
		posts = []types.PostResponse{}
	}

	utils.WriteJson(w, http.StatusOK, map[string]any{
		"posts": posts,
	})
}

func (h *Handler) GetGroupPosts(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.WriteJson(w, http.StatusMethodNotAllowed, map[string]any{
			"error": "method not allowed",
		})
		return
	}

	currentUserId := utils.GetUserId(r)

	groupIdStr := r.PathValue("id")
	if groupIdStr == "" {
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{
			"error": "group ID is required",
		})
		return
	}

	groupId, err := strconv.Atoi(groupIdStr)
	if err != nil {
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{
			"error": "invalid group ID",
		})
		return
	}

	cursorStr := r.URL.Query().Get("cursor")
	cursor := 0
	if cursorStr != "" {
		cursor, err = strconv.Atoi(cursorStr)
		if err != nil || cursor < 0 {
			utils.WriteJson(w, http.StatusBadRequest, map[string]any{
				"error": "invalid cursor",
			})
			return
		}
	}

	posts, err := h.Services.Posts.GetGroupPosts(groupId, currentUserId, cursor)
	if err != nil {
		HandleError(w, err)
		return
	}

	if posts == nil {
		posts = []types.PostResponse{}
	}

	utils.WriteJson(w, http.StatusOK, map[string]any{
		"posts": posts,
	})
}

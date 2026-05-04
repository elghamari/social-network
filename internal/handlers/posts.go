package handlers

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"soc-net/internal/services"
	"soc-net/internal/types"
	"soc-net/internal/utils"
)

func (h *Handler) CreatePost(w http.ResponseWriter, r *http.Request) {
	fmt.Println("------------> ", r.Method)
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
			fmt.Println("222222222222222222")
			utils.WriteJson(w, http.StatusBadRequest, map[string]any{
				"error": "invalid group ID",
			})
			return
		}
		groupId = &id
	}

	imageUrl, err := utils.HandleImageUpload(r, "image")
	if err != nil {
		fmt.Println("333333333333333333")
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{
			"error": err.Error(),
		})
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
		if errors.Is(err, services.ErrInvalidTitle) ||
			errors.Is(err, services.ErrInvalidDescription) ||
			errors.Is(err, services.ErrInvalidPrivacy) ||
			errors.Is(err, services.ErrInvalidImage) ||
			errors.Is(err, services.ErrInvalidPrivateUsers) ||
			errors.Is(err, services.ErrDuplicatePrivateUsers) ||
			errors.Is(err, services.ErrEmptyPrivateUsers) {

			utils.WriteJson(w, http.StatusBadRequest, map[string]any{
				"error": err.Error(),
			})
			return
		}

		if errors.Is(err, services.ErrGroupNotFound) {
			utils.WriteJson(w, http.StatusNotFound, map[string]any{
				"error": err.Error(),
			})
			return
		}
		if errors.Is(err, services.ErrNotGroupMember) {
			utils.WriteJson(w, http.StatusForbidden, map[string]any{
				"error": err.Error(),
			})
			return
		}

		fmt.Println("CreatePost Error:", err)
		utils.WriteJson(w, http.StatusInternalServerError, map[string]any{
			"error": "internal server error",
		})
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
		if err != nil {
			utils.WriteJson(w, http.StatusBadRequest, map[string]any{
				"error": "invalid cursor",
			})
			return
		}
	}

	posts, err := h.Services.Posts.GetFeedPosts(userId, cursor)
	if err != nil {
		fmt.Println("GetFeedPosts Error:", err)
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

	targetUserId := r.URL.Query().Get("targetUserId")
	if targetUserId == "" {
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{
			"error": "invalid targetUserId",
		})
		return
	}

	cursorStr := r.URL.Query().Get("cursor")
	cursor := 0
	var err error
	if cursorStr != "" {
		cursor, err = strconv.Atoi(cursorStr)
		if err != nil {
			utils.WriteJson(w, http.StatusBadRequest, map[string]any{
				"error": "invalid cursor",
			})
			return
		}
	}

	posts, err := h.Services.Posts.GetProfilePosts(currentUserId, targetUserId, cursor)
	if err != nil {
		if errors.Is(err, services.ErrUserNotFound) {
			utils.WriteJson(w, http.StatusNotFound, map[string]any{
				"error": err.Error(),
			})
			return
		}

		fmt.Println("GetProfilePosts Error:", err)
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

func (h *Handler) GetGroupPosts(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.WriteJson(w, http.StatusMethodNotAllowed, map[string]any{
			"error": "method not allowed",
		})
		return
	}

	currentUserId := utils.GetUserId(r)

	groupIdStr := r.URL.Query().Get("groupId")
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
		if err != nil {
			utils.WriteJson(w, http.StatusBadRequest, map[string]any{
				"error": "invalid cursor",
			})
			return
		}
	}

	posts, err := h.Services.Posts.GetGroupPosts(groupId, currentUserId, cursor)
	if err != nil {
		if errors.Is(err, services.ErrGroupNotFound) {
			utils.WriteJson(w, http.StatusNotFound, map[string]any{
				"error": err.Error(),
			})
			return
		}
		if errors.Is(err, services.ErrNotGroupMember) {
			utils.WriteJson(w, http.StatusForbidden, map[string]any{
				"error": err.Error(),
			})
			return
		}

		fmt.Println("GetGroupPosts Error:", err)
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

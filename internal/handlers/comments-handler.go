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

func (h *Handler) CreateComment(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteJson(w, map[string]any{"status": http.StatusMethodNotAllowed, "error": "method not allowed"})
		return
	}

	userId := utils.GetUserId(r)

	postIdStr := r.URL.Query().Get("postId")
	if postIdStr == "" {
		utils.WriteJson(w, map[string]any{"status": http.StatusBadRequest, "error": "post ID is required"})
		return
	}

	postId, err := strconv.Atoi(postIdStr)
	if err != nil {
		utils.WriteJson(w, map[string]any{"status": http.StatusBadRequest, "error": "invalid post ID"})
		return
	}

	err = r.ParseMultipartForm(10 << 20)
	if err != nil {
		utils.WriteJson(w, map[string]any{"status": http.StatusBadRequest, "error": "failed to parse form data"})
		return
	}

	content := r.FormValue("content")

	imageUrl, err := utils.HandleImageUpload(r, "image")
	if err != nil {
		utils.WriteJson(w, map[string]any{"status": http.StatusBadRequest, "error": err.Error()})
		return
	}

	input := types.CommentInput{
		UserId:   userId,
		PostId:   postId,
		Content:  content,
		ImageUrl: imageUrl,
	}

	commentId, err := h.Services.Comments.CreateComment(userId, input)
	if err != nil {
		if errors.Is(err, services.ErrInvalidCommentContent) || errors.Is(err, services.ErrInvalidImage) {
			utils.WriteJson(w, map[string]any{"status": http.StatusBadRequest, "error": err.Error()})
			return
		}

		if errors.Is(err, services.ErrPostNotFound) {
			utils.WriteJson(w, map[string]any{"status": http.StatusNotFound, "error": err.Error()})
			return
		}
		if errors.Is(err, services.ErrUnauthorizedAccess) {
			utils.WriteJson(w, map[string]any{"status": http.StatusForbidden, "error": err.Error()})
			return
		}

		fmt.Println("CreateComment Error:", err)
		utils.WriteJson(w, map[string]any{"status": http.StatusInternalServerError, "error": "internal server error"})
		return
	}

	utils.WriteJson(w, map[string]any{
		"status":    http.StatusCreated,
		"message":   "Comment created successfully",
		"commentId": commentId,
	})
}

func (h *Handler) GetPostComments(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.WriteJson(w, map[string]any{"status": http.StatusMethodNotAllowed, "error": "method not allowed"})
		return
	}

	userId := utils.GetUserId(r)

	postIdStr := r.URL.Query().Get("postId")
	if postIdStr == "" {
		utils.WriteJson(w, map[string]any{"status": http.StatusBadRequest, "error": "post ID is required"})
		return
	}

	postId, err := strconv.Atoi(postIdStr)
	if err != nil {
		utils.WriteJson(w, map[string]any{"status": http.StatusBadRequest, "error": "invalid post ID"})
		return
	}

	cursorStr := r.URL.Query().Get("cursor")
	cursor := 0
	if cursorStr != "" {
		cursor, err = strconv.Atoi(cursorStr)
		if err != nil {
			utils.WriteJson(w, map[string]any{"status": http.StatusBadRequest, "error": "invalid cursor"})
			return
		}
	}

	comments, err := h.Services.Comments.GetPostComments(userId, postId, cursor)
	if err != nil {
		if errors.Is(err, services.ErrPostNotFound) {
			utils.WriteJson(w, map[string]any{"status": http.StatusNotFound, "error": err.Error()})
			return
		}
		if errors.Is(err, services.ErrUnauthorizedAccess) {
			utils.WriteJson(w, map[string]any{"status": http.StatusForbidden, "error": err.Error()})
			return
		}

		fmt.Println("GetPostComments Error:", err)
		utils.WriteJson(w, map[string]any{"status": http.StatusInternalServerError, "error": "internal server error"})
		return
	}

	if comments == nil {
		comments = []types.CommentResponse{}
	}

	utils.WriteJson(w, map[string]any{
		"status":   http.StatusOK,
		"comments": comments,
	})
}

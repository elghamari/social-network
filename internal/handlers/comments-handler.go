package handlers

import (
	"fmt"
	"net/http"
	"strconv"

	"soc-net/internal/types"
	"soc-net/internal/utils"
)

func (h *Handler) CreateComment(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteJson(w, http.StatusMethodNotAllowed, map[string]any{
			"error": "method not allowed",
		})
		return
	}

	userId := utils.GetUserId(r)

	postIdStr := r.URL.Query().Get("postId")
	if postIdStr == "" {
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{
			"error": "post ID is required",
		})
		return
	}

	postId, err := strconv.Atoi(postIdStr)
	if err != nil {
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{
			"error": "invalid post ID",
		})
		return
	}

	err = r.ParseMultipartForm(10 << 20)
	if err != nil {
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{
			"error": "failed to parse form data",
		})
		return
	}

	content := r.FormValue("content")

	imageUrl, err := utils.HandleImageUpload(r, "image")
	if err != nil {
		HandleError(w, err)
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
		HandleError(w, err)
		return
	}

	utils.WriteJson(w, http.StatusCreated, map[string]any{
		"message":   "Comment created successfully",
		"commentId": commentId,
	})
}

func (h *Handler) GetPostComments(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.WriteJson(w, http.StatusMethodNotAllowed, map[string]any{
			"error": "method not allowed",
		})
		return
	}

	userId := utils.GetUserId(r)

	postIdStr := r.URL.Query().Get("postId")
	if postIdStr == "" {
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{
			"error": "post ID is required",
		})
		return
	}

	postId, err := strconv.Atoi(postIdStr)
	if err != nil {
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{
			"error": "invalid post ID",
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

	comments, err := h.Services.Comments.GetPostComments(userId, postId, cursor)
	if err != nil {
		fmt.Println("GetPostComments Error:", err)
		HandleError(w, err)
		return
	}

	if comments == nil {
		comments = []types.CommentResponse{}
	}

	utils.WriteJson(w, http.StatusOK, map[string]any{
		"comments": comments,
	})
}

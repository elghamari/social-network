package handlers

import (
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"soc-net/internal/services"
	"soc-net/internal/types"
	"soc-net/internal/utils"
)

func (h *Handler) CreatePost(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteJson(w, map[string]any{
			"status": http.StatusMethodNotAllowed,
		})
		return
	}

	userId := utils.GetUserId(r)

	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		utils.WriteJson(w, map[string]any{
			"status": http.StatusBadRequest,
			"error":  "failed to parse form data, file might be too large",
		})
		return
	}

	title := r.FormValue("title")
	description := r.FormValue("description")
	privacy := r.FormValue("privacy")
	groupIdStr := r.FormValue("groupId")

	var groupId *int
	if groupIdStr != "" {
		id, err := strconv.Atoi(groupIdStr)
		if err != nil {
			utils.WriteJson(w, map[string]any{"status": http.StatusBadRequest, "error": "invalid group ID"})
			return
		}
		groupId = &id
	}

	var imageUrl *string
	file, header, err := r.FormFile("image")
	if err == nil {
		defer file.Close()

		if !utils.IsImageExtension(header.Filename) {
			utils.WriteJson(w, map[string]any{"status": http.StatusBadRequest, "error": "invalid image extension"})
			return
		}

		isValidContent, err := utils.IsImageContent(file)
		if err != nil || !isValidContent {
			utils.WriteJson(w, map[string]any{"status": http.StatusBadRequest, "error": "invalid image content or fake file"})
			return
		}

		fileName := fmt.Sprintf("%d%s", time.Now().UnixNano(), filepath.Ext(header.Filename))
		savePath := filepath.Join("uploads", fileName)

		outFile, err := os.Create(savePath)
		if err != nil {
			utils.WriteJson(w, map[string]any{"status": http.StatusInternalServerError, "error": "failed to save image to server"})
			return
		}
		defer outFile.Close()

		_, err = io.Copy(outFile, file)
		if err != nil {
			utils.WriteJson(w, map[string]any{"status": http.StatusInternalServerError, "error": "failed to write image to disk"})
			return
		}

		path := "/uploads/" + fileName
		imageUrl = &path

	} else if err != http.ErrMissingFile {
		utils.WriteJson(w, map[string]any{"status": http.StatusBadRequest, "error": "error processing image upload"})
		return
	}

	input := types.PostInput{
		UserId:      userId,
		Title:       title,
		Description: description,
		Privacy:     privacy,
		GroupId:     groupId,
		ImageUrl:    imageUrl,
	}

	postId, err := h.Services.Posts.CreatePost(input)
	if err != nil {
		if errors.Is(err, services.ErrInvalidTitle) || errors.Is(err, services.ErrInvalidDescription) || errors.Is(err, services.ErrInvalidPrivacy) || errors.Is(err, services.ErrInvalidImage) {
			utils.WriteJson(w, map[string]any{"status": http.StatusBadRequest, "error": err.Error()})
			return
		}

		if errors.Is(err, services.ErrGroupNotFound) {
			utils.WriteJson(w, map[string]any{"status": http.StatusNotFound, "error": err.Error()})
			return
		}
		if errors.Is(err, services.ErrNotGroupMember) {
			utils.WriteJson(w, map[string]any{"status": http.StatusForbidden, "error": err.Error()})
			return
		}

		fmt.Println("CreatePost Error:", err)
		utils.WriteJson(w, map[string]any{"status": http.StatusInternalServerError, "error": "internal server error"})
		return
	}

	utils.WriteJson(w, map[string]any{
		"status":  http.StatusCreated,
		"message": "Post created successfully",
		"postId":  postId,
	})
}

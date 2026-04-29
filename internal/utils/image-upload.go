package utils

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"soc-net/internal/types"
	"strings"
	"time"
)

const MaxImageSize = 5 * 1024 * 1024

func isImageExtension(fileName string) bool {
	ext := strings.ToLower(filepath.Ext(fileName))
	switch ext {
	case ".jpg", ".jpeg", ".png", ".webp":
		return true
	default:
		return false
	}
}

func isImageContent(file io.ReadSeeker) (bool, error) {
	buffer := make([]byte, 512)
	_, err := file.Read(buffer)
	if err != nil && err != io.EOF {
		return false, err
	}
	_, err = file.Seek(0, 0)
	if err != nil {
		return false, err
	}
	contentType := http.DetectContentType(buffer)
	return strings.HasPrefix(contentType, "image/"), nil
}

func HandleImageUpload(r *http.Request, fieldName string) (*string, error) {
	file, header, err := r.FormFile(fieldName)
	if err != nil {
		if err == http.ErrMissingFile {
			return nil, nil
		}
		return nil, fmt.Errorf("utils.HandleImageUpload: Error processing: %w", err)
	}

	defer file.Close()

	formErr := types.NewFormError()

	if !isImageExtension(header.Filename) {
		formErr.Fields["coverImage"] = append(formErr.Fields["coverImage"], "Only JPG, JPEG, PNG or WEBP images are allowed")
	}

	isValidContent, err := isImageContent(file)
	if err != nil {
		return nil, fmt.Errorf("utils.HandleImageUpload: Checking type: %w", err)
	}
	if !isValidContent {
		formErr.Fields["coverImage"] = append(formErr.Fields["coverImage"], "Invalid image content")
	}

	if header.Size > MaxImageSize {
		formErr.Fields["coverImage"] = append(formErr.Fields["coverImage"], "Image size must be less than 2MB")
	}

	if formErr.HasErrors() {
		return nil, formErr
	}

	fileName := fmt.Sprintf("%d%s", time.Now().UnixNano(), filepath.Ext(header.Filename))
	savePath := filepath.Join("data/uploads", fileName)

	outFile, err := os.Create(savePath)
	if err != nil {
		return nil, fmt.Errorf("utils.HandleImageUpload: Creating file: %w", err)
	}
	defer outFile.Close()

	_, err = io.Copy(outFile, file)
	if err != nil {
		return nil, fmt.Errorf("utils.HandleImageUpload: Copying to file: %w", err)
	}

	path := "/uploads/" + fileName
	return &path, nil
}

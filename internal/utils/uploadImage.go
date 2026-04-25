package utils

import (
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

func HandleImageUpload(r *http.Request, fieldName string) (*string, error) {
	file, header, err := r.FormFile(fieldName)
	if err != nil {
		if err == http.ErrMissingFile {
			return nil, nil
		}
		return nil, errors.New("error processing file upload")
	}
	defer file.Close()

	if !IsImageExtension(header.Filename) {
		return nil, errors.New("invalid image extension")
	}

	isValidContent, err := IsImageContent(file)
	if err != nil || !isValidContent {
		return nil, errors.New("invalid image content or fake file")
	}

	const maxSize = 2 * 1024 * 1024
	if header.Size > maxSize {
		return nil, errors.New("The image is greater than 2 MB.")
	}

	fileName := fmt.Sprintf("%d%s", time.Now().UnixNano(), filepath.Ext(header.Filename))
	savePath := filepath.Join("uploads", fileName)

	outFile, err := os.Create(savePath)
	if err != nil {
		return nil, errors.New("failed to save image to server")
	}
	defer outFile.Close()

	_, err = io.Copy(outFile, file)
	if err != nil {
		return nil, errors.New("failed to write image to disk")
	}

	path := "/uploads/" + fileName
	return &path, nil
}

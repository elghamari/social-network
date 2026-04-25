package utils

import (
	"encoding/base64"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

const MaxImageSize = 5 * 1024 * 1024

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

	if header.Size > MaxImageSize {
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

func HandleBase64Image(base64Data string) (*string, error) {
	if base64Data == "" {
		return nil, nil
	}
	if len(base64Data) > MaxImageSize*2 {
		return nil, errors.New("image size is too large")
	}

	parts := strings.SplitN(base64Data, ",", 2)
	if len(parts) != 2 {
		return nil, errors.New("invalid base64 format")
	}

	header := parts[0]
	content := parts[1]

	var ext string
	if strings.Contains(header, "image/jpeg") || strings.Contains(header, "image/jpg") {
		ext = ".jpg"
	} else if strings.Contains(header, "image/png") {
		ext = ".png"
	} else if strings.Contains(header, "image/gif") {
		ext = ".gif"
	} else {
		return nil, errors.New("unsupported image extension")
	}

	decodedData, err := base64.StdEncoding.DecodeString(content)
	if err != nil {
		return nil, errors.New("failed to decode image")
	}
	actualSize := len(decodedData)
	if actualSize == 0 {
		return nil, errors.New("image is empty")
	}
	if actualSize > MaxImageSize {
		return nil, errors.New("image size must be less than 5MB")
	}

	contentType := http.DetectContentType(decodedData)
	if !strings.HasPrefix(contentType, "image/") {
		return nil, errors.New("invalid image content")
	}

	fileName := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
	savePath := filepath.Join("uploads", fileName)
	os.MkdirAll("uploads", os.ModePerm)
	err = os.WriteFile(savePath, decodedData, 0o644)
	err = os.WriteFile(savePath, decodedData, 0o644)
	if err != nil {
		return nil, errors.New("failed to save image")
	}

	path := "/uploads/" + fileName
	return &path, nil
}

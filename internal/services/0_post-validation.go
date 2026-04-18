package services

import (
	"errors"
	"strings"

	"soc-net/internal/types"
)

var (
	ErrInvalidTitle          = errors.New("title is required and must be under 100 characters")
	ErrInvalidDescription    = errors.New("description is required and must be under 800 characters")
	ErrInvalidPrivacy        = errors.New("privacy must be public, private, or almost private")
	ErrInvalidCommentContent = errors.New("comment content is required and must be under 200 characters")
	ErrInvalidImage          = errors.New("image url cannot be empty if provided")
)

func ValidatePostInput(input types.PostInput) error {
	title := strings.TrimSpace(input.Title)
	if title == "" || len(title) > 100 {
		return ErrInvalidTitle
	}

	desc := strings.TrimSpace(input.Description)
	if desc == "" || len(desc) > 800 {
		return ErrInvalidDescription
	}

	if input.GroupId == nil {
		if input.Privacy != "public" && input.Privacy != "private" && input.Privacy != "almost private" {
			return ErrInvalidPrivacy
		}
	}

	if input.ImageUrl != nil && strings.TrimSpace(*input.ImageUrl) == "" {
		return ErrInvalidImage
	}

	return nil
}

func ValidateCommentInput(input types.CommentInput) error {
	content := strings.TrimSpace(input.Content)
	if content == "" || len(content) > 200 {
		return ErrInvalidCommentContent
	}

	if input.ImageUrl != nil && strings.TrimSpace(*input.ImageUrl) == "" {
		return ErrInvalidImage
	}

	return nil
}

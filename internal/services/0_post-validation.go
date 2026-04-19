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

func ValidatePostInput(input *types.PostInput) error {
	input.Title = strings.TrimSpace(input.Title)
	if input.Title == "" || len(input.Title) > 100 {
		return ErrInvalidTitle
	}

	input.Description = strings.TrimSpace(input.Description)
	if input.Description == "" || len(input.Description) > 800 {
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

func ValidateCommentInput(input *types.CommentInput) error {
	input.Content = strings.TrimSpace(input.Content)
	if input.Content == "" || len(input.Content) > 200 {
		return ErrInvalidCommentContent
	}

	if input.ImageUrl != nil && strings.TrimSpace(*input.ImageUrl) == "" {
		return ErrInvalidImage
	}

	return nil
}

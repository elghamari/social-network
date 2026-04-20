package services

import (
	"strings"

	"soc-net/internal/types"
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

		if input.Privacy == "private" {
			if len(input.PrivateUsers) < 1 {
				return ErrEmptyPrivateUsers
			}

			uniqueUsersMap := make(map[string]bool)
			for _, id := range input.PrivateUsers {
				if uniqueUsersMap[id] {
					return ErrDuplicatePrivateUsers
				}
				uniqueUsersMap[id] = true
			}
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

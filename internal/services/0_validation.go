package services

import (
	"soc-net/internal/types"
	"strings"
)

func ValidateTab(tab string) *types.ActionError {
	validTabs := map[string]bool{"discover": true, "joined": true, "pending": true}

	if !validTabs[tab] {
		return types.NewActionError("Not a valid tab Try: (discover || joined || pending)")
	}

	return nil
}

func ValidateEventStatus(er types.EventResponse) *types.ActionError {
	if er.Response != "GOING" && er.Response != "NOT_GOING" {
		return types.NewActionError("Response must be GOING or NOT_GOING")
	}

	return nil
}

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

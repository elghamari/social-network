package services

import (
	"soc-net/internal/types"
)

func ValidateGroupInput(input types.GroupInput) *types.FormError {
	formErr := types.NewFormError()

	if !(len(input.Title) >= 3 && len(input.Title) <= 100) {
		formErr.Fields["title"] = "Title cannot be empty and must be between 3 and 100 letters."
	}

	if !(len(input.Description) >= 10 && len(input.Description) <= 500) {
		formErr.Fields["description"] = "Description cannot be empty and must be between 10 and 500 letters."
	}

	return formErr
}

func ValidateTab(tab string) *types.ActionError {
	err := types.NewActionError()

	validTabs := map[string]bool{"discover": true, "joined": true, "pending": true}

	if !validTabs[tab] {
		err.Message = "Not a valid tab Try: (discover || joined || pending)"
	}

	return err
}

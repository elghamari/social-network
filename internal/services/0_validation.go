package services

import "soc-net/internal/types"

func ValidateGroupInput(input types.GroupInput) error {
	err := types.NewFormError()

	if !(len(input.Title) >= 3 && len(input.Title) <= 100) {
		err.Fields["title"] = "Title cannot be empty and must be between 3 and 100 letters."
	}

	if !(len(input.Description) >= 10 && len(input.Description) <= 500) {
		err.Fields["description"] = "Description cannot be empty and must be between 10 and 500 letters."
	}

	if len(err.Fields) > 0 {
		return err
	}

	return nil
}

func ValidateTab(tab string) error {

	validTabs := map[string]bool{"discover": true, "joined": true, "pending": true}

	if !validTabs[tab] {
		return types.NewActionError("Not a valid tab Try: (discover || joined || pending)")
	}

	return nil
}

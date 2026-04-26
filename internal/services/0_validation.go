package services

import (
	"soc-net/internal/types"
	"time"
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
	validTabs := map[string]bool{"discover": true, "joined": true, "pending": true}

	if !validTabs[tab] {
		return types.NewActionError("Not a valid tab Try: (discover || joined || pending)")
	}

	return nil
}

func ValidateEvent(event types.Event) *types.FormError {
	formErr := types.NewFormError()

	if !(len(event.Title) >= 3 && len(event.Title) <= 100) {
		formErr.Fields["title"] = "Title cannot be empty and must be between 3 and 100 letters."
	}

	if !(len(event.Description) >= 10 && len(event.Description) <= 500) {
		formErr.Fields["description"] = "Description cannot be empty and must be between 10 and 500 letters."
	}

	_, err := time.Parse("2006-01-02T15:04", event.Date)
	if err != nil {
		formErr.Fields["eventTime"] = "Invalid date/time format"
	}

	return nil
}	

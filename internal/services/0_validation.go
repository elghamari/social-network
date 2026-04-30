package services

import (
	"soc-net/internal/types"
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

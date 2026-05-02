package services

import (
	"strconv"
	"strings"

	"soc-net/internal/types"
)

func ValidateTab(tab string) *types.ActionError {
	validTabs := map[string]bool{"discover": true, "joined": true, "pending": true}

	if !validTabs[tab] {
		return types.NewActionError("Not a valid tab Try: (discover || joined || pending)")
	}

	return nil
}

func ValidateCursor(cursor string) *types.ActionError {
	_, err := strconv.Atoi(cursor)
	if err != nil && cursor != "" {
		return types.NewActionError("Cursor must be a number")
	}

	return nil
}

func ValidateEventStatus(er types.EventResponse) *types.ActionError {
	if er.Response != "GOING" && er.Response != "NOT_GOING" {
		return types.NewActionError("Response must be GOING or NOT_GOING")
	}

	return nil
}

func ValidateIncomingMessage(input *types.IncomingMessage) error {
	input.Content = strings.TrimSpace(input.Content)
	contentLen := len([]rune(input.Content))

	if contentLen == 0 || contentLen > 500 {
		return ErrInvalidMessageContent
	}

	return nil
}

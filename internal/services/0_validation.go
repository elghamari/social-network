package services

import "soc-net/internal/types"

func ValidateGroupInput(input types.GroupInput) error {
	if !(len(input.Title) >= 3 && len(input.Title) <= 100) {
		return ErrInvalidGroupTitle
	}

	if !(len(input.Description) >= 10 && len(input.Description) <= 500) {
		return ErrInvalidGroupDescription
	}

	return nil
}

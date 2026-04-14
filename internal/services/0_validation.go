package services

import "soc-net/internal/types"

func ValidateGroupInput(input types.GroupInput) error {
	err := types.ValidationError{
		Fields: make(map[string]string),
	}

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

func ValidateGroupsReq(tab, search string) error {
	err := types.ValidationError{
		Fields: make(map[string]string),
	}

	if !(tab == "discover" || tab == "joined" || tab == "pending") {
		err.Fields["tab"] = "Not a valid tab Try: (discover || joined || pending)"
	}

	if len(err.Fields) > 0 {
		return err
	}

	return nil
}

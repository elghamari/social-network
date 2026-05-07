package services

import (
	"regexp"
	"strconv"
	"strings"
	"time"

	"soc-net/internal/types"
)

var (
	emailRegex    = regexp.MustCompile(`^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,4}$`)
	nameRegex     = regexp.MustCompile(`^[a-zA-Z\s]{2,20}$`)
	usernameRegex = regexp.MustCompile(`^[a-zA-Z]{5,20}$`)
	dateRegex     = regexp.MustCompile(`^\d{4}-\d{2}-\d{2}$`)
)

func ValidateRegisterInput(input types.RegisterInput) error {
	formErr := types.NewFormError()

	// Email Validation
	email := strings.ToLower(strings.TrimSpace(input.Email))
	if !emailRegex.MatchString(email) {
		formErr.Fields["email"] = append(formErr.Fields["email"], "invalid email format")
	}

	// Password Validation
	if len(strings.TrimSpace(input.Password)) < 6 {
		formErr.Fields["password"] = append(formErr.Fields["password"], "password must be at least 6 characters")
	}

	// First Name Validation
	if !nameRegex.MatchString(strings.TrimSpace(input.FirstName)) {
		formErr.Fields["first_name"] = append(formErr.Fields["first_name"], "first name must be 2-20 letters only")
	}

	// Last Name Validation
	if !nameRegex.MatchString(strings.TrimSpace(input.LastName)) {
		formErr.Fields["last_name"] = append(formErr.Fields["last_name"], "last name must be 2-20 letters only")
	}

	// Date of Birth Validation
	if !dateRegex.MatchString(input.DateOfBirth) {
		formErr.Fields["date_of_birth"] = append(formErr.Fields["date_of_birth"], "date of birth must be YYYY-MM-DD")
	}

	// Nickname Validation
	if input.Nickname != nil {
		trimmed := strings.TrimSpace(*input.Nickname)
		if len(trimmed) > 30 {
			formErr.Fields["nickname"] = append(formErr.Fields["nickname"], "nickname must be at most 30 characters")
		}
		if !usernameRegex.MatchString(trimmed) {
			formErr.Fields["nickname"] = append(formErr.Fields["nickname"], "nickname must be 5-20 letters only")
		}
		input.Nickname = &trimmed
	}

	// About Me
	if input.AboutMe != nil && *input.AboutMe != "" {
		trimmed := strings.TrimSpace(*input.AboutMe)
		if len(trimmed) > 500 {
			formErr.Fields["about_me"] = append(formErr.Fields["about_me"], "about me must be at most 500 characters")
		}
		input.AboutMe = &trimmed
	}

	if formErr.HasErrors() {
		return formErr
	}

	return nil
}

func ValidateTab(tab string) *types.ActionError {
	validTabs := map[string]bool{"discover": true, "joined": true, "pending": true}

	if !validTabs[tab] {
		return types.NewActionError("Not a valid tab Try: (discover || joined || pending)")
	}

	return nil
}

func ValidateIntegerCursor(cursor string) *types.ActionError {
	_, err := strconv.Atoi(cursor)
	if err != nil && cursor != "" {
		return types.NewActionError("Cursor must be a number")
	}

	return nil
}

const sqliteDateLayout = "2006-01-02 15:04:05"

func NormalizeDateCursor(cursor string) (string, error) {
	if cursor == "" {
		return "", nil
	}

	t, err := time.Parse(time.RFC3339, cursor)
	if err != nil {
		return "", types.NewActionError("Cursor must be a RFC3339 formated date")
	}

	return t.UTC().Format(sqliteDateLayout), nil
}

func ValidateEventStatus(er types.EventResponse) *types.ActionError {
	if er.Response != "GOING" && er.Response != "NOT_GOING" {
		return types.NewActionError("Response must be GOING or NOT_GOING")
	}

	return nil
}

func ValidatePostInput(input *types.PostInput) error {
	formErr := types.NewFormError()

	input.Title = strings.TrimSpace(input.Title)
	if input.Title == "" || len(input.Title) > 100 {
		formErr.Fields["title"] = append(formErr.Fields["title"], "title is required and must be under 100 characters.")
		// return ErrInvalidTitle
	}

	input.Description = strings.TrimSpace(input.Description)
	if input.Description == "" || len(input.Description) > 800 {
		formErr.Fields["description"] = append(formErr.Fields["description"], "description is required and must be under 800 characters.")
		// return ErrInvalidDescription
	}

	if input.GroupId == nil {
		if input.Privacy != "public" && input.Privacy != "private" && input.Privacy != "almost private" {
			formErr.Fields["privacy"] = append(formErr.Fields["privacy"], "privacy must be public, private, or almost private.")
			// return ErrInvalidPrivacy
		}

		if input.Privacy == "private" {
			if len(input.PrivateUsers) < 1 {
				formErr.Fields["private"] = append(formErr.Fields["private"], "you must select at least one user for a private post.")
				// return ErrEmptyPrivateUsers
			}

			uniqueUsersMap := make(map[string]bool)
			for _, id := range input.PrivateUsers {
				if uniqueUsersMap[id] {
					formErr.Fields["duplicate"] = append(formErr.Fields["duplicate"], "duplicate users are not allowed in the private users list")
					// return ErrDuplicatePrivateUsers
				}
				uniqueUsersMap[id] = true
			}
		}
	}

	if input.ImageUrl != nil && strings.TrimSpace(*input.ImageUrl) == "" {
		formErr.Fields["image"] = append(formErr.Fields["image"], "image url cannot be empty if provided.")
		// return ErrInvalidImage
	}

	if formErr.HasErrors() {
		return formErr
	}

	return nil
}

func ValidateCommentInput(input *types.CommentInput) error {
	formErr := types.NewFormError()

	input.Content = strings.TrimSpace(input.Content)
	if input.Content == "" || len(input.Content) > 200 {
		formErr.Fields["content"] = append(formErr.Fields["content"], "comment content is required and must be under 200 characters.")
		// return ErrInvalidCommentContent
	}

	if input.ImageUrl != nil && strings.TrimSpace(*input.ImageUrl) == "" {
		formErr.Fields["image"] = append(formErr.Fields["image"], "image url cannot be empty if provided.")
		// return ErrInvalidImage
	}

	if formErr.HasErrors() {
		return formErr
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

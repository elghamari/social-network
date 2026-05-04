package services

import (
	"errors"
	"regexp"
	"soc-net/internal/types"
	"strconv"
	"strings"
	"time"
)

var (
	emailRegex = regexp.MustCompile(`^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,4}$`)
	nameRegex  = regexp.MustCompile(`^[a-zA-Z\s]{2,20}$`)
	dateRegex  = regexp.MustCompile(`^\d{4}-\d{2}-\d{2}$`)
)

func ValidateRegisterInput(input types.RegisterInput) error {
	email := strings.ToLower(strings.TrimSpace(input.Email))
	if !emailRegex.MatchString(email) {
		return errors.New("invalid email format")
	}
	if len(strings.TrimSpace(input.Password)) < 6 {
		return errors.New("password must be at least 6 characters")
	}
	if !nameRegex.MatchString(strings.TrimSpace(input.FirstName)) {
		return errors.New("first name must be 2-20 letters only")
	}
	if !nameRegex.MatchString(strings.TrimSpace(input.LastName)) {
		return errors.New("last name must be 2-20 letters only")
	}
	if !dateRegex.MatchString(input.DateOfBirth) {
		return errors.New("date of birth must be YYYY-MM-DD")
	}

	if input.AboutMe != nil && *input.AboutMe != "" {
		trimmed := strings.TrimSpace(*input.AboutMe)
		input.AboutMe = &trimmed
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

func ValidateIncomingMessage(input *types.IncomingMessage) error {
	input.Content = strings.TrimSpace(input.Content)
	contentLen := len([]rune(input.Content))

	if contentLen == 0 || contentLen > 500 {
		return ErrInvalidMessageContent
	}

	return nil
}

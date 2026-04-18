package services

import (
	"errors"
	"regexp"
	"strings"

	"socialnetwork/modle"
)

var (
    emailRegex = regexp.MustCompile(`^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,4}$`)
    nameRegex = regexp.MustCompile(`^[a-zA-Z\s]{2,20}$`)
    dateRegex = regexp.MustCompile(`^\d{4}-\d{2}-\d{2}$`)
)

func ValidRegisterInput(input modle.RegisterInput) error {

    email := strings.ToLower(strings.TrimSpace(input.Email))
    if !emailRegex.MatchString(email) {
        return errors.New("invalid email format")
    }

    pass := strings.TrimSpace(input.Password)
    if len(pass) < 6 {
        return errors.New("password must be at least 6 characters")
    }

    fName := strings.TrimSpace(input.FirstName)
    if !nameRegex.MatchString(fName) {
        return errors.New("first name must be 2-20 characters and letters only")
    }

    lName := strings.TrimSpace(input.LastName)
    if !nameRegex.MatchString(lName) {
        return errors.New("last name must be 2-20 characters and letters only")
    }

    if !dateRegex.MatchString(input.DateOfBirth) {
        return errors.New("date of birth must be in YYYY-MM-DD format")
    }

    return nil
}
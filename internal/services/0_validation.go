package services

// import (
// 	"regexp"
// 	"rtf/internal/models"
// )

// var (
// 	nameQuery     = regexp.MustCompile(`^[a-zA-Z\-]{3,20}$`)
// 	nicknameQuery = regexp.MustCompile(`^[a-zA-Z0-9_]{3,12}$`)
// 	emailQuery    = regexp.MustCompile(`^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$`)
// 	passwordQuery = regexp.MustCompile(`^\S{8,64}$`)
// )

// func ValidRegisterIn(input models.RegisterInput) error {
// 	if !nameQuery.MatchString(input.Firstname) {
// 		return ErrFirstnameFormat
// 	}

// 	if !nameQuery.MatchString(input.Lastname) {
// 		return ErrLastnameFormat
// 	}

// 	if len(input.Email) > 100 {
// 		return ErrEmailSize
// 	}

// 	if !emailQuery.MatchString(input.Email) {
// 		return ErrEmailFormat
// 	}

// 	if !nicknameQuery.MatchString(input.Nickname) {
// 		return ErrNicknameFormat
// 	}

// 	if input.Age < 15 || input.Age > 120 {
// 		return ErrInvalidAge
// 	}

// 	if input.Gender != "male" && input.Gender != "female" {
// 		return ErrInvalidGender
// 	}

// 	if !passwordQuery.MatchString(input.Password) {
// 		return ErrPasswordFormat
// 	}

// 	return nil
// }

// func ValidPostIn(input models.PostCreateInput) error {
// 	if !(len(input.Content) > 0 && len(input.Content) <= 300) {
// 		return ErrInvalidContent
// 	}

// 	if len(input.Categories) == 0 {
// 		return ErrInvalidCategory
// 	}

// 	return nil
// }

// func ValidCommentIn(input models.CommentCreateInput) error {
// 	if !(len(input.Content) > 0 && len(input.Content) <= 300) {
// 		return ErrInvalidContent
// 	}

// 	return nil
// }

// func ValidMessageIn(input models.MsgIn) error {
// 	if !(len(input.Body) > 0 && len(input.Body) <= 500) {
// 		return ErrInvalidMessage
// 	}
// 	return nil
// }

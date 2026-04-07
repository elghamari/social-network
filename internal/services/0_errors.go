package services

import "errors"

var (
	ErrBadRequest = errors.New("bad request")
)

// ===== Register =====
var (
	ErrFirstnameFormat = errors.New("invalid firstname format")
	ErrLastnameFormat  = errors.New("invalid lastname format")
	ErrEmailSize       = errors.New("invalid email size")
	ErrEmailFormat     = errors.New("invalid email format")
	ErrEmailTaken      = errors.New("email taken")
	ErrNicknameFormat  = errors.New("invalid nickname format")
	ErrNicknameTaken   = errors.New("nickname taken")
	ErrInvalidAge      = errors.New("invalid age")
	ErrInvalidGender   = errors.New("invalid gender")
	ErrPasswordFormat  = errors.New("invalid password format")
)

// ===== Login =====
var ErrInvalidCredentials = errors.New("invalid credentials.")

// ===== Feed =====
var (
	ErrInvalidUserId = errors.New("invalid user_id")
	ErrInvalidTime   = errors.New("invalid time")

	// Posts
	ErrInvalidPostId    = errors.New("invalid post_id")
	ErrInvalidCommentId = errors.New("invalid comment_id")
	ErrInvalidContent   = errors.New("invalid content")
	ErrInvalidCategory  = errors.New("invalid category")

	// Chat
	ErrInvalidMessageId = errors.New("invalid message_id")
	ErrInvalidMessage   = errors.New("invalid message")
)

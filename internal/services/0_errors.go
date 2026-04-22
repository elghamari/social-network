package services

import "errors"

// ===== Register =====
var (
// ErrFirstnameFormat = errors.New("invalid firstname format")
// ErrLastnameFormat  = errors.New("invalid lastname format")
// ErrEmailSize       = errors.New("invalid email size")
// ErrEmailFormat     = errors.New("invalid email format")
// ErrEmailTaken      = errors.New("email taken")
// ErrNicknameFormat  = errors.New("invalid nickname format")
// ErrNicknameTaken   = errors.New("nickname taken")
// ErrInvalidAge      = errors.New("invalid age")
// ErrInvalidGender   = errors.New("invalid gender")
// ErrPasswordFormat  = errors.New("invalid password format")
)

// ===== Login =====
// var ErrInvalidCredentials = errors.New("invalid credentials.")


// ===== Chat =====
var (
    ErrInvalidMessageContent = errors.New("message content is required and must be between 1 and 500 characters")
    ErrChatPermissionDenied  = errors.New("you do not have permission to message this user")
    ErrSelfChat  = errors.New("you cannot send a message to yourself")
)

// ===== Groups =====
var (
	ErrInvalidGroupId          = errors.New("invalid groupId")
	ErrInvalidGroupTitle       = errors.New("invalid group title")
	ErrInvalidGroupDescription = errors.New("invalid group description")
)

// ===== Feed =====
var (
	ErrGroupNotFound         = errors.New("the specified group does not exist")
	ErrNotGroupMember        = errors.New("you are not a member of this group")
	ErrUserNotFound          = errors.New("the specified user does not exist")
	ErrPostNotFound          = errors.New("the specified post does not exist")
	ErrUnauthorizedAccess    = errors.New("you do not have permission to interact with this post")
	
	ErrInvalidTitle          = errors.New("title is required and must be under 100 characters")
	ErrInvalidDescription    = errors.New("description is required and must be under 800 characters")
	ErrInvalidPrivacy        = errors.New("privacy must be public, private, or almost private")
	ErrInvalidImage          = errors.New("image url cannot be empty if provided")
	ErrEmptyPrivateUsers     = errors.New("you must select at least one user for a private post")
	ErrInvalidPrivateUsers   = errors.New("one or more selected users do not exist")
	ErrDuplicatePrivateUsers = errors.New("duplicate users are not allowed in the private users list")
	
	ErrInvalidCommentContent = errors.New("comment content is required and must be under 200 characters")
)

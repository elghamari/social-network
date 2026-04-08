package handlers

import (
	"errors"
	"soc-net/internal/services"
)

var codes = map[error]string{
	// ===== Register =====
	// services.ErrFirstnameFormat: "FIRSTNAME_FORMAT",
	// services.ErrLastnameFormat:  "LASTNAME_FORMAT",
	// services.ErrEmailSize:       "EMAIL_SIZE",
	// services.ErrEmailFormat:     "EMAIL_FORMAT",
	// services.ErrEmailTaken:      "EMAIL_TAKEN",
	// services.ErrNicknameFormat:  "NICKNAME_FORMAT",
	// services.ErrNicknameTaken:   "NICKNAME_TAKEN",
	// services.ErrInvalidAge:      "INVALID_AGE",
	// services.ErrInvalidGender:   "INVALID_GENDER",
	// services.ErrPasswordFormat:  "PASSWORD_FORMAT",

	//  ===== Login =====
	// services.ErrInvalidCredentials: "INVALID_CREDENTIALS",

	// ===== Feed =====
	// services.ErrInvalidTime: "INVALID_TIME",
	// Posts
	// services.ErrInvalidPostId:    "INVALID_POST_ID",
	// services.ErrInvalidCommentId: "INVALID_COMMENT_ID",
	// services.ErrInvalidContent:   "INVALID_CONTENT",
	// services.ErrInvalidCategory:  "INVALID_CATEGORY",
	// Chat
	// services.ErrInvalidUserId:    "INVALID_USER_ID",
	// services.ErrInvalidMessageId: "INVALID_MESSAGE_ID",
	// services.ErrInvalidMessage:   "INVALID_MESSAGE",

	// ===== Groups =====
	services.ErrInvalidGroupId: "INVALID_GROUP_ID",
}

func ErrorCode(e error) string {
	for err, code := range codes {
		if errors.Is(e, err) {
			return code
		}
	}
	return ""
}

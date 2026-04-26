package types

import (
	"time"
)

// ===== Session (used by middleware)

type UserAuth struct {
	Id          string
	Nickname    string
	SessionTime time.Time
}

// ===== Full user model

type User struct {
	ID          string    `json:"id"`
	Email       string    `json:"email"`
	Password    string    `json:"-"`
	FirstName   string    `json:"first_name"`
	LastName    string    `json:"last_name"`
	DateOfBirth time.Time `json:"date_of_birth"`
	Avatar      *string   `json:"avatar"`
	Nickname    *string   `json:"nickname"`
	AboutMe     *string   `json:"about_me"`
	IsPublic    bool      `json:"is_public"`
	CreatedAt   time.Time `json:"created_at"`
}

// ===== Auth inputs

type RegisterInput struct {
	Email       string  `json:"email"`
	Password    string  `json:"password"`
	FirstName   string  `json:"first_name"`
	LastName    string  `json:"last_name"`
	DateOfBirth string  `json:"date_of_birth"`
	Nickname    *string `json:"nickname,omitempty"`
	Avatar      *string `json:"avatar,omitempty"`
	AboutMe     *string `json:"about_me,omitempty"`
}

type LoginInput struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// ===== Follow

type FollowerInfo struct {
	ID        string `json:"id"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Avatar    string `json:"avatar"`
}

type UserProfileResponse struct {
	ID              string         `json:"id"`
	FirstName       string         `json:"first_name"`
	LastName        string         `json:"last_name"`
	IsPublic        bool           `json:"is_public"`
	FollowStatus    string         `json:"follow_status"`
	Followers       []FollowerInfo `json:"followers"`
	Following       []FollowerInfo `json:"following"`
	PendingRequests []FollowerInfo `json:"pending_requests,omitempty"`
	Avatar          string         `json:"avatar,omitempty"`
}

type FollowRequest struct {
	TargetID string `json:"target_id"`
}

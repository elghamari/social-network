package modle

import "time"

// User represents a user stored in the database.
type User struct {
	ID          string    `json:"id"`
	Email       string    `json:"email"`
	Password    string    `json:"-"`
	FirstName   string    `json:"first_name"`
	LastName    string    `json:"last_name"`
	DateOfBirth time.Time `json:"date_of_birth"`

	Avatar   *string `json:"avatar"`
	Nickname *string `json:"nickname"`
	AboutMe  *string `json:"about_me"`

	IsPublic  bool      `json:"is_public"`
	CreatedAt time.Time `json:"created_at"`

	SessionID   *string    `json:"session_id,omitempty"`
	SessionTime *time.Time `json:"session_time,omitempty"`
}

// UserAuth is a lightweight user representation used by the session middleware.
type UserAuth struct {
	ID          string    `json:"id"`
	Email       string    `json:"email"`
	SessionTime time.Time `json:"-"`
}

// RegisterInput holds the data required to create a new account.
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

// LoginInput holds the credentials used to authenticate.
type LoginInput struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// FollowerInfo is a lightweight representation of a user used in lists.
type FollowerInfo struct {
	ID        string `json:"id"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
}

// UserProfileResponse is returned when fetching a user's profile.
type UserProfileResponse struct {
	ID              string         `json:"id"`
	FirstName       string         `json:"first_name"`
	LastName        string         `json:"last_name"`
	Privacy         string         `json:"privacy"`
	IsPublic        bool           `json:"is_public"`
	FollowStatus    string         `json:"follow_status"`
	Followers       []FollowerInfo `json:"followers"`
	Following       []FollowerInfo `json:"following"`
	PendingRequests []FollowerInfo `json:"pending_requests"`
}

// Followers represents a row in the followers table.
type Followers struct {
	ID          int
	FollowerID  string
	FollowingID string
}

// FollowRequest represents a pending follow request.
type FollowRequest struct {
	ID         int
	SenderID   string
	ReceiverID string
}

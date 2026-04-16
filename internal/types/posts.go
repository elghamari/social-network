package types

import "time"

type Media struct {
	Id        int    `json:"id"`
	OwnerId   string `json:"owner_id"`
	ModelType string `json:"model_type"`
	Path      string `json:"path"`
	CreatedAt string `json:"created_at"`
}

type Post struct {
	Id        int    `json:"id"`
	UserId    string `json:"user_id"`
	GroupId   *int   `json:"group_id"`
	Content   string `json:"content"`
	Privacy   string `json:"privacy"`
	CreatedAt string `json:"created_at"`
}

type Comment struct {
	Id        int    `json:"id"`
	UserId    string `json:"user_id"`
	PostId    int    `json:"post_id"`
	Content   string `json:"content"`
	CreatedAt string `json:"created_at"`
}

type Reaction struct {
	UserId string `json:"user_id"`
	PostId int    `json:"post_id"`
}

type UserResponse struct {
	Id       string `json:"id"`
	Username string `json:"username"`
}

type PostResponse struct {
	Id        int          `json:"id"`
	User      UserResponse `json:"user"`
	GroupId   *int         `json:"group_id"`
	Content   string       `json:"content"`
	Privacy   string       `json:"privacy"`
	CreatedAt time.Time    `json:"created_at"`
}
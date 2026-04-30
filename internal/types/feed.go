package types

import "time"

type Post struct {
	Id          int       `json:"id"`
	UserId      string    `json:"user_id"`
	GroupId     *int      `json:"group_id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Privacy     string    `json:"privacy"`
	ImageUrl    *string   `json:"image_url"`
	CreatedAt   time.Time `json:"created_at"`
}

type Comment struct {
	Id        int       `json:"id"`
	UserId    string    `json:"user_id"`
	PostId    int       `json:"post_id"`
	Content   string    `json:"content"`
	ImageUrl  *string   `json:"image_url"`
	CreatedAt time.Time `json:"created_at"`
}

type Reaction struct {
	UserId string `json:"user_id"`
	PostId int    `json:"post_id"`
}

type UserResponse struct {
	Id        string `json:"id"`
	Nickname  string `json:"nickname"`
	FirstName string `json:"fistname"`
	LastName  string `json:"lastname"`
	Avatar    string `json:"avatar"`
}

type PostResponse struct {
	Id            int          `json:"id"`
	User          UserResponse `json:"author"`
	GroupId       *int         `json:"group_id"`
	Title         string       `json:"title"`
	Description   string       `json:"description"`
	Privacy       string       `json:"privacy"`
	ImageUrl      *string      `json:"image_url"`
	CreatedAt     time.Time    `json:"created_at"`
	IsLiked       bool         `json:"is_liked"`
	TotalLikes    int          `json:"total_likes"`
	TotalComments int          `json:"total_comments"`
}

type CommentResponse struct {
	Id        int          `json:"id"`
	PostId    int          `json:"post_id"`
	User      UserResponse `json:"author"`
	Content   string       `json:"content"`
	ImageUrl  *string      `json:"image_url"`
	CreatedAt time.Time    `json:"created_at"`
}

type PostInput struct {
	UserId       string
	GroupId      *int
	Title        string
	Description  string
	Privacy      string
	ImageUrl     *string
	PrivateUsers []string
}

type CommentInput struct {
	UserId   string
	PostId   int
	Content  string
	ImageUrl *string
}

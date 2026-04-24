package types

import "io"

type GroupInput struct {
	CreatorId   string
	Title       string
	Description string

	CoverImage     io.Reader
	CoverImageName string
}

type Group struct {
	Id          string `json:"id"`
	CreatorId   string `json:"creatorId"`
	Title       string `json:"title"`
	Description string `json:"description"`
	CoverPath   string `json:"coverPath"`
	CreatedAt   string `json:"createdAt"`
	MembersCnt  int    `json:"memberCount"`
	Role        string `json:"role"`
}

type JoinRequest struct {
	UserId  string `json:"-"`
	GroupId string `json:"groupId"`
}

type InvitableUser struct {
	Id        string `json:"id"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	IsInvited string `json:"isInvited"`
}

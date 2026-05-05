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
	Id           string `json:"id"`
	CreatorId    string `json:"creatorId"`
	Title        string `json:"title"`
	Description  string `json:"description"`
	CoverPath    string `json:"coverPath"`
	CreatedAt    string `json:"createdAt"`
	MembersCount int    `json:"memberCount"`
	Role         string `json:"role"`
}

type JoinRequestUser struct {
	Id         string `json:"id"`
	FirstName  string `json:"firstName"`
	LastName   string `json:"lastName"`
	CreatedAt  string `json:"createdAt"`
	AvatarPath string `json:"avatarPath"`
}

type InvitableUser struct {
	Id         string `json:"id"`
	FirstName  string `json:"firstName"`
	LastName   string `json:"lastName"`
	CreatedAt  string `json:"createdAt"`
	AvatarPath string `json:"avatarPath"`
	IsInvited  bool   `json:"isInvited"`
}

type Event struct {
	Id          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Date        string `json:"date"`
	Response    string `json:"response"`
	GoingCnt    int    `json:"goingCnt"`
	NotGoingCnt int    `json:"notGoingCnt"`
}

type EventResponse struct {
	EventId  string `json:"eventId"`
	Response string `json:"response"`
}

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

type JoinRequest struct {
	GroupId string `json:"groupId"`
	UserId  string `json:"userId"`
}

type JoinRequestUser struct {
	UserId     string `json:"userId"`
	FirstName  string `json:"firstName"`
	AvatarPath string `json:"avatarPath"`
	LastName   string `json:"lastName"`
}

type Invitation struct {
	GroupId string `json:"groupId"`
	UserId  string `json:"userId"`
}

type InvitableUser struct {
	Id         string `json:"id"`
	FirstName  string `json:"firstName"`
	LastName   string `json:"lastName"`
	AvatarPath string `json:"avatarPath"`
	IsInvited  bool   `json:"isInvited"`
}

type Event struct {
	Id          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Date        string `json:"date"`
	Resp        string `json:"resp"`
	GoingCnt    int    `json:"goingCnt"`
	NotGoingCnt int    `json:"notGoingCnt"`
}

type EventStatus struct {
	EventId string `json:"eventId"`
	Status  string `json:"Status"`
}

package types

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
	Id         string  `json:"id"`
	FirstName  string  `json:"firstName"`
	LastName   string  `json:"lastName"`
	CreatedAt  string  `json:"createdAt"`
	AvatarPath *string `json:"avatarPath"`
}

type InvitableUser struct {
	Id         string  `json:"id"`
	FirstName  string  `json:"firstName"`
	LastName   string  `json:"lastName"`
	CreatedAt  string  `json:"createdAt"`
	AvatarPath *string `json:"avatarPath"`
	IsInvited  bool    `json:"isInvited"`
}

type Event struct {
	Id          string  `json:"id"`
	Title       string  `json:"title"`
	Description string  `json:"description"`
	Date        string  `json:"date"`
	Response    *string `json:"response"`
	GoingCnt    int     `json:"goingCnt"`
	NotGoingCnt int     `json:"notGoingCnt"`
}

type EventResponse struct {
	EventId  string `json:"eventId"`
	Response string `json:"response"`
}

// Notifications data
type InvitationNotificationData struct {
	GroupTitle  string `json:"groupTitle"`
	InviterName string `json:"inviterName"`
}

type JoinRequestNotificationData struct {
	GroupTitle     string `json:"groupTitle"`
	GroupCreatorId string `json:"groupCreatorId"`
	RequesterName  string `json:"requesterName"`
}

type EventNotificationData struct {
	GroupTitle     string   `json:"groupTitle"`
	GroupMemberIds []string `json:"-"`
	EventTitle     string   `json:"eventTitle"`
}

// MembershipResult
type MembershipResult string

const (
	InvitationCreated  MembershipResult = "invitation_created"
	JoinRequestCreated MembershipResult = "join_request_created"
	UserJoined         MembershipResult = "user_joined"
)

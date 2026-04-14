package types

type GroupInput struct {
	CreatorId   string `json:"-"`
	Title       string `json:"title"`
	Description string `json:"description"`
}

type Group struct {
	Id          int    `json:"id"`
	CreatorId   string `json:"creatorId"`
	Title       string `json:"title"`
	Description string `json:"description"`
	CreatedAt   string `json:"createdAt"`
	MembersCnt  int    `json:"memberCount"`
	// IsJoined    bool `json:""`
}

package types

type ChatUser struct {
	Id       string `json:"id"`
	Nickname string `json:"nickname"`
	IsPublic bool   `json:"isPublic"`
}

type IncomingMessage struct {
	ReceiverID string `json:"receiver_id,omitempty"` 
	GroupId    *int   `json:"group_id,omitempty"`    
	Content    string `json:"content"`
}

type Message struct {
	MessageID  int `json:"message_id"`
	SenderID   string `json:"sender_id"`
	ReceiverID string `json:"receiver_id"`
	Content    string `json:"content"`
	IsRead     int    `json:"is_read"`
	CreatedAt  string `json:"created_at"`
	GroupID    *int   `json:"group_id"`
}

type Contact struct {
	UserID      string `json:"user_id"`
	Nickname    string `json:"nickname"`
	Avatar      string `json:"avatar"`
	LastMessage string `json:"last_message"`
	LastTime    string `json:"last_time"`
	UnreadCount int    `json:"unread_count"`
}

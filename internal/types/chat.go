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
	MessageID  int    `json:"message_id"`
	SenderID   string `json:"sender_id"`
	SenderName string `json:"sender_name,omitempty"` 
	ReceiverID string `json:"receiver_id"`
	Content    string `json:"content"`
	IsRead     int    `json:"is_read"`
	CreatedAt  string `json:"created_at"`
	GroupID    *int   `json:"group_id"`
}

type Contact struct {
    UserID      string `json:"id"` 
    FirstName   string `json:"firstName"` 
    LastName    string `json:"lastName"`  
    Nickname    string `json:"nickName,omitempty"`
    Avatar      string `json:"avatar,omitempty"`
    LastMessage string `json:"lastMessage"`
    LastTime    string `json:"lastTime"`
    UnreadCount int    `json:"unreadCount"`
	IsOnline    bool   `json:"isOnline"`
}
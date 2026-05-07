package types

import "time"

type Notification struct {
	ID         int       `json:"id"`          
	Type       string    `json:"type"`        
	SenderID   string    `json:"sender_id"`   
	ReceiverID string    `json:"receiver_id"` 
	EntityID   string    `json:"entity_id"`   
	Content    string    `json:"content"`
	IsRead     bool      `json:"is_read"`     
	CreatedAt  time.Time `json:"created_at"`
}

type HubNotification struct {
	ReceiverID string
	Payload    any
}
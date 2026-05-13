package repositories

import (
	"database/sql"
	"fmt"

	"soc-net/internal/types"
)

type NotificationRepo struct {
	DB *sql.DB
}

func NewNotificationRepo(db *sql.DB) *NotificationRepo {
	return &NotificationRepo{DB: db}
}

func (r *NotificationRepo) CreateNotification(notif types.Notification) (types.Notification, error) {
	query := `
		INSERT INTO notifications (receiver_id, sender_id, type, entity_id, content)
		VALUES (?, ?, ?, ?, ?)
	`
	result, err := r.DB.Exec(query, notif.ReceiverID, notif.SenderID, notif.Type, notif.EntityID, notif.Content)
	if err != nil {
		return types.Notification{}, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return types.Notification{}, err
	}

	var savedNotif types.Notification
	fetchQuery := `
		SELECT n.id, n.receiver_id, n.sender_id, n.type, n.entity_id, 
		       u.first_name || ' ' || u.last_name || ' ' || n.content, 
		       n.is_read, n.created_at 
		FROM notifications n
		JOIN users u ON n.sender_id = u.id
		WHERE n.id = ?
	`
	err = r.DB.QueryRow(fetchQuery, id).Scan(
		&savedNotif.ID,
		&savedNotif.ReceiverID,
		&savedNotif.SenderID,
		&savedNotif.Type,
		&savedNotif.EntityID,
		&savedNotif.Content,
		&savedNotif.IsRead,
		&savedNotif.CreatedAt,
	)
	return savedNotif, err
}

func (r *NotificationRepo) GetUserNotifications(userID string) ([]types.Notification, error) {
	query := `
		SELECT n.id, n.receiver_id, n.sender_id, n.type, n.entity_id, 
		       u.first_name || ' ' || u.last_name || ' ' || n.content, 
		       n.is_read, n.created_at
		FROM notifications n
		JOIN users u ON n.sender_id = u.id
		WHERE n.receiver_id = ?
		ORDER BY n.created_at DESC
	`
	rows, err := r.DB.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notifs []types.Notification
	for rows.Next() {
		var n types.Notification
		if err := rows.Scan(&n.ID, &n.ReceiverID, &n.SenderID, &n.Type, &n.EntityID, &n.Content, &n.IsRead, &n.CreatedAt); err != nil {
			return nil, err
		}
		notifs = append(notifs, n)
	}
	return notifs, nil
}

func (r *NotificationRepo) MarkAsRead(notifID int, userID string) error {
	query := `UPDATE notifications SET is_read = 1 WHERE id = ? AND receiver_id = ?`
	_, err := r.DB.Exec(query, notifID, userID)
	return err
}

func (r *NotificationRepo) DeleteNotification(receiverID string, senderID string, notifType string) error {
    query := `DELETE FROM notifications WHERE receiver_id = ? AND sender_id = ? AND type = ?`
    res, err := r.DB.Exec(query, receiverID, senderID, notifType)
    
    if err == nil {
        rows, _ := res.RowsAffected()
        fmt.Println("Rows deleted:", rows)
    }
    
    return err
}

func (r *NotificationRepo) DeleteSingleNotification(receiverID string, notifType string) error {
	query := `DELETE FROM notifications WHERE receiver_id = ? AND type = ?`
	_, err := r.DB.Exec(query, receiverID, notifType)
	return err
}

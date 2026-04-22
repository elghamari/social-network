package repositories

import (
	"database/sql"
	"errors"

	"soc-net/internal/types"
)

type ChatRepo struct {
	DB *sql.DB
}

func NewChatRepo(DB *sql.DB) *ChatRepo {
	return &ChatRepo{DB: DB}
}

func (r *ChatRepo) InsertPrivateMessage(tx *sql.Tx, senderID, receiverID, content string) (int64, error) {
	query := `INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)`
	result, err := tx.Exec(query, senderID, receiverID, content)
	if err != nil {
		return 0, err
	}
	return result.LastInsertId()
}

func (r *ChatRepo) InsertGroupMessage(tx *sql.Tx, groupID int, senderID, content string) (int64, error) {
	query := `INSERT INTO group_messages (group_id, sender_id, content) VALUES (?, ?, ?)`
	result, err := tx.Exec(query, groupID, senderID, content)
	if err != nil {
		return 0, err
	}
	return result.LastInsertId()
}

func (r *ChatRepo) GetPrivateHistory(user1, user2 string, cursor int64) ([]types.Message, error) {
	var rows *sql.Rows
	var err error

	if cursor == 0 {
		query := `
			SELECT message_id, sender_id, receiver_id, content, is_read, created_at 
			FROM messages 
			WHERE ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))
			ORDER BY message_id DESC LIMIT 20`
		rows, err = r.DB.Query(query, user1, user2, user2, user1)
	} else {
		query := `
			SELECT message_id, sender_id, receiver_id, content, is_read, created_at 
			FROM messages 
			WHERE ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))
			AND message_id < ? 
			ORDER BY message_id DESC LIMIT 20`
		rows, err = r.DB.Query(query, user1, user2, user2, user1, cursor)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []types.Message
	for rows.Next() {
		var msg types.Message
		if err := rows.Scan(&msg.MessageID, &msg.SenderID, &msg.ReceiverID, &msg.Content, &msg.IsRead, &msg.CreatedAt); err != nil {
			return nil, err
		}
		messages = append(messages, msg)
	}
	for i, j := 0, len(messages)-1; i < j; i, j = i+1, j-1 {
		messages[i], messages[j] = messages[j], messages[i]
	}
	return messages, nil
}

func (r *ChatRepo) GetGroupHistory(groupID int, cursor int64) ([]types.Message, error) {
	var rows *sql.Rows
	var err error

	if cursor == 0 {
		query := `
			SELECT message_id, sender_id, content, created_at 
			FROM group_messages 
			WHERE group_id = ? 
			ORDER BY message_id DESC LIMIT 20`
		rows, err = r.DB.Query(query, groupID)
	} else {
		query := `
			SELECT message_id, sender_id, content, created_at 
			FROM group_messages 
			WHERE group_id = ? AND message_id < ? 
			ORDER BY message_id DESC LIMIT 20`
		rows, err = r.DB.Query(query, groupID, cursor)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []types.Message
	for rows.Next() {
		var msg types.Message
		if err := rows.Scan(&msg.MessageID, &msg.SenderID, &msg.Content, &msg.CreatedAt); err != nil {
			return nil, err
		}
		messages = append(messages, msg)
	}
	for i, j := 0, len(messages)-1; i < j; i, j = i+1, j-1 {
		messages[i], messages[j] = messages[j], messages[i]
	}
	return messages, nil
}

func (r *ChatRepo) FetchPrivateMessageByID(tx *sql.Tx, messageID int64) (types.Message, error) {
	var msg types.Message
	query := `SELECT message_id, sender_id, receiver_id, content, is_read, created_at FROM messages WHERE message_id = ?`

	err := tx.QueryRow(query, messageID).Scan(&msg.MessageID, &msg.SenderID, &msg.ReceiverID, &msg.Content, &msg.IsRead, &msg.CreatedAt)
	return msg, err
}

func (r *ChatRepo) MarkPrivateAsRead(senderID, receiverID string) error {
	query := `UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ? AND is_read = 0`
	_, err := r.DB.Exec(query, senderID, receiverID)
	return err
}

func (r *ChatRepo) GetRecentContacts(userID string) ([]types.Contact, error) {
	query := `
		SELECT 
			u.id AS user_id,
			COALESCE(u.nickname, u.first_name || ' ' || u.last_name) AS nickname,
			COALESCE(u.avatar, '') AS avatar,
			COALESCE(lm.content, '') AS last_message,
			COALESCE(lm.created_at, '') AS last_time,
			COALESCE(uc.unread_count, 0) AS unread_count
		FROM users u
		LEFT JOIN messages lm ON lm.message_id = (
			SELECT m2.message_id FROM messages m2 
			WHERE (m2.sender_id = ? AND m2.receiver_id = u.id) 
			   OR (m2.sender_id = u.id AND m2.receiver_id = ?)
			ORDER BY m2.created_at DESC LIMIT 1
		)
		LEFT JOIN (
			SELECT sender_id, COUNT(*) AS unread_count 
			FROM messages 
			WHERE receiver_id = ? AND is_read = 0 
			GROUP BY sender_id
		) uc ON uc.sender_id = u.id
		WHERE u.id != ? AND lm.message_id IS NOT NULL
		ORDER BY lm.created_at DESC
	`

	rows, err := r.DB.Query(query, userID, userID, userID, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var contacts []types.Contact
	for rows.Next() {
		var c types.Contact
		if err := rows.Scan(&c.UserID, &c.Nickname, &c.Avatar, &c.LastMessage, &c.LastTime, &c.UnreadCount); err != nil {
			return nil, err
		}
		contacts = append(contacts, c)
	}
	return contacts, nil
}

func (r *ChatRepo) CheckUserPrivacy(userID string) (bool, error) {
	var isPublic bool
	err := r.DB.QueryRow(`SELECT is_public FROM users WHERE id = ?`, userID).Scan(&isPublic)
	return isPublic, err
}

func (r *ChatRepo) AreConnected(userA, userB string) (bool, error) {
	var count int
	query := `
		SELECT COUNT(*) 
		FROM users u
		LEFT JOIN followers f ON (f.follower_id = ? AND f.following_id = ?) 
		                      OR (f.follower_id = ? AND following_id = ?)
		WHERE u.id IN (?, ?) AND (u.is_public = 1 OR f.follower_id IS NOT NULL)
	`
	
	err := r.DB.QueryRow(query, userA, userB, userB, userA, userA, userB).Scan(&count)
	return count > 0, err
}

func (r *ChatRepo) IsFollowing(followerID, followingID string) (bool, error) {
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM followers WHERE follower_id = ? AND following_id = ?)`
	err := r.DB.QueryRow(query, followerID, followingID).Scan(&exists)
	return exists, err
}

func (r *ChatRepo) GetAvailableChatUsers(userID string) ([]types.Contact, error) {
	query := `
		SELECT DISTINCT 
			u.id AS user_id,
			COALESCE(u.nickname, u.first_name || ' ' || u.last_name) AS nickname,
			COALESCE(u.avatar, '') AS avatar
		FROM users u
		LEFT JOIN followers f ON (f.follower_id = ? AND f.following_id = u.id) 
		                      OR (f.follower_id = u.id AND f.following_id = ?)
		WHERE u.id != ? AND (u.is_public = 1 OR f.follower_id IS NOT NULL)
	`

	rows, err := r.DB.Query(query, userID, userID, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var contacts []types.Contact
	for rows.Next() {
		var c types.Contact
		if err := rows.Scan(&c.UserID, &c.Nickname, &c.Avatar); err != nil {
			return nil, err
		}
		contacts = append(contacts, c)
	}
	return contacts, nil
}

func (r *ChatRepo) FetchGroupMessageByID(tx *sql.Tx, messageID int64) (types.Message, error) {
	var msg types.Message
	query := `SELECT message_id, group_id, sender_id, content, created_at FROM group_messages WHERE message_id = ?`
	err := tx.QueryRow(query, messageID).Scan(&msg.MessageID, &msg.GroupID, &msg.SenderID, &msg.Content, &msg.CreatedAt)
	return msg, err
}

func (r *ChatRepo) GetGroupMemberIDs(groupID int) ([]string, error) {
	query := `SELECT user_id FROM group_members WHERE group_id = ?`
	rows, err := r.DB.Query(query, groupID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var memberIDs []string
	for rows.Next() {
		var id string
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		memberIDs = append(memberIDs, id)
	}
	return memberIDs, nil
}

func (r *ChatRepo) UpdateGroupLastRead(groupId int, userId string, messageId int64) error {
	query := `
		INSERT INTO group_chat_cursors (group_id, user_id, last_read_message_id)
		VALUES (?, ?, ?)
		ON CONFLICT(group_id, user_id) DO UPDATE SET 
		last_read_message_id = excluded.last_read_message_id,
		updated_at = CURRENT_TIMESTAMP
	`
	_, err := r.DB.Exec(query, groupId, userId, messageId)
	return err
}

func (r *ChatRepo) GetGroupLastRead(groupId int, userId string) (int64, error) {
	query := `SELECT last_read_message_id FROM group_chat_cursors WHERE group_id = ? AND user_id = ?`

	var lastRead int64
	err := r.DB.QueryRow(query, groupId, userId).Scan(&lastRead)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return 0, nil 
		}
		return 0, err
	}

	return lastRead, nil
}

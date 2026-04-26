package repositories

import (
	"database/sql"
	"fmt"
	"soc-net/internal/types"
	"strconv"
)

type GroupRepo struct {
	DB *sql.DB
}

func NewGroupRepo(db *sql.DB) *GroupRepo {
	return &GroupRepo{DB: db}
}

var groupRepoName = "group-repo"

// ===== Groups

func (r *GroupRepo) InsertGroup(input types.GroupInput, destPath string) (string, error) {
	res, err := r.DB.Exec(`
	INSERT INTO groups
		(creator_id, title, description, cover_path)
	VALUES (?, ?, ?, ?)
	`, input.CreatorId, input.Title, input.Description, destPath)
	if err != nil {
		return "", fmt.Errorf("%s.InsertGroup: Inserting %w", groupRepoName, err)
	}

	intGroupId, err := res.LastInsertId()
	if err != nil {
		return "", fmt.Errorf("%s.InsertGroup: LastInsertId %w", groupRepoName, err)
	}

	return strconv.Itoa(int(intGroupId)), nil
}

func (r *GroupRepo) InsertGroupMember(groupId, userId string, isCreator bool) error {
	_, err := r.DB.Exec(`
	INSERT OR IGNORE INTO group_members 
	(group_id, user_id, is_creator)
	VALUES (?, ?, ?)
	`, groupId, userId, isCreator)
	if err != nil {
		return fmt.Errorf("%s.InsertGroupMember: %w", groupRepoName, err)
	}
	return nil
}

func (r *GroupRepo) groupBaseQuery() string {
	return `
	SELECT 
		g.id, g.creator_id, g.title, g.description, g.cover_path, g.created_at,

		(SELECT COUNT(*) FROM group_members WHERE group_id = g.id) AS members_cnt,

		CASE
			WHEN EXISTS(
				SELECT 1 FROM group_members gm 
				WHERE gm.group_id = g.id AND gm.user_id = ?
				AND gm.is_creator = 1
			) THEN 'CREATOR'

			WHEN EXISTS (
				SELECT 1 FROM group_members gm
				WHERE gm.group_id = g.id AND gm.user_id = ?
			) THEN 'MEMBER'

			WHEN EXISTS (
				SELECT 1 FROM group_join_requests gjr
				WHERE gjr.group_id = g.id AND gjr.user_id = ?
			) THEN 'PENDING'

			ELSE 'NONE'
		END AS role
	
	FROM groups g
	`
}

func (r *GroupRepo) getGroupsQuery(userId, tab, search string) (string, []any) {
	query := r.groupBaseQuery() + `WHERE 1=1`
	args := []any{userId, userId, userId}

	if search != "" {
		query += ` AND g.title LIKE '%' || ? || '%'`
		args = append(args, search)
	}

	switch tab {
	case "joined":
		query += `
		AND EXISTS(
			SELECT 1 
			FROM group_members gm 
			WHERE gm.user_id = ? AND gm.group_id = g.id
		)`
		args = append(args, userId)

	case "pending":
		query += `
		AND EXISTS(
			SELECT 1 
			FROM group_join_requests gjr 
			WHERE gjr.user_id = ? AND gjr.group_id = g.id
		)`
		args = append(args, userId)
	}

	return query, args
}

func (r *GroupRepo) ListGroups(userId, tab, search string) ([]types.Group, error) {
	query, args := r.getGroupsQuery(userId, tab, search)

	rows, err := r.DB.Query(query, args...)
	if err != nil {
		return nil, fmt.Errorf("%s.ListGroups: Reading: %w", groupRepoName, err)
	}
	defer rows.Close()

	groups := []types.Group{}
	for rows.Next() {
		group := types.Group{}
		err := rows.Scan(
			&group.Id, &group.CreatorId, &group.Title, &group.Description,
			&group.CoverPath, &group.CreatedAt, &group.MembersCnt, &group.Role,
		)
		if err != nil {
			return nil, fmt.Errorf("%s.ListGroups: Scanning: %w", groupRepoName, err)
		}
		groups = append(groups, group)
	}
	return groups, nil
}

func (r *GroupRepo) GroupExists(groupId string) (bool, error) {
	var exists bool
	err := r.DB.QueryRow(`
		SELECT EXISTS(
			SELECT 1 FROM groups WHERE id = ?
		)
	`, groupId).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("%s.GroupExists: %w", groupRepoName, err)
	}
	return exists, nil
}

func (r *GroupRepo) getGroupForUserQuery(groupId, userId string) (string, []any) {
	query := r.groupBaseQuery() + `WHERE g.id = ?`
	args := []any{userId, userId, userId, groupId}
	return query, args
}

func (r *GroupRepo) GetGroupForUser(groupId, userId string) (types.Group, error) {
	group := types.Group{}
	query, args := r.getGroupForUserQuery(groupId, userId)

	err := r.DB.QueryRow(query, args...).Scan(
		&group.Id, &group.CreatorId, &group.Title, &group.Description,
		&group.CoverPath, &group.CreatedAt, &group.MembersCnt, &group.Role,
	)
	if err != nil {
		return types.Group{}, fmt.Errorf("%s.GetGroupForUser: %w", groupRepoName, err)
	}
	return group, nil
}

// ===== Join requests

func (r *GroupRepo) InsertJoinRequest(groupId, userId string) error {
	_, err := r.DB.Exec(`
	INSERT OR IGNORE INTO group_join_requests 
	(group_id, user_id)
	VALUES (?, ?)
	`, groupId, userId)
	if err != nil {
		return fmt.Errorf("%s.InsertJoinRequest: %w", groupRepoName, err)
	}
	return nil
}

func (r *GroupRepo) DeleteJoinRequest(groupId, userId string) error {
	_, err := r.DB.Exec(`
	DELETE FROM group_join_requests 
	WHERE group_id = ? AND user_id = ?
	`, groupId, userId)
	if err != nil {
		return fmt.Errorf("%s.DeleteJoinRequest: %w", groupRepoName, err)
	}
	return nil
}

// ===== Invitations

func (r *GroupRepo) ListInvitableUsersForGroup(groupId, userId string) ([]types.InvitableUser, error) {
	rows, err := r.DB.Query(`
		SELECT u.id, u.first_name, u.last_name, u.avatar,
		EXISTS(SELECT 1 FROM group_invitations WHERE group_id = ? AND user_id = u.id)

		FROM users u
		WHERE
		NOT EXISTS(
			SELECT 1 FROM group_members WHERE group_id = ? AND user_id = u.id 
		)
		AND u.id != ?
	`, groupId, groupId, userId)
	if err != nil {
		return nil, fmt.Errorf("%s.ListInvitableUsersForGroup: Reading: %w", groupRepoName, err)
	}

	invitableUsers := []types.InvitableUser{}
	for rows.Next() {
		iu := types.InvitableUser{}
		err := rows.Scan(&iu.Id, &iu.FirstName, &iu.LastName, &iu.AvatarPath, &iu.IsInvited)
		if err != nil {
			return nil, fmt.Errorf("%s.ListInvitableUsersForGroup: Scan: %w", groupRepoName, err)
		}
		invitableUsers = append(invitableUsers, iu)
	}
	return invitableUsers, nil
}

func (r *GroupRepo) InsertGroupInvitation(groupId, inviterId, invitedUserId string) error {
	_, err := r.DB.Exec(`
		INSERT OR IGNORE INTO group_invitations 
		(group_id, inviter_id, user_id)
		VALUES (?, ?, ?)
	`, groupId, inviterId, invitedUserId)
	if err != nil {
		return fmt.Errorf("%s.InsertGroupInvitation: %w", groupRepoName, err)
	}
	return nil
}

func (r *GroupRepo) DeleteGroupInvitation(groupId, userId string) error {
	_, err := r.DB.Exec(`
		DELETE FROM group_invitations 
		WHERE group_id = ? AND user_id = ?
	`, groupId, userId)
	if err != nil {
		return fmt.Errorf("%s.DeleteGroupInvitation: %w", groupRepoName, err)
	}
	return nil
}

// ===== Role

func (r *GroupRepo) GetUserGroupRole(groupId, userId string) (string, error) {
	var role string
	err := r.DB.QueryRow(`
		SELECT CASE
			WHEN EXISTS(
				SELECT 1 FROM group_members
				WHERE group_id = ? AND user_id = ? AND is_creator = 1
			) THEN 'CREATOR'

			WHEN EXISTS(
				SELECT 1 FROM group_members
				WHERE group_id = ? AND user_id = ?
			) THEN 'MEMBER'

			WHEN EXISTS(
				SELECT 1 FROM group_join_requests
				WHERE group_id = ? AND user_id = ?
			) THEN 'PENDING'

			ELSE 'NONE'
		END
	`, groupId, userId, groupId, userId, groupId, userId).Scan(&role)
	if err != nil {
		return "", fmt.Errorf("%s.GetUserGroupRole: %w", groupRepoName, err)
	}
	return role, nil
}

// ===== Join request users list

func (r *GroupRepo) ListJoinRequestUsersForGroup(groupId string) ([]types.JoinRequestUser, error) {
	rows, err := r.DB.Query(`
		SELECT u.id, u.first_name, u.last_name, u.avatar,
		FROM group_join_requests gjr
		LEFT JOIN users u ON gjr.user_id = u.id
		WHERE gjr.group_id = ?
	`, groupId)
	if err != nil {
		return nil, fmt.Errorf("%s.ListJoinRequestUsersForGroup: Reading: %w", groupRepoName, err)
	}

	requests := []types.JoinRequestUser{}
	for rows.Next() {
		req := types.JoinRequestUser{}
		err := rows.Scan(&req.UserId, &req.FirstName, &req.LastName, &req.AvatarPath)
		if err != nil {
			return nil, fmt.Errorf("%s.ListJoinRequestUsersForGroup: Scan: %w", groupRepoName, err)
		}
		requests = append(requests, req)
	}
	return requests, nil
}

func (r *GroupRepo) InsertEvent(tx *sql.Tx, groupId string, event types.Event) (string, error) {
	res, err := tx.Exec(`
		INSERT INTO events
		(title, description, date) VALUES (?, ?, ?)
	`, event.Title, event.Description, event.Date)
	if err != nil {
		return "", fmt.Errorf("%s.InsertEvent: Inserting %w", groupRepoName, err)
	}

	eventId, err := res.LastInsertId()
	if err != nil {
		return "", fmt.Errorf("%s.InsertEvent: Getting Id %w", groupRepoName, err)
	}

	return strconv.Itoa(int(eventId)), nil
}

// func (r *GroupRepo) eventBaseQuery() string {
// 	return `
// 	SELECT 
// 		e.id, e.title, e.description, e.date,

// 		(SELECT COUNT(*) FROM group_members WHERE group_id = g.id) AS going_cnt,

// 		(SELECT COUNT(*) FROM group_members WHERE group_id = g.id) AS not_going_cnt,
	
// 	FROM events e
// 	`
// }

// func (r *GroupRepo) GetEventById(tx *sql.Tx, eventId string) (types.Event, error) {
// 	tx.QueryRow(``)
// }

func (r *GroupRepo) ListEvents(groupId, userId string) ([]types.Event, error) {
	r.DB.Query(`
		SELECT e.id, e.title, e.description, e.created_at,
FROM events e

LEFT JOIN event_responses er ON e.id = er.event_id AND user_id = ?
	`)
	return nil, nil
}

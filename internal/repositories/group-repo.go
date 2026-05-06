package repositories

import (
	"database/sql"
	"fmt"
	"soc-net/internal/types"
	"strconv"
	"strings"
)

// DBTX allows repo methods to accept both *sql.DB and *sql.Tx.
type DBTX interface {
	Exec(query string, args ...any) (sql.Result, error)
	Query(query string, args ...any) (*sql.Rows, error)
	QueryRow(query string, args ...any) *sql.Row
}

type GroupRepo struct {
	DB *sql.DB
}

func NewGroupRepo(db *sql.DB) *GroupRepo {
	return &GroupRepo{DB: db}
}

var groupRepoName = "group-repo"

// ============================================================
// Groups
// ============================================================

func (r *GroupRepo) IsTitleTaken(title string) (bool, error) {
	var exists bool
	err := r.DB.QueryRow(`
		SELECT EXISTS(SELECT 1 FROM groups WHERE title = ?)
	`, title).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("%s.IsTitleTaken: %w", groupRepoName, err)
	}

	return exists, nil
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

func (r *GroupRepo) CheckGroupAndMembership(groupId int, userId string) (bool, bool, error) {
	var groupExists, isMember bool

	query := `
        SELECT 
            EXISTS(SELECT 1 FROM groups WHERE id = ?),
            EXISTS(SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?)
    `
	err := r.DB.QueryRow(query, groupId, groupId, userId).Scan(&groupExists, &isMember)
	if err != nil {
		return false, false, fmt.Errorf("GroupsRepo.CheckGroupAndMembership: %w", err)
	}

	return groupExists, isMember, nil
}

func (r *GroupRepo) InsertGroup(db DBTX, group types.Group, userId string) (string, error) {
	if db == nil {
		db = r.DB
	}

	res, err := db.Exec(`
	INSERT INTO groups
		(creator_id, title, description, cover_path)
	VALUES (?, ?, ?, ?)
	`, userId, group.Title, group.Description, group.CoverPath)
	if err != nil {
		return "", fmt.Errorf("%s.InsertGroup: Inserting %w", groupRepoName, err)
	}

	groupId, err := res.LastInsertId()
	if err != nil {
		return "", fmt.Errorf("%s.InsertGroup: LastInsertId %w", groupRepoName, err)
	}

	return strconv.Itoa(int(groupId)), nil
}

func (r *GroupRepo) InsertGroupMember(db DBTX, groupId, userId string, isCreator bool) error {
	if db == nil {
		db = r.DB
	}

	_, err := db.Exec(`
	INSERT OR IGNORE INTO group_members 
	(group_id, user_id, is_creator)
	VALUES (?, ?, ?)
	`, groupId, userId, isCreator)
	if err != nil {
		return fmt.Errorf("%s.InsertGroupMember: %w", groupRepoName, err)
	}
	return nil
}

func (r *GroupRepo) groupBaseSQL(userId string) (string, []any) {
	return `
	SELECT 
    g.id, g.creator_id, g.title, g.description, g.cover_path, g.created_at,
    (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) AS members_cnt,

    CASE
        WHEN gm_user.is_creator = 1 THEN 'creator'
        WHEN gm_user.user_id IS NOT NULL THEN 'member'
        WHEN gjr.user_id IS NOT NULL THEN 'pending_request'
        WHEN gi.user_id IS NOT NULL THEN 'pending_invitation'
        ELSE 'none'
    END AS role

	FROM groups g
	LEFT JOIN group_members gm_user ON gm_user.group_id = g.id AND gm_user.user_id = ?
	LEFT JOIN group_join_requests gjr ON gjr.group_id = g.id AND gjr.user_id = ?
	LEFT JOIN group_invitations gi ON gi.group_id = g.id AND gi.user_id = ?
	WHERE 1=1`, []any{userId, userId, userId}

}

func (r *GroupRepo) getGroupForUserSQL(groupId, userId string) (string, []any) {
	sql, args := r.groupBaseSQL(userId)

	sql += `
	AND g.id = ?`

	args = append(args, groupId)

	return sql, args
}

func (r *GroupRepo) GetGroupForUser(db DBTX, groupId, userId string) (types.Group, error) {
	if db == nil {
		db = r.DB
	}

	group := types.Group{}
	query, args := r.getGroupForUserSQL(groupId, userId)

	err := db.QueryRow(query, args...).Scan(
		&group.Id, &group.CreatorId, &group.Title, &group.Description,
		&group.CoverPath, &group.CreatedAt, &group.MembersCount, &group.Role,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return types.Group{}, types.NewNotFoundError("GroupGroup does not exist.")
		}
		return types.Group{}, fmt.Errorf("%s.GetGroupForUser: %w", groupRepoName, err)
	}
	return group, nil
}

func (r *GroupRepo) getGroupsSQL(userId, tab, query, cursor string) (string, []any) {
	sql, args := r.groupBaseSQL(userId)

	if query != "" {
		sql += `
    AND g.title LIKE '%' || ? || '%'`
		args = append(args, query)
	}

	switch tab {
	case "discover":
		sql += `
		AND NOT EXISTS(
    	    SELECT 1 FROM group_members gm
    	    WHERE gm.user_id = ? AND gm.group_id = g.id
    	)
		AND NOT EXISTS(
    	    SELECT 1 FROM group_join_requests gjr
    	    WHERE gjr.user_id = ? AND gjr.group_id = g.id
    	)
		AND NOT EXISTS(
    		SELECT 1 FROM group_invitations gi
    		WHERE gi.user_id = ? AND gi.group_id = g.id
		)`
		args = append(args, userId, userId, userId)

	case "joined":
		sql += `
		AND EXISTS(
			SELECT 1 
			FROM group_members gm 
			WHERE gm.user_id = ? AND gm.group_id = g.id
		)`
		args = append(args, userId)

	case "requests":
		sql += `
		AND EXISTS(
			SELECT 1 
			FROM group_join_requests gjr 
			WHERE gjr.user_id = ? AND gjr.group_id = g.id
		)`
		args = append(args, userId)

	case "invitations":
		sql += `
		AND EXISTS(
			SELECT 1 
			FROM group_invitations gi
			WHERE gi.user_id = ? AND gi.group_id = g.id
		)`
		args = append(args, userId)
	}

	if cursor != "" {
		sql += `
		AND g.id < ?`
		args = append(args, cursor)
	}

	sql += `
	ORDER BY g.id DESC
	LIMIT 20`

	return sql, args
}

func (r *GroupRepo) ListGroups(userId, tab, query, cursor string) ([]types.Group, error) {
	sql, args := r.getGroupsSQL(userId, tab, query, cursor)

	rows, err := r.DB.Query(sql, args...)
	if err != nil {
		return nil, fmt.Errorf("%s.ListGroups: Reading: %w", groupRepoName, err)
	}
	defer rows.Close()

	groups := []types.Group{}
	for rows.Next() {
		group := types.Group{}
		err := rows.Scan(
			&group.Id, &group.CreatorId, &group.Title, &group.Description,
			&group.CoverPath, &group.CreatedAt, &group.MembersCount, &group.Role,
		)
		if err != nil {
			return nil, fmt.Errorf("%s.ListGroups: Scanning: %w", groupRepoName, err)
		}
		groups = append(groups, group)
	}
	return groups, nil
}

// ============================================================
// Invitations
// ============================================================

func (r *GroupRepo) getInvitableUsersSQL(groupId, userId, query, cursor string) (string, []any) {
	sql := `
    SELECT u.id, u.first_name, u.last_name, u.created_at, u.avatar,
    gi.user_id IS NOT NULL AS is_invited
    FROM users u
    LEFT JOIN group_invitations gi ON gi.group_id = ? AND gi.user_id = u.id 
    WHERE u.id != ?
    AND NOT EXISTS (
        SELECT 1 FROM group_members gm 
        WHERE gm.group_id = ? AND gm.user_id = u.id
    )`
	args := []any{groupId, userId, groupId}

	query = strings.ToLower(query)
	if query != "" {
		sql += `
		AND (u.first_name || ' ' || u.last_name) LIKE ?`
		args = append(args, "%"+query+"%")
	}

	if cursor != "" {
		sql += `
		AND u.created_at < ?`
		args = append(args, cursor)
	}

	sql += `
	ORDER BY u.created_at DESC
	LIMIT 20`

	return sql, args
}

func (r *GroupRepo) GetInvitableUsersForGroup(groupId, userId, query, cursor string) ([]types.InvitableUser, error) {
	sql, args := r.getInvitableUsersSQL(groupId, userId, query, cursor)

	rows, err := r.DB.Query(sql, args...)
	if err != nil {
		return nil, fmt.Errorf("%s.ListInvitableUsersForGroup: Reading: %w", groupRepoName, err)
	}

	users := []types.InvitableUser{}
	for rows.Next() {
		iu := types.InvitableUser{}
		err := rows.Scan(&iu.Id, &iu.FirstName, &iu.LastName, &iu.CreatedAt, &iu.AvatarPath, &iu.IsInvited)
		if err != nil {
			return nil, fmt.Errorf("%s.ListInvitableUsersForGroup: Scan: %w", groupRepoName, err)
		}
		users = append(users, iu)
	}

	return users, nil
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

func (r *GroupRepo) DeleteGroupInvitation(db DBTX, groupId, userId string) error {
	if db == nil {
		db = r.DB
	}

	_, err := db.Exec(`
		DELETE FROM group_invitations 
		WHERE group_id = ? AND user_id = ?
	`, groupId, userId)
	if err != nil {
		return fmt.Errorf("%s.DeleteGroupInvitation: %w", groupRepoName, err)
	}
	return nil
}

func (r *GroupRepo) HasGroupInvitation(groupId, userId string) (bool, error) {
	var exists bool
	err := r.DB.QueryRow(`
        SELECT EXISTS(
            SELECT 1 FROM group_invitations
            WHERE group_id = ? AND user_id = ?
        )
    `, groupId, userId).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("%s.HasGroupInvitation: %w", groupRepoName, err)
	}
	return exists, nil
}

// ============================================================
// Join Requests
// ============================================================

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

func (r *GroupRepo) DeleteJoinRequest(db DBTX, groupId, userId string) error {
	if db == nil {
		db = r.DB
	}

	_, err := db.Exec(`
		DELETE FROM group_join_requests 
		WHERE group_id = ? AND user_id = ?
	`, groupId, userId)
	if err != nil {
		return fmt.Errorf("%s.DeleteJoinRequest: %w", groupRepoName, err)
	}
	return nil
}

func (r *GroupRepo) getJoinRequestBaseSQL(groupId string) (string, []any) {
	return `
		SELECT u.id, u.first_name, u.last_name, u.created_at, u.avatar
		FROM group_join_requests gjr
		JOIN users u ON u.id = gjr.user_id
		WHERE gjr.group_id = ?`,
		[]any{groupId}
}

func (r *GroupRepo) getJoinRequestUsersSQL(groupId, cursor string) (string, []any) {
	sql, args := r.getJoinRequestBaseSQL(groupId)

	if cursor != "" {
		sql += `
		AND u.created_at < ?`
		args = append(args, cursor)
	}

	sql += `
	ORDER BY u.created_at DESC
	LIMIT 20`

	return sql, args
}

func (r *GroupRepo) GetJoinRequestUsersForGroup(groupId, cursor string) ([]types.JoinRequestUser, error) {
	sql, args := r.getJoinRequestUsersSQL(groupId, cursor)

	rows, err := r.DB.Query(sql, args...)
	if err != nil {
		return nil, fmt.Errorf("%s.GetJoinRequestUsersForGroup: Reading: %w", groupRepoName, err)
	}

	requests := []types.JoinRequestUser{}
	for rows.Next() {
		req := types.JoinRequestUser{}
		err := rows.Scan(&req.Id, &req.FirstName, &req.LastName, &req.CreatedAt, &req.AvatarPath)
		if err != nil {
			return nil, fmt.Errorf("%s.GetJoinRequestUsersForGroup: Scan: %w", groupRepoName, err)
		}
		requests = append(requests, req)
	}
	return requests, nil
}

func (r *GroupRepo) getJoinRequestUserSQL(groupId, userId string) (string, []any) {
	sql, args := r.getJoinRequestBaseSQL(groupId)

	sql += `
	AND gjr.user_id = ?`

	args = append(args, userId)

	return sql, args
}

func (r *GroupRepo) GetJoinRequestUserForGroup(groupId, userId string) (types.JoinRequestUser, error) {
	sql, args := r.getJoinRequestUserSQL(groupId, userId)

	user := types.JoinRequestUser{}

	err := r.DB.QueryRow(sql, args...).Scan(&user.Id, &user.FirstName, &user.LastName, &user.CreatedAt, &user.AvatarPath)
	if err != nil {
		return types.JoinRequestUser{}, fmt.Errorf("%s.GetJoinRequestUserForGroup: %w", groupRepoName, err)
	}

	return user, nil
}

func (r *GroupRepo) HasJoinRequest(groupId, userId string) (bool, error) {
	var exists bool
	err := r.DB.QueryRow(`
        SELECT EXISTS(
            SELECT 1 FROM group_join_requests
            WHERE group_id = ? AND user_id = ?
        )
    `, groupId, userId).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("%s.HasJoinRequest: %w", groupRepoName, err)
	}
	return exists, nil
}

// ============================================================
// Role
// ============================================================

func (r *GroupRepo) GetUserGroupRole(groupId, userId string) (string, error) {
	var role string
	err := r.DB.QueryRow(`
        SELECT 
        CASE 
            WHEN gm.is_creator = 1 THEN 'creator'
            ELSE 'member'
        END AS role
        FROM group_members gm
        WHERE gm.group_id = ? AND user_id = ?
    `, groupId, userId).Scan(&role)
	if err != nil {
		if err == sql.ErrNoRows {
			return "none", nil
		}
		return "", fmt.Errorf("%s.GetUserGroupRole: %w", groupRepoName, err)
	}
	return role, nil
}

// ============================================================
// Events
// ============================================================

func (r *GroupRepo) EventBelongsToGroup(eventId, groupId string) (bool, error) {
	var exists bool
	err := r.DB.QueryRow(`
		SELECT EXISTS(
			SELECT 1 FROM events WHERE id = ? AND group_id = ?
		)
	`, eventId, groupId).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("%s.EventBelongsToGroup: %w", groupRepoName, err)
	}

	return exists, nil
}

func (r *GroupRepo) InsertEvent(db DBTX, groupId string, event types.Event) (string, error) {
	if db == nil {
		db = r.DB
	}

	res, err := db.Exec(`
		INSERT INTO events
		(group_id, title, description, date) VALUES (?, ?, ?, ?)
	`, groupId, event.Title, event.Description, event.Date)
	if err != nil {
		return "", fmt.Errorf("%s.InsertEvent: Inserting %w", groupRepoName, err)
	}

	eventId, err := res.LastInsertId()
	if err != nil {
		return "", fmt.Errorf("%s.InsertEvent: Getting Id %w", groupRepoName, err)
	}

	return strconv.Itoa(int(eventId)), nil
}

func (r *GroupRepo) eventBaseSQL(userId string) (string, []any) {
	return `
	SELECT 
		e.id, e.title, e.description, e.date,

		COALESCE(er.response,'NONE') AS response,

		(SELECT COUNT(*) FROM event_responses WHERE response = 'GOING' AND event_id = e.id) AS going_cnt,
		(SELECT COUNT(*) FROM event_responses WHERE response = 'NOT_GOING' AND event_id = e.id) AS not_going_cnt
		
	FROM events e
	LEFT JOIN event_responses er ON er.event_id = e.id AND er.user_id = ?
	`, []any{userId}
}

func (r *GroupRepo) getEventForUserQuery(eventId, userId string) (string, []any) {
	sql, args := r.eventBaseSQL(userId)

	sql += "WHERE e.id = ?"
	args = append(args, eventId)

	return sql, args
}

func (r *GroupRepo) GetEventForUser(db DBTX, userId, eventId string) (types.Event, error) {
	if db == nil {
		db = r.DB
	}

	event := types.Event{}

	sql, args := r.getEventForUserQuery(eventId, userId)

	err := db.QueryRow(sql, args...).Scan(&event.Id, &event.Title, &event.Description, &event.Date, &event.Response, &event.GoingCnt, &event.NotGoingCnt)
	if err != nil {
		return types.Event{}, fmt.Errorf("%s.GetEventById: %w", groupRepoName, err)
	}
	return event, err
}

func (r *GroupRepo) getEventsSQL(groupId, userId, cursor string) (string, []any) {
	sql, args := r.eventBaseSQL(userId)

	sql += "WHERE e.group_id = ?"
	args = append(args, groupId)

	if cursor != "" {
		sql += `
		AND e.id < ?`
		args = append(args, cursor)
	}

	sql += `
	ORDER BY e.id DESC
	LIMIT 20`

	return sql, args
}

func (r *GroupRepo) ListEvents(groupId, userId, cursor string) ([]types.Event, error) {
	sql, args := r.getEventsSQL(groupId, userId, cursor)

	rows, err := r.DB.Query(sql, args...)
	if err != nil {
		return nil, fmt.Errorf("%s.ListEvents: Reading: %w", groupRepoName, err)
	}
	defer rows.Close()

	events := []types.Event{}
	for rows.Next() {
		event := types.Event{}
		err := rows.Scan(&event.Id, &event.Title, &event.Description, &event.Date, &event.Response, &event.GoingCnt, &event.NotGoingCnt)
		if err != nil {
			return nil, fmt.Errorf("%s.ListEvents: Scanning: %w", groupRepoName, err)
		}
		events = append(events, event)
	}
	return events, nil
}

func (r *GroupRepo) UpsertEventResponse(eventId, userId, response string) error {
	_, err := r.DB.Exec(`
		INSERT INTO event_responses (event_id, user_id, response) 
		VALUES (?, ?, ?)
		ON CONFLICT(event_id, user_id) DO UPDATE SET
			response = excluded.response
	`, eventId, userId, response)
	if err != nil {
		return fmt.Errorf("%s.UpsertEventResponse: %w", groupRepoName, err)
	}
	return nil
}

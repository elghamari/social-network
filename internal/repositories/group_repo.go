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

// InsertGroup inserts a new group row and returns its generated ID.
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

// InsertGroupMember adds a user to a group.
// Set isCreator=true when inserting the group creator.
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

// groupBaseQuery returns the shared SELECT used by single and list group queries.
func (r *GroupRepo) groupBaseQuery(userId string) (string, []any) {
	return `
	SELECT 
    g.id, g.creator_id, g.title, g.description, g.cover_path, g.created_at,
    (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) AS members_cnt,

    CASE
        WHEN gm_user.is_creator = 1 THEN 'CREATOR'
        WHEN gm_user.user_id IS NOT NULL THEN 'MEMBER'
        WHEN gjr.user_id IS NOT NULL THEN 'PENDING'
        ELSE 'NONE'
    END AS role

	FROM groups g
	LEFT JOIN group_members gm_user ON gm_user.group_id = g.id AND gm_user.user_id = ?
	LEFT JOIN group_join_requests gjr ON gjr.group_id = g.id AND gjr.user_id = ?
	WHERE 1=1`, []any{userId, userId}

}

// getGroupForUserQuery builds the query and args for fetching a single group.
func (r *GroupRepo) getGroupForUserQuery(groupId, userId string) (string, []any) {
	query, args := r.groupBaseQuery(userId)

	query += `
	AND g.id = ?`

	args = append(args, groupId)

	return query, args
}

// GetGroupForUser returns a single group with the user's role computed.
func (r *GroupRepo) GetGroupForUser(db DBTX, groupId, userId string) (types.Group, error) {
	if db == nil {
		db = r.DB
	}

	group := types.Group{}
	query, args := r.getGroupForUserQuery(groupId, userId)

	err := db.QueryRow(query, args...).Scan(
		&group.Id, &group.CreatorId, &group.Title, &group.Description,
		&group.CoverPath, &group.CreatedAt, &group.MembersCount, &group.Role,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return types.Group{}, nil
		}
		return types.Group{}, fmt.Errorf("%s.GetGroupForUser: %w", groupRepoName, err)
	}
	return group, nil
}

// getGroupsQuery builds the filtered query for listing groups.
// Appends tab and search conditions dynamically.
func (r *GroupRepo) getGroupsQuery(userId, tab, search, cursor string) (string, []any) {
	query, args := r.groupBaseQuery(userId)

	if search != "" {
		query += `
		AND g.title LIKE '%' || ? || '%'`
		args = append(args, search)
	}

	switch tab {
	case "discover":
		query += `
		AND NOT EXISTS(
    	    SELECT 1 FROM group_members gm
    	    WHERE gm.user_id = ? AND gm.group_id = g.id
    	)
		AND NOT EXISTS(
    	    SELECT 1 FROM group_join_requests gjr
    	    WHERE gjr.user_id = ? AND gjr.group_id = g.id
    	)`
		args = append(args, userId, userId)

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

	if cursor != "" {
		query += `
		AND g.id < ?`
		args = append(args, cursor)
	}

	query += `
	ORDER BY g.id DESC
	LIMIT 20`

	return query, args
}

// ListGroups returns groups filtered by tab and optional search term.
func (r *GroupRepo) ListGroups(userId, tab, search, cursor string) ([]types.Group, error) {
	query, args := r.getGroupsQuery(userId, tab, search, cursor)

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
			&group.CoverPath, &group.CreatedAt, &group.MembersCount, &group.Role,
		)
		if err != nil {
			return nil, fmt.Errorf("%s.ListGroups: Scanning: %w", groupRepoName, err)
		}
		groups = append(groups, group)
	}
	return groups, nil
}

// GroupExists returns true if a group with the given ID exists.
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

// ============================================================
// Join Requests
// ============================================================

// InsertJoinRequest creates a join request for a user.
// Silently ignores duplicates.
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

// DeleteJoinRequest removes a user's join request.
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

// ListInvitableUsersForGroup returns all non-members with an IsInvited flag.
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

// InsertGroupInvitation creates an invitation from inviterId to invitedUserId.
// Silently ignores duplicates.
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

// DeleteGroupInvitation removes an invitation for a user in a group.
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

// ============================================================
// Role
// ============================================================

// GetUserGroupRole returns the user's role in the group:
// CREATOR | MEMBER
func (r *GroupRepo) GetUserGroupRole(groupId, userId string) (string, error) {
	var role string
	err := r.DB.QueryRow(`
		SELECT 
    	CASE 
        	WHEN gm.is_creator = 1 THEN 'CREATOR'
        	ELSE 'MEMBER'
    	END AS role
	FROM group_members gm
	WHERE gm.group_id = ? AND user_id = ?
	`, groupId, userId).Scan(&role)
	if err != nil {
		if err == sql.ErrNoRows {
			return "NONE", nil
		}
		return "", fmt.Errorf("%s.GetUserGroupRole: %w", groupRepoName, err)
	}
	return role, nil
}

// ============================================================
// Join Request Users List
// ============================================================

func (r *GroupRepo) getJoinRequestUsersSQL(groupId, cursor string) (string, []any) {
	sql := `
		SELECT u.id, u.first_name, u.last_name, u.created_at, u.avatar

		FROM group_join_requests gjr
		JOIN users u ON u.id = gjr.user_id AND gjr.group_id = ?
	`
	args := []any{groupId}

	if cursor != "" {
		sql += `
		WHERE u.created_at < ?`
		args = append(args, cursor)
	}

	sql += `
	ORDER BY u.created_at DESC
	LIMIT 20`

	return sql, args
}

// GetJoinRequestUsersForGroup returns all users with pending join requests.
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

// ============================================================
// Events
// ============================================================

// EventBelongsToGroup returns true if the event exists within the given group.
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

// InsertEvent inserts a new event and returns its generated ID.
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

// eventBaseQuery returns the shared SELECT for event queries.
// Includes aggregated GOING and NOT_GOING counts.
func (r *GroupRepo) eventBaseQuery(userId string) (string, []any) {
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
	query, args := r.eventBaseQuery(userId)

	query += "WHERE e.id = ?"
	args = append(args, eventId)

	return query, args
}

// GetEventForUser returns a single event.
func (r *GroupRepo) GetEventForUser(db DBTX, userId, eventId string) (types.Event, error) {
	if db == nil {
		db = r.DB
	}

	event := types.Event{}

	query, args := r.getEventForUserQuery(eventId, userId)

	err := db.QueryRow(query, args...).Scan(&event.Id, &event.Title, &event.Description, &event.Date, &event.Response, &event.GoingCnt, &event.NotGoingCnt)
	if err != nil {
		return types.Event{}, fmt.Errorf("%s.GetEventById: %w", groupRepoName, err)
	}
	return event, err
}

func (r *GroupRepo) getEventsQuery(groupId, userId, cursor string) (string, []any) {
	query, args := r.eventBaseQuery(userId)

	query += "WHERE e.group_id = ?"
	args = append(args, groupId)

	if cursor != "" {
		query += `
		AND e.id < ?`
		args = append(args, cursor)
	}

	query += `
	ORDER BY e.id DESC
	LIMIT 20`

	return query, args
}

// ListEvents returns all events for a group with aggregated RSVP counts.
func (r *GroupRepo) ListEvents(groupId, userId, cursor string) ([]types.Event, error) {
	query, args := r.getEventsQuery(groupId, userId, cursor)

	rows, err := r.DB.Query(query, args...)
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

// UpsertEventResponse inserts or updates the user's response for an event.
// Uses upsert — updates response if it already exists.
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

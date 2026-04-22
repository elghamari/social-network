package repositories

import (
	"database/sql"
	"fmt"
	"soc-net/internal/types"
)

type GroupsRepo struct {
	DB *sql.DB
}

func NewGroupsRepo(db *sql.DB) *GroupsRepo {
	return &GroupsRepo{DB: db}
}

var repo string = "groups-repo"

// ===== Group repos
func (r *GroupsRepo) CreateGroup(input types.GroupInput, destPath string) (int, error) {
	res, err := r.DB.Exec(`
	INSERT INTO groups
		(creator_id, title, description, cover_path)
	VALUES (?, ?, ?, ?)
	`, input.CreatorId, input.Title, input.Description, destPath)
	if err != nil {
		return 0, fmt.Errorf("%s.CreateGroup: Inserting %w", repo, err)
	}

	groupId, err := res.LastInsertId()
	if err != nil {
		return 0, fmt.Errorf("%s.CreateGroup: LastInsertId %w", repo, err)
	}

	return int(groupId), nil
}

func (r *GroupsRepo) InsertMember(userId string, groupId int, isCreator bool) error {
	_, err := r.DB.Exec(`
	INSERT OR IGNORE INTO group_members 
	(group_id, user_id, is_creator)
	VALUES (?, ?, ?)
	`, groupId, userId, isCreator)
	if err != nil {
		return fmt.Errorf("%s.InsertMember: %w", repo, err)
	}
	return nil
}

func (r *GroupsRepo) GetGroupById(tx *sql.Tx, groupId int) (types.Group, error) {
	group := types.Group{}

	err := tx.QueryRow(`
	SELECT 
		g.creator_id,
		g.title,
		g.description,
		g.created_at
	FROM groups g
	WHERE g.id = ?
	`, groupId).Scan(&group.CreatorId, &group.Title, &group.Description, &group.CreatedAt)
	if err != nil {
		return group, fmt.Errorf("%s.GetGroupById: %w", repo, err)
	}
	return group, nil
}

func (r *GroupsRepo) GetMaxGroupId() (int, error) {
	var id int
	err := r.DB.QueryRow(`
	SELECT 
		MAX(id) AS last_id 
	FROM groups
	`).Scan(&id)
	if err != nil {
		return 0, fmt.Errorf("%s.GetMaxGroupId: %w", repo, err)
	}
	return id, err
}

func (r *GroupsRepo) BaseGroupQuery() string {
	return `
	SELECT 
		g.id, g.creator_id, g.title, g.description, cover_path, g.created_at,

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

func (r *GroupsRepo) GetGroupsQuery(userId, tab, search string) (string, []any) {
	query := r.BaseGroupQuery() + `WHERE 1=1`
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

func (r *GroupsRepo) ListGroups(userId, tab, search string) ([]types.Group, error) {
	query, args := r.GetGroupsQuery(userId, tab, search)

	rows, err := r.DB.Query(query, args...)
	if err != nil {
		return nil, fmt.Errorf("%s.ListGroups: Reading: %w", repo, err)
	}
	defer rows.Close()

	groups := []types.Group{}
	for rows.Next() {
		group := types.Group{}

		err := rows.Scan(&group.Id, &group.CreatorId, &group.Title, &group.Description, &group.CoverPath, &group.CreatedAt, &group.MembersCnt, &group.Role)
		if err != nil {
			return nil, fmt.Errorf("%s.ListGroups: Scanning: %w", repo, err)
		}

		groups = append(groups, group)
	}
	return groups, nil
}

func (r *GroupsRepo) ValidGroupId(groupId string) (bool, error) {
	var exists bool
	err := r.DB.QueryRow(`
		SELECT EXISTS(
			SELECT 1 FROM groups WHERE id = ?
		)
	`, groupId).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("%s.ValidGroupId: Scan: %w", repo, err)
	}

	return exists, nil
}

func (r *GroupsRepo) GetGroupQuery(userId, groupId string) (string, []any) {
	query := r.BaseGroupQuery() + `WHERE g.id = ?`
	args := []any{userId, userId, userId, groupId}

	return query, args
}

func (r *GroupsRepo) GetGroup(userId, groupId string) (types.Group, error) {
	group := types.Group{}

	query, args := r.GetGroupQuery(userId, groupId)

	err := r.DB.QueryRow(query, args...).Scan(
		&group.Id, &group.CreatorId, &group.Title, &group.Description, &group.CoverPath, &group.CreatedAt, &group.MembersCnt, &group.Role,
	)
	if err != nil {
		return types.Group{}, fmt.Errorf("%s.GetGroup: %w", repo, err)
	}

	fmt.Println(group.Role)

	return group, nil
}

// ===== JoinRequest repos

func (r *GroupsRepo) CreateJoinRequest(req types.JoinRequest) error {
	_, err := r.DB.Exec(`
	INSERT OR IGNORE INTO group_join_requests 
	(group_id, user_id)
	VALUES (?, ?)
	`, req.GroupId, req.UserId)
	if err != nil {
		return fmt.Errorf("%s.CreateJoinRequest: %w", repo, err)
	}
	return nil
}

func (r *GroupsRepo) DeleteJoinRequest(req types.JoinRequest) error {
	_, err := r.DB.Exec(`
	DELETE FROM group_join_requests 
	WHERE group_id = ? AND user_id = ?
	`, req.GroupId, req.UserId)
	if err != nil {
		return fmt.Errorf("%s.DeleteJoinRequest: %w", repo, err)
	}
	return nil
}

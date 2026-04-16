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
func (r *GroupsRepo) CreateGroup(tx *sql.Tx, input types.GroupInput) (int, error) {
	fmt.Println(input)
	res, err := tx.Exec(`
	INSERT INTO groups
		(creator_id, title, description)
	VALUES (?, ?, ?)
	`, input.CreatorId, input.Title, input.Description)
	if err != nil {
		return 0, fmt.Errorf("%s.Insert: Inserting %w", repo, err)
	}

	groupId, err := res.LastInsertId()
	if err != nil {
		return 0, fmt.Errorf("%s.Insert: Last if fetch %w", repo, err)
	}

	return int(groupId), nil
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

func (r *GroupsRepo) ListGroups(query string, args []any) ([]types.Group, error) {
	rows, err := r.DB.Query(query, args...)
	if err != nil {
		return nil, fmt.Errorf("%s.GetGroups: Reading: %w", repo, err)
	}
	defer rows.Close()

	groups := []types.Group{}
	for rows.Next() {
		group := types.Group{}

		err := rows.Scan(&group.Id, &group.CreatorId, &group.Title, &group.Description, &group.CreatedAt, &group.MembersCnt, &group.IsJoined, &group.IsPending)
		if err != nil {
			return nil, fmt.Errorf("%s.GetGroups: Scanning: %w", repo, err)
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

package repositories

import (
	"database/sql"
	"fmt"
	"strings"

	"soc-net/internal/types"
)

type GroupsRepo struct {
	DB *sql.DB
}

func NewGroupsRepo(db *sql.DB) *GroupsRepo {
	return &GroupsRepo{DB: db}
}

var repo string = "groups-repo"

func (r *GroupsRepo) Insert(tx *sql.Tx, input types.GroupInput) (int, error) {
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

// func (r *GroupsRepo) GetAll(cursorId int) ([]types.Group, error) {
// 	r.DB.Query(`

// 	`)
// }

func (r *GroupsRepo) CheckGroupAndMembership(groupId int, userId string) (bool, bool, error) {
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

// TODO: Move to UsersRepo later
func (r *GroupsRepo) UserExists(userId string) (bool, error) {
	var exists bool

	query := `SELECT EXISTS(SELECT 1 FROM users WHERE id = ?)`

	err := r.DB.QueryRow(query, userId).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("UsersRepo.UserExists: %w", err)
	}

	return exists, nil
}

// TODO: Move to UsersRepo later
func (r *GroupsRepo) CheckAllUsersExist(userIds []string) (bool, error) {
	if len(userIds) == 0 {
		return true, nil
	}

	placeholders := make([]string, len(userIds))
	args := make([]interface{}, len(userIds))

	for i, id := range userIds {
		placeholders[i] = "?"
		args[i] = id
	}

	query := fmt.Sprintf("SELECT COUNT(id) FROM users WHERE id IN (%s)", strings.Join(placeholders, ","))

	var count int
	err := r.DB.QueryRow(query, args...).Scan(&count)
	if err != nil {
		return false, fmt.Errorf("CheckAllUsersExist (QueryRow): %w", err)
	}

	return count == len(userIds), nil
}

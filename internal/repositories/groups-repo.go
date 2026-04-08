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

func (r *GroupsRepo) Insert(tx *sql.Tx, input types.GroupInput) (int, error) {
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

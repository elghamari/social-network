package repositories

import (
	"database/sql"
	"fmt"
)

type GroupsRepo struct {
	DB *sql.DB
}

func NewGroupsRepo(db *sql.DB) *GroupsRepo {
	return &GroupsRepo{DB: db}
}

var repo string = "groups-repo"

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

func (r *GroupsRepo) GetAll(cursorId int) {

}

package repositories

import "database/sql"

type Repos struct {
	Auth   *AuthRepo
	Groups *GroupsRepo
}

func New(db *sql.DB) *Repos {
	return &Repos{
		Auth:   NewAuthRepo(db),
		Groups: NewGroupsRepo(db),
	}
}

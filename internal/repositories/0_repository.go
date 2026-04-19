package repositories

import "database/sql"

type Repos struct {
	Auth   *AuthRepo
	Groups *GroupsRepo
	Follow *FollowRepo
}

func New(db *sql.DB) *Repos {
	return &Repos{
		Auth:   NewAuthRepo(db),
		Groups: NewGroupsRepo(db),
		Follow: NewFollowRepo(db),
	}
}

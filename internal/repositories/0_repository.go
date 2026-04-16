package repositories

import "database/sql"

type Repos struct {
	Auth   *AuthRepo
	Groups *GroupsRepo
	Posts  *PostsRepo
}

func New(db *sql.DB) *Repos {
	return &Repos{
		Auth:   NewAuthRepo(db),
		Groups: NewGroupsRepo(db),
		Posts:  NewPostsRepo(db),
	}
}

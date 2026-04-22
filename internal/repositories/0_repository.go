package repositories

import "database/sql"

type Repos struct {
	Auth   *AuthRepo
	Groups *GroupsRepo
	Chat   *ChatRepo
}

func New(db *sql.DB) *Repos {
	return &Repos{
		Auth:   NewAuthRepo(db),
		Groups: NewGroupsRepo(db),
		Chat:   NewChatRepo(db),
	}
}

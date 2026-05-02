package repositories

import "database/sql"

type Repos struct {
	Auth   *AuthRepo
	Group  *GroupRepo
	Follow *FollowRepo
	Chat   *ChatRepo
}

func New(db *sql.DB) *Repos {
	return &Repos{
		Auth:   NewAuthRepo(db),
		Group:  NewGroupRepo(db),
		Follow: NewFollowRepo(db),
		Chat:   NewChatRepo(db),
	}
}

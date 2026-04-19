package repositories

import "database/sql"

type Repos struct {
	Auth      *AuthRepo
	Groups    *GroupsRepo
	Posts     *PostsRepo
	Comments  *CommentsRepo
	Reactions *ReactionsRepo
}

func New(db *sql.DB) *Repos {
	return &Repos{
		Auth:      NewAuthRepo(db),
		Groups:    NewGroupsRepo(db),
		Posts:     NewPostsRepo(db),
		Comments:  NewCommentsRepo(db),
		Reactions: NewReactionsRepo(db),
	}
}

package repositories

import "database/sql"

type Repos struct {
	Auth      *AuthRepo
	Group     *GroupRepo
	Posts     *PostsRepo
	Comments  *CommentsRepo
	Reactions *ReactionsRepo
	User      *UserRepo
	Chat      *ChatRepo
	Search    *SearchRepo
}

func New(db *sql.DB) *Repos {
	return &Repos{
		Auth:      NewAuthRepo(db),
		Group:     NewGroupRepo(db),
		Posts:     NewPostsRepo(db),
		Comments:  NewCommentsRepo(db),
		Reactions: NewReactionsRepo(db),
		User:      NewUserRepo(db),
		Chat:      NewChatRepo(db),
		Search:    NewSearchRepo(db),
	}
}

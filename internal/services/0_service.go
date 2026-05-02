package services

import "soc-net/internal/repositories"

type Services struct {
	Auth      *AuthService
	Groups    *GroupsService
	Posts     *PostsService
	Comments  *CommentsService
	Reactions *ReactionsService
	Follow    *FollowService
	Search    *SearchServs
}

func New(r *repositories.Repos) *Services {
	return &Services{
		Auth:      NewAuthService(r.Auth),
		Groups:    NewGroupsService(r.Auth, r.Groups),
		Posts:     NewPostsService(r.Posts, r.Groups),
		Comments:  NewCommentsService(r.Comments, r.Posts),
		Reactions: NewReactionsService(r.Reactions, r.Posts),
		Follow:    NewFollowService(r.Follow, r.Auth),
		Search:    NewSearchServs(r.Search),
	}
}

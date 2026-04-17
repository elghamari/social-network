package services

import "soc-net/internal/repositories"

type Services struct {
	Auth   *AuthService
	Groups *GroupsService
	Posts  *PostsService
}

func New(r *repositories.Repos) *Services {
	return &Services{
		Auth:   NewAuthService(r.Auth),
		Groups: NewGroupsService(r.Auth, r.Groups),
		Posts:  NewPostsService(r.Auth, r.Posts),
	}
}

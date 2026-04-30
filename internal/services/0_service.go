package services

import "soc-net/internal/repositories"

type Services struct {
	Auth   *AuthService
	Group  *GroupService
	Follow *FollowService
	Post   *PostService
}

func New(r *repositories.Repos) *Services {
	return &Services{
		Auth:   NewAuthService(r.Auth),
		Group:  NewGroupService(r.Auth, r.Group),
		Follow: NewFollowService(r.Follow, r.Auth),
	}
}

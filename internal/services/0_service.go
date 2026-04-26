package services

import "soc-net/internal/repositories"

type Services struct {
	Auth   *AuthService
	Groups *GroupsService
	Follow *FollowService
	Search *SearchServs
}

func New(r *repositories.Repos) *Services {
	return &Services{
		Auth:   NewAuthService(r.Auth),
		Groups: NewGroupsService(r.Auth, r.Groups),
		Follow: NewFollowService(r.Follow, r.Auth),
		Search: NewSearchServs(r.Search),
	}
}

package services

import "soc-net/internal/repositories"

type Services struct {
	Auth   *AuthService
	Group  *GroupService
	Follow *FollowService
	Chat   *ChatService
}

func New(r *repositories.Repos) *Services {
	return &Services{
		Auth:  NewAuthService(r.Auth),
		Group: NewGroupService(r.Auth, r.Group),
		Follow: NewFollowService(r.Follow, r.Auth),
		Chat:   NewChatService(r.Auth, r.Chat, r.Group),
	}
}

package services

import "soc-net/internal/repositories"

type Services struct {
	Auth   *AuthService
	Groups *GroupsService
	Chat   *ChatService
}

func New(r *repositories.Repos) *Services {
	return &Services{
		Auth:   NewAuthService(r.Auth),
		Groups: NewGroupsService(r.Auth, r.Groups),
		Chat:   NewChatService(r.Chat, r.Groups),
	}
}

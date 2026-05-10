package services

import "soc-net/internal/repositories"

type Services struct {
	Auth         *AuthService
	User         *UserService
	Group        *GroupService
	Posts        *PostsService
	Comments     *CommentsService
	Reactions    *ReactionsService
	Search       *SearchServs
	Chat         *ChatService
	Notification *NotificationService
}

func New(r *repositories.Repos) *Services {
	return &Services{
		Auth:         NewAuthService(r.Auth),
		User:         NewUserService(r.User, r.Auth),
		Group:        NewGroupService(r.Auth, r.Group),
		Posts:        NewPostsService(r.Posts, r.Group, r.Auth),
		Comments:     NewCommentsService(r.Comments, r.Posts),
		Reactions:    NewReactionsService(r.Reactions, r.Posts),
		Search:       NewSearchServs(r.Search),
		Chat:         NewChatService(r.Auth, r.Chat, r.Group),
		Notification: NewNotificationService(r.Notif),
	}
}

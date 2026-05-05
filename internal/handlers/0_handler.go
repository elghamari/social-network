package handlers

import (
	"net/http"

	"soc-net/internal/hub"
	"soc-net/internal/middleware"
	"soc-net/internal/services"
)

type Handler struct {
	Services *services.Services
	Hub      *hub.Hub
}

func New(svcs *services.Services) *Handler {
	hub := hub.NewHub(svcs.Chat)
	go hub.Start()

	return &Handler{
		Services: svcs,
		Hub:      hub,
	}
}

func (h *Handler) RegisterRoutes(mux *http.ServeMux, mid *middleware.Middleware) http.Handler {
	mux.HandleFunc("/auth/check", h.CheckSession)

	guestRoutes := map[string]http.HandlerFunc{
		"/api/register": h.Register,
		"/api/login":    h.Login,
	}

	for path, hand := range guestRoutes {
		mux.Handle(path, mid.GuestOnly(hand))
	}

	authRoutes := map[string]http.HandlerFunc{
		// profile routes
		"/api/auth/logout":     h.Logout,
		"/api/auth/me":         h.GetMe,
		"/api/profile":         h.GetProfile,
		"/api/follow":          h.FollowUser,
		"/api/follow/accept":   h.AcceptFollowRequest,
		"/api/follow/decline":  h.DeclineFollowRequest,
		"/api/unfollow":        h.UnfollowUser,
		"/api/search":          h.Search,
		"/api/profile/privacy": h.TogglePrivacy,

		// group routes
		"/api/groups":                  h.Groups,
		"/api/groups/{id}":             h.Group,
		"/api/groups/{id}/posts":       h.GroupPosts,
		"/api/groups/{id}/events":      h.GroupEvents,
		"/api/groups/{id}/invitations": h.GroupInvitations,
		"/api/groups/{id}/requests":    h.GroupJoinRequests,

		// feed routes
		"/api/posts/create":     h.CreatePost,
		"/api/posts/feed":       h.GetFeedPosts,
		"/api/posts/profile":    h.GetProfilePosts,
		"/api/posts/group":      h.GetGroupPosts,
		"/api/comments/create":  h.CreateComment,
		"/api/comments":         h.GetPostComments,
		"/api/reactions/toggle": h.ToggleReaction,

		// chat routes
		"/api/ws/chat":              h.ServeWs,
		"/api/chat/contacts":        h.GetRecentContacts,
		"/api/chat/users":           h.GetAvailableChatUsers,
		"/api/chat/history/private": h.GetPrivateHistory,
		"/api/chat/history/group":   h.GetGroupHistory,
		"/api/chat/read/private":    h.MarkAsRead,
		"/api/chat/read/group":      h.MarkGroupAsRead,
	}

	for path, hand := range authRoutes {
		mux.Handle(path, mid.AuthRequired(hand))
	}

	return mux
}

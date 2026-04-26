package handlers

import (
	"net/http"

	"soc-net/internal/middleware"
	"soc-net/internal/services"
)

type Handler struct {
	Services *services.Services
	Port     string
	mid      *middleware.Mid
	Hub      *Hub
}

func NewHandler(svcs *services.Services, port string) *Handler {
	hub := NewHub(svcs.Chat)
	go hub.Start()
	return &Handler{
		Services: svcs,
		Port:     port,
		mid:      middleware.NewMid(svcs.Auth),
		Hub:      hub,
	}
}

func New(svcs *services.Services, port string) http.Handler {
	mux := http.NewServeMux()
	h := NewHandler(svcs, port)
	mux.HandleFunc("/auth/check", h.CheckSession)

	guestRoutes := map[string]http.HandlerFunc{
		"/api/register": h.Register,
		"/api/login":    h.Login,
	}

	for path, hand := range guestRoutes {
		finalHandler := h.mid.SessionLoader(h.mid.GuestOnly(hand))
		mux.Handle(path, finalHandler)
	}

	authRoutes := map[string]http.HandlerFunc{
		// profile routes
		"/api/auth/logout": h.Logout,
		"/api/auth/me":     h.GetMe,
		"/api/profile":     h.GetProfile,
		// "/api/follow":         h.FollowUser,
		// "/api/follow/accept":  h.AcceptFollowRequest,
		// "/api/follow/decline": h.DeclineFollowRequest,
		// "/api/unfollow":       h.UnfollowUser,
		// group routes
		"/api/groups":        h.Groups,
		"/api/groups/create": h.CreateGroup,
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
		finalHandler := h.mid.SessionLoader(h.mid.AuthRequired(hand))
		mux.Handle(path, finalHandler)
	}

	return mux
}

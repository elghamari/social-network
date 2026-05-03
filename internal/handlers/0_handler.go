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
}

func NewHandler(svcs *services.Services, port string) *Handler {
	return &Handler{
		Services: svcs,
		Port:     port,
		mid:      middleware.NewMid(svcs.Auth),
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
		mux.Handle(path, h.mid.GuestOnly(hand))
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
		"/api/groups":                      h.Groups,
		"/api/groups/join":                 h.JoinRequests,
		"/api/groups/{id}":                 h.Group,
		"/api/groups/{id}/posts":           h.GroupPosts,
		"/api/groups/{id}/events":          h.GroupEvents,
		"/api/groups/{id}/manage/invite":   h.GroupInvitations,
		"/api/groups/{id}/manage/requests": h.GroupJoinRequests,

		// feed routes
		"/api/posts/create":     h.CreatePost,
		"/api/posts/feed":       h.GetFeedPosts,
		"/api/posts/profile":    h.GetProfilePosts,
		"/api/posts/group":      h.GetGroupPosts,
		"/api/comments/create":  h.CreateComment,
		"/api/comments":         h.GetPostComments,
		"/api/reactions/toggle": h.ToggleReaction,
	}

	for path, hand := range authRoutes {
		mux.Handle(path, h.mid.AuthRequired(hand))
	}

	return h.mid.SessionLoader(mux)
}

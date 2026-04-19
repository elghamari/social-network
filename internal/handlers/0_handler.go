package handlers

import (
	"net/http"
	"soc-net/internal/middleware"
	"soc-net/internal/services"
)

type Handler struct {
	Services *services.Services
	Port     string
}

func NewHandler(svcs *services.Services, port string) *Handler {
	return &Handler{
		Services: svcs,
		Port:     port,
	}
}

func New(svcs *services.Services, port string) http.Handler {
	mux := http.NewServeMux()
	h := NewHandler(svcs, port)

	// ===== Guest only (machi mlogin)
	guestRoutes := map[string]http.HandlerFunc{
		"/api/auth/register": h.Register,
		"/api/auth/login":    h.Login,
	}
	for path, hand := range guestRoutes {
		mux.Handle(path, middleware.GuestOnly(hand))
	}

	// ===== Auth required
	authRoutes := map[string]http.HandlerFunc{
		"/api/auth/logout":      h.Logout,
		"/api/me":               h.GetMe,
		"/api/profile":          h.GetProfile,
		"/api/groups":           h.Groups,
		"/api/groups/join":      h.JoinRequest,
		"/api/follow":           h.FollowUser,
		"/api/follow/accept":    h.AcceptFollowRequest,
		"/api/follow/decline":   h.DeclineFollowRequest,
		"/api/unfollow":         h.UnfollowUser,
	}
	for path, hand := range authRoutes {
		mux.Handle(path, middleware.AuthRequired(hand))
	}

	return middleware.SessionLoader(svcs.Auth)(mux)
}

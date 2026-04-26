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
	// ===== Guest only
	guestRoutes := map[string]http.HandlerFunc{
		"/api/register": h.Register,
		"/api/login":    h.Login,
	}
	for path, hand := range guestRoutes {
		finalHandler := h.mid.SessionLoader(h.mid.GuestOnly(hand))
		mux.Handle(path, finalHandler)
	}

	// ===== Auth required
	authRoutes := map[string]http.HandlerFunc{
		"/api/auth/logout": h.Logout,

		"/api/auth/me":        h.GetMe,
		"/api/profile":        h.GetProfile,
		"/api/groups":         h.Groups,
		"/api/groups/join":    h.JoinRequest,
		"/api/follow":         h.FollowUser,
		"/api/follow/accept":  h.AcceptFollowRequest,
		"/api/follow/decline": h.DeclineFollowRequest,
		"/api/unfollow":       h.UnfollowUser,
		"/api/search":         h.Search,
		"/api/profile/privacy":h.TogglePrivacy,
	}
	for path, hand := range authRoutes {
		finalHandler := h.mid.SessionLoader(h.mid.AuthRequired(hand))
		mux.Handle(path, finalHandler)
	}

	return mux
}

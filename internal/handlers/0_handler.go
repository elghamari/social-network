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
	mux.HandleFunc("/auth/check", h.CheckSession)
	// ===== Guest only
	guestRoutes := map[string]http.HandlerFunc{
		"/api/register": h.Register,
		"/api/login":    h.Login,
	}
	for path, hand := range guestRoutes {
		mux.Handle(path, middleware.GuestOnly(hand))
	}

	// ===== Auth required
	authRoutes := map[string]http.HandlerFunc{
		"/api/auth/logout": h.Logout,
		"/api/auth/me":     h.GetMe,
		"/api/profile":     h.GetProfile,

		"/api/groups":      h.Groups,
		"/api/groups/join": h.JoinRequest,
		"/api/groups/{id}": h.GetGroup,
	}
	for path, hand := range authRoutes {
		mux.Handle(path, middleware.AuthRequired(hand))
	}

	mux.Handle("/uploads/", http.StripPrefix("/uploads/", http.FileServer(http.Dir("./data/uploads"))))

	return middleware.SessionLoader(svcs.Auth)(mux)
}

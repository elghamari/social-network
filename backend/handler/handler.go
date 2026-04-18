package handler

import (
	"log"
	"net/http"

	"socialnetwork/middleware"
	"socialnetwork/services"
)

// Handler holds the service layer and is the entry point for all HTTP handlers.
type Handler struct {
	Services *services.Service
}

func New(srv *services.Service) *Handler {
	return &Handler{Services: srv}
}

// SetupRoutes registers all routes with the appropriate middleware and returns
// the final http.Handler wrapped with SessionLoader and CORS.
func (h *Handler) SetupRoutes(mux *http.ServeMux) http.Handler {

	// ── Guest-only routes (blocked when already logged in) ───────────────────
	guestRoutes := map[string]http.HandlerFunc{
		"/register": h.Register,
		"/login":    h.Login,
	}
	for path, fn := range guestRoutes {
		mux.Handle(path, middleware.GuestOnly(http.HandlerFunc(fn)))
	}

	// ── Auth-required routes (blocked when not logged in) ────────────────────
	authRoutes := map[string]http.HandlerFunc{
		"/logout":  h.Logout,
		"/me":      h.GetMe,
		"/profile": h.GetUserById,

		// Follow routes
		"/follow":         h.FollowUser,
		"/follow/accept":  h.AcceptRequest,
		"/follow/decline": h.DeclineFollowRequest,
	}
	for path, fn := range authRoutes {
		mux.Handle(path, middleware.AuthRequired(http.HandlerFunc(fn)))
	}

	log.Println("Routes registered successfully")

	// Wrap the mux: SessionLoader loads the user on every request,
	// CORS adds the headers needed by the Next.js frontend.
	return middleware.CORS(middleware.SessionLoader(h.Services.AuthSrv)(mux))
}

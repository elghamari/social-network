package handlers

import (
	"net/http"

	"soc-net/internal/middleware"
	"soc-net/internal/services"
)

type Handler struct {
	Services *services.Services
	// Hub      *Hub
	mid  *middleware.Mid
	Port string
}

func NewHandler(svcs *services.Services, port string) *Handler {
	// hub := NewHub(svcs.Chat)
	// go hub.Start()

	return &Handler{
		Services: svcs,
		// Hub:      Hub
		mid:  middleware.NewMid(svcs.Auth),
		Port: port,
	}
}

func New(svcs *services.Services, port string) http.Handler {
	mux := http.NewServeMux()
	h := NewHandler(svcs, port)
	middleware.EnableCORS(mux)

	guestRoutes := map[string]http.HandlerFunc{
		"/api/register": h.Register,
		"/api/login":    h.Login,
	}

	// 1. Guest Routes: SessionLoader -> GuestOnly -> Handler
	for path, hand := range guestRoutes {
		// Chaining middlewares
		finalHandler := h.mid.SessionLoader(middleware.GuestOnly(hand))
		mux.Handle(path, finalHandler)
	}

	authRoutes := map[string]http.HandlerFunc{
		"/api/auth/logout":      h.Logout,
		"/api/groups":           h.Groups,
		"/api/groups/create":    h.CreateGroup,
		"/api/posts/create":     h.CreatePost,
		"/api/posts/feed":       h.GetFeedPosts,
		"/api/posts/profile":    h.GetProfilePosts,
		"/api/posts/group":      h.GetGroupPosts,
		"/api/comments/create":  h.CreateComment,
		"/api/comments":         h.GetPostComments,
		"/api/reactions/toggle": h.ToggleReaction,
		"/api/me":               h.GetMe,
	}

	// 2. Auth Routes: SessionLoader -> AuthRequired -> Handler
	for path, hand := range authRoutes {
		// Chaining middlewares
		finalHandler := h.mid.SessionLoader(middleware.AuthRequired(hand))
		mux.Handle(path, finalHandler)
	}

	return mux
}

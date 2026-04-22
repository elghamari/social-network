package handlers

import (
	"net/http"
	"soc-net/internal/middleware"
	"soc-net/internal/services"
)

type Handler struct {
	Services *services.Services
	Hub      *Hub
	Port string
}

func NewHandler(svcs *services.Services, port string) *Handler {
	 hub := NewHub(svcs.Chat)
	 go hub.Start()

	return &Handler{
		Services: svcs,
		Hub:      hub,
		Port: port,
	}
}

func New(svcs *services.Services, port string) http.Handler {
	mux := http.NewServeMux()
	h := NewHandler(svcs, port)

	// mux.HandleFunc("/api/auth", h.Auth)

	guestRoutes := map[string]http.HandlerFunc{
		// Routes dyal li mamlogich
	}
	for path, hand := range guestRoutes {
		mux.Handle(path, middleware.GuestOnly(hand))
	}

	authRoutes := map[string]http.HandlerFunc{
		"/api/groups":      h.Groups,
		"/api/groups/join": h.JoinRequest,
		"/api/ws/chat":     h.ServeWs,
		"/api/chat/contacts":        h.GetRecentContacts,
		"/api/chat/users":           h.GetAvailableChatUsers,
		"/api/chat/history/private": h.GetPrivateHistory,
		"/api/chat/history/group":   h.GetGroupHistory,
		"/api/chat/read/private":    h.MarkAsRead,
		"/api/chat/read/group":      h.MarkGroupAsRead,
	}	
	for path, hand := range authRoutes {
		// mux.Handle(path, middleware.AuthRequired(hand))
		mux.Handle(path, hand)
	}

	// return middleware.SessionLoader(svcs.Auth)(mux)
	return mux
}

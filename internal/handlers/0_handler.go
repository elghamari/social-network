package handlers

import (
	"net/http"
	"soc-net/internal/middleware"
	"soc-net/internal/services"
)

type Handler struct {
	Services *services.Services
	// Hub      *Hub
	Port string
}

func NewHandler(svcs *services.Services, port string) *Handler {
	// hub := NewHub(svcs.Chat)
	// go hub.Start()

	return &Handler{
		Services: svcs,
		// Hub:      hub,
		Port: port,
	}
}

func New(svcs *services.Services, port string) http.Handler {
	mux := http.NewServeMux()
	// h := NewHandler(svcs, port)

	// mux.HandleFunc("/api/auth", h.Auth)

	guestRoutes := map[string]http.HandlerFunc{
		// Routes dyal li mamlogich
	}
	for path, hand := range guestRoutes {
		mux.Handle(path, middleware.GuestOnly(hand))
	}

	authRoutes := map[string]http.HandlerFunc{
		// Routes dyal li mlogyin
	}
	for path, hand := range authRoutes {
		mux.Handle(path, middleware.AuthRequired(hand))
	}

	mux.Handle("/js/",
		http.StripPrefix("/js/", http.FileServer(http.Dir("./web/js"))),
	)
	mux.Handle("/assets/",
		http.StripPrefix("/assets/", http.FileServer(http.Dir("./web/assets"))),
	)

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./web/index.html")
	})

	return middleware.SessionLoader(svcs.Auth)(mux)
}

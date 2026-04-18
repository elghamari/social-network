package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"socialnetwork/modle"
	"socialnetwork/utils"
)

// Register creates a new user account.
// POST /register  (GuestOnly)
func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteJson(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	var input modle.RegisterInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		utils.WriteJson(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if err := h.Services.AuthSrv.Register(input); err != nil {
		utils.WriteJson(w, http.StatusBadRequest, err.Error())
		return
	}

	utils.WriteJson(w, http.StatusCreated, "user created")
}

// Login authenticates a user and stores the session in an HttpOnly cookie.
// POST /login  (GuestOnly)
func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteJson(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	var input modle.LoginInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		utils.WriteJson(w, http.StatusBadRequest, "invalid request body")
		return
	}

	sessionId, err := h.Services.AuthSrv.Login(input)
	if err != nil {
		utils.WriteJson(w, http.StatusUnauthorized, err.Error())
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "sessionId",
		Value:    sessionId,
		Path:     "/",
		Expires:  time.Now().Add(24 * time.Hour),
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	})

	utils.WriteJson(w, http.StatusOK, "logged in")
}

// Logout invalidates the current session cookie.
// POST /logout  (AuthRequired)
func (h *Handler) Logout(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteJson(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	cookie, err := r.Cookie("sessionId")
	if err == nil {
		_ = h.Services.AuthSrv.Logout(cookie.Value)
		http.SetCookie(w, &http.Cookie{
			Name:   "sessionId",
			Path:   "/",
			MaxAge: -1,
		})
	}

	utils.WriteJson(w, http.StatusOK, "logged out")
}

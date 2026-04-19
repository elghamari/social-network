package handlers

import (
	"encoding/json"
	"net/http"
	"soc-net/internal/types"
	"soc-net/internal/utils"
)

// POST /api/auth/register
func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteJson(w, map[string]any{"status": http.StatusMethodNotAllowed})
		return
	}

	var input types.RegisterInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		utils.WriteJson(w, map[string]any{
			"status": http.StatusBadRequest,
			"error":  "invalid request body",
		})
		return
	}

	if err := h.Services.Auth.Register(input); err != nil {
		utils.WriteJson(w, map[string]any{
			"status": http.StatusBadRequest,
			"error":  err.Error(),
		})
		return
	}

	utils.WriteJson(w, map[string]any{"status": http.StatusCreated})
}

// POST /api/auth/login
func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteJson(w, map[string]any{"status": http.StatusMethodNotAllowed})
		return
	}

	var input types.LoginInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		utils.WriteJson(w, map[string]any{
			"status": http.StatusBadRequest,
			"error":  "invalid request body",
		})
		return
	}

	user, sessionID, err := h.Services.Auth.Login(input)
	if err != nil {
		utils.WriteJson(w, map[string]any{
			"status": http.StatusUnauthorized,
			"error":  "invalid credentials",
		})
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "sessionId",
		Value:    sessionID,
		Path:     "/",
		HttpOnly: true,
		MaxAge:   86400, // 24h
	})

	utils.WriteJson(w, map[string]any{
		"status": http.StatusOK,
		"user": map[string]any{
			"id":         user.ID,
			"first_name": user.FirstName,
			"last_name":  user.LastName,
			"email":      user.Email,
			"is_public":  user.IsPublic,
		},
	})
}

// POST /api/auth/logout
func (h *Handler) Logout(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteJson(w, map[string]any{"status": http.StatusMethodNotAllowed})
		return
	}

	cookie, err := r.Cookie("sessionId")
	if err == nil {
		h.Services.Auth.Logout(cookie.Value)
	}

	http.SetCookie(w, &http.Cookie{
		Name:   "sessionId",
		Path:   "/",
		MaxAge: -1,
	})

	utils.WriteJson(w, map[string]any{"status": http.StatusOK})
}

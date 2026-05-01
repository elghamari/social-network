package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"soc-net/internal/types"
	"soc-net/internal/utils"
)

// POST /api/auth/register
func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteJson(w, http.StatusMethodNotAllowed, map[string]any{
			"error": "method not allowed",
		})
		return
	}

	var input types.RegisterInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{
			"error": "invalid request body",
		})
		return
	}

	if err := h.Services.Auth.Register(input); err != nil {
		
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{
			"error": err.Error(),
		})
		fmt.Println(err)
		return
	}

	utils.WriteJson(w, http.StatusCreated, map[string]any{
		"message": "user created",
	})
}

// POST /api/auth/login
func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteJson(w, http.StatusMethodNotAllowed, map[string]any{
			"error": "method not allowed",
		})
		return
	}

	var input types.LoginInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{
			"error": "invalid request body",
		})
		return
	}

	user, sessionID, err := h.Services.Auth.Login(input)
	if err != nil {
		fmt.Println(err)
		utils.WriteJson(w, http.StatusUnauthorized, map[string]any{
			"error": "invalid credentials",
		})
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "sessionId",
		Value:    sessionID,
		Path:     "/",
		HttpOnly: true,
		MaxAge:   86400,
	})

	utils.WriteJson(w, http.StatusOK, map[string]any{
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
		utils.WriteJson(w, http.StatusMethodNotAllowed, map[string]any{
			"error": "method not allowed",
		})
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

	utils.WriteJson(w, http.StatusOK, map[string]any{
		"message": "logged out",
	})
}

func (h *Handler) CheckSession(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("sessionId")
	if err != nil {
		utils.WriteJson(w, http.StatusUnauthorized, map[string]any{
			"error": "unauthorized",
		})
		return
	}

	userID, isValid := h.Services.Auth.ValidateSession(cookie.Value)

	if !isValid {
		utils.WriteJson(w, http.StatusUnauthorized, map[string]any{
			"error": "invalid session",
		})
		return
	}

	utils.WriteJson(w, http.StatusOK, map[string]any{
		"userId": userID,
	})
}

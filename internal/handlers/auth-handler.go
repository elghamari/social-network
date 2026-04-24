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
		utils.WriteJson(w, map[string]any{"status": http.StatusMethodNotAllowed})
		fmt.Println("1111111111111111111111111111v")
		return
	}

	var input types.RegisterInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		utils.WriteJson(w, map[string]any{
			"status": http.StatusBadRequest,
			"error":  "invalid request body",
		})
		fmt.Println("2222222222222222222222222222")
		return
	}

	if err := h.Services.Auth.Register(input); err != nil {
		utils.WriteJson(w, map[string]any{
			"status": http.StatusBadRequest,
			"error":  err.Error(),
		})
		fmt.Println(err)
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
		fmt.Println("44444444444444444444444444444444444444444444444444444444444")
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

func (h *Handler) CheckSession(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("sessionId")
	if err != nil {
		fmt.Println("2222222222222222222222222222222222222222222222222")
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	userID, isValid := h.Services.Auth.ValidateSession(cookie.Value)

	if !isValid {
		fmt.Println("3333333333333333333333333333333333333333333333333")
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	utils.WriteJson(w, map[string]any{
		"status": http.StatusOK,
		"userId": userID,
	})
}

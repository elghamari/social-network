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
		utils.WriteJson(w, http.StatusMethodNotAllowed, map[string]any{"error": "Method not allowed"})
		return
	}

	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{"error": "failed to parse form data"})
		return
	}

	input := types.RegisterInput{
		Email:       r.FormValue("email"),
		Password:    r.FormValue("password"),
		FirstName:   r.FormValue("first_name"),
		LastName:    r.FormValue("last_name"),
		DateOfBirth: r.FormValue("date_of_birth"),
	}

	if nickname := r.FormValue("nickname"); nickname != "" {
		input.Nickname = &nickname
	}

	if aboutMe := r.FormValue("about_me"); aboutMe != "" {
		input.AboutMe = &aboutMe
	}

	avatarPath, err := utils.HandleImageUpload(r, "avatar")
	if err != nil {
		HandleError(w, err)
		return
	}

	if err == nil {
		input.Avatar = avatarPath
	}

	if err := h.Services.Auth.Register(input); err != nil {
		if formErr, ok := err.(*types.FormError); ok {
			utils.WriteJson(w, http.StatusBadRequest, map[string]any{
				"fields": formErr.Fields,
			})
			return
		}

		utils.WriteJson(w, http.StatusBadRequest, map[string]any{
			"fields": map[string][]string{
				"first_name": {err.Error()},
			},
		})
		return
	}

	utils.WriteJson(w, http.StatusCreated, map[string]any{"message": "success"})
}

// POST /api/auth/login
func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteJson(w, http.StatusMethodNotAllowed, map[string]any{"error": "Method not allowed"})
		return
	}

	var input types.LoginInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		utils.WriteJson(w, http.StatusInternalServerError, map[string]any{"error": "invalid request body"})
		return
	}

	user, sessionID, err := h.Services.Auth.Login(input)
	if err != nil {
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{"error": "invalid credentials"})
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "sessionId",
		Value:    sessionID,
		Path:     "/",
		HttpOnly: true,
		MaxAge:   86400, // 24h
		SameSite: http.SameSiteLaxMode,
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
		utils.WriteJson(w, http.StatusMethodNotAllowed, map[string]any{"error": "Method not allowed"})
		return
	}

	cookie, err := r.Cookie("sessionId")

	if err == nil {
		err = h.Services.Auth.Logout(cookie.Value)
		if err != nil {
			HandleError(w, err)
			return
		}
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "sessionId",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	})

	utils.WriteJson(w, http.StatusOK, map[string]any{"message": "logged out success"})
}

func (h *Handler) CheckSession(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("sessionId")
	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	userID, isValid := h.Services.Auth.ValidateSession(cookie.Value)

	if !isValid {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	utils.WriteJson(w, http.StatusOK, map[string]any{"userId": userID})
}

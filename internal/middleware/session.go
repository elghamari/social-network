package middleware

import (
	"context"
	"log"
	"net/http"
	"soc-net/internal/utils"
)

func (m *Middleware) SessionLoader(next http.Handler) http.Handler {

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		cookie, err := r.Cookie("sessionId")
		if err != nil {
			next.ServeHTTP(w, r)
			return
		}

		user, err := m.Auth.GetUser(cookie.Value)
		if err != nil {
			log.Println(err)
			utils.WriteJson(w, http.StatusInternalServerError, map[string]any{
				"error": "Something went wrong",
			})
			return
		}

		if user.Id == "" {
			_ = m.Auth.Logout(cookie.Value)

			clearSession(w)

			next.ServeHTTP(w, r)
			return
		}

		ctx := context.WithValue(r.Context(), "userId", user.Id)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func clearSession(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:   "sessionId",
		Path:   "/",
		MaxAge: -1,
	})
}

func (m *Middleware) GuestOnly(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		userID := utils.GetUserId(r)
		if userID != "" {
			utils.WriteJson(w, http.StatusConflict, map[string]any{
				"error": "you are already logged in",
			})
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (m *Middleware) AuthRequired(next http.Handler) http.Handler {

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		userID := utils.GetUserId(r)

		if userID == "" {
			utils.WriteJson(w, http.StatusUnauthorized, map[string]any{
				"error": "unauthorized, login first",
			})
			return
		}
		next.ServeHTTP(w, r)

	})
}

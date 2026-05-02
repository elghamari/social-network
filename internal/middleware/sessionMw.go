package middleware

import (
	"context"
	"log"
	"net/http"

	"soc-net/internal/utils"
)

func (a *Mid) SessionLoader(next http.Handler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("sessionId")
		if err != nil {
			next.ServeHTTP(w, r)
			return
		}
		user, err := a.AuthService.GetUser(cookie.Value)
		if err != nil {
			utils.WriteJson(w, http.StatusInternalServerError, map[string]any{
				"error": "Internal server error",
			})
			log.Println(err)
			return
		}

		if user.Id == "" {
			_ = a.AuthService.Logout(cookie.Value)

			http.SetCookie(w, &http.Cookie{
				Name:   "sessionId",
				Path:   "/",
				MaxAge: -1,
			})
			next.ServeHTTP(w, r)
			return
		}

		ctx := context.WithValue(r.Context(), "userId", user.Id)
		ctx = context.WithValue(ctx, "nickname", user.Nickname)
		next.ServeHTTP(w, r.WithContext(ctx))
	}
}

func (a *Mid) GuestOnly(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userID := utils.GetUserId(r)
		if userID != "" {
			utils.WriteJson(w, http.StatusConflict, map[string]any{
				"error": "ALREADY_LOGGED",
			})
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (a *Mid) AuthRequired(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userID := utils.GetUserId(r)
		if userID == "" {
			utils.WriteJson(w, http.StatusUnauthorized, map[string]any{
				"error": "UNAUTHORIZED",
			})
			return
		}
		next.ServeHTTP(w, r)
	})
}

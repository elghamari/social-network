package middleware

import (
	"context"
	"log"
	"net/http"
	"soc-net/internal/services"
	"soc-net/internal/utils"
)

func SessionLoader(authService *services.AuthService) func(http.Handler) http.Handler {

	return func(next http.Handler) http.Handler {

		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

			cookie, err := r.Cookie("sessionId")
			if err != nil {
				next.ServeHTTP(w, r)
				return
			}

			user, err := authService.GetUser(cookie.Value)
			if err != nil {
				log.Println(err)
				utils.WriteJson(w, http.StatusInternalServerError, map[string]any{
					"error": "Something went wrong",
				})
				return
			}

			if user.Id == "" {
				_ = authService.Logout(cookie.Value)

				http.SetCookie(w, &http.Cookie{
					Name:   "sessionId",
					Path:   "/",
					MaxAge: -1,
				})
				next.ServeHTTP(w, r)
				return
			}

			ctx := context.WithValue(r.Context(), "userId", user.Id)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func GuestOnly(next http.Handler) http.Handler {
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

func AuthRequired(next http.Handler) http.Handler {

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

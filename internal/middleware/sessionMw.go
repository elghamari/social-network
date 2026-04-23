package middleware

import (
	"context"
	"fmt"
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
			fmt.Println("aaaaaaaaaaaaaaaaaaaaaaaaa")

			user, err := a.AuthService.GetUser(cookie.Value)
			if err != nil {
				utils.WriteJson(w, map[string]any{
					"ok":     false,
					"status": http.StatusInternalServerError,
				})
				log.Println(err)
				return
			}

			if user.Id == "" {
				fmt.Println("sssssssssssssssss")
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
			fmt.Println(user.Id)
			next.ServeHTTP(w, r.WithContext(ctx))
		
	}
}

func GuestOnly(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userID := utils.GetUserId(r)
		if userID != "" {
			utils.WriteJson(w, map[string]any{
				"status": http.StatusConflict,
				"code":   "ALREADY_LOGGED",
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
			utils.WriteJson(w, map[string]any{
				"status": http.StatusUnauthorized,
				"code":   "UNAUTHORIZED",
			})
			return
		}
		next.ServeHTTP(w, r)
	})
}

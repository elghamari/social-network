package middleware

import (
	"context"
	"log"
	"net/http"

	"socialnetwork/services"
	"socialnetwork/utils"
)

// SessionLoader reads the sessionId cookie on every request and, if valid,
// injects the user's ID and email into the request context.
func SessionLoader(authSrv *services.AuthSrvs) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

			cookie, err := r.Cookie("sessionId")
			if err != nil {
				// No cookie → continue unauthenticated
				next.ServeHTTP(w, r)
				return
			}

			user, err := authSrv.GetUser(cookie.Value)
			if err != nil {
				utils.WriteJson(w, http.StatusInternalServerError, "internal error")
				log.Println("SessionLoader:", err)
				return
			}

			// Session expired or not found → clear the stale cookie
			if user.ID == "" {
				_ = authSrv.Logout(cookie.Value)
				http.SetCookie(w, &http.Cookie{
					Name:   "sessionId",
					Path:   "/",
					MaxAge: -1,
				})
				next.ServeHTTP(w, r)
				return
			}

			ctx := context.WithValue(r.Context(), "userId", user.ID)
			ctx = context.WithValue(ctx, "userEmail", user.Email)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// GuestOnly blocks authenticated users from accessing guest-only routes
// (register, login). Returns 409 if already logged in.
func GuestOnly(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if utils.GetUserId(r) != "" {
			utils.WriteJson(w, http.StatusConflict, "already logged in")
			return
		}
		next.ServeHTTP(w, r)
	})
}

// AuthRequired blocks unauthenticated users from accessing protected routes.
// Returns 401 if not logged in.
func AuthRequired(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if utils.GetUserId(r) == "" {
			utils.WriteJson(w, http.StatusUnauthorized, "unauthorized")
			return
		}
		next.ServeHTTP(w, r)
	})
}

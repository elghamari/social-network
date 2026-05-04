package middleware

import "soc-net/internal/services"

type Middleware struct {
	Auth    *services.AuthService
	Limiter *LimiterStore
}

func New(auth *services.AuthService, limiter *LimiterStore) *Middleware {
	return &Middleware{
		Auth:    auth,
		Limiter: limiter,
	}
}

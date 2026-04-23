package middleware

import "soc-net/internal/services"

type Mid struct {
	AuthService *services.AuthService
}

func NewMid(auth *services.AuthService) *Mid {
	return  &Mid{AuthService: auth}
}

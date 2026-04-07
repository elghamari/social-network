package services

import "soc-net/internal/repositories"

type Services struct {
	Auth *AuthService
}

func New(r *repositories.Repos) *Services {
	return &Services{
		Auth: NewAuthService(r.Auth),
	}
}

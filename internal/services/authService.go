package services

import (
	"soc-net/internal/repositories"
	"soc-net/internal/types"
	"time"
)

type AuthService struct {
	Auth *repositories.AuthRepo
}

func NewAuthService(r *repositories.AuthRepo) *AuthService {
	return &AuthService{
		Auth: r,
	}
}

func (s *AuthService) GetUser(sessionId string) (types.UserAuth, error) {
	user, err := s.Auth.GetUserBySessionId(sessionId)
	if err != nil {
		return user, err
	}

	if time.Since(user.SessionTime) >= 24*time.Hour {
		return types.UserAuth{
			Id: "",
		}, nil
	}
	return user, nil
}

func (s *AuthService) Logout(sessionId string) error {
	if sessionId == "" {
		return nil
	}
	return s.Auth.ClearSession(sessionId)
}

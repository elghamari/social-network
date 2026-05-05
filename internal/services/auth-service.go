package services

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"

	"soc-net/internal/repositories"
	"soc-net/internal/types"

	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	Auth *repositories.AuthRepo
}

func NewAuthService(r *repositories.AuthRepo) *AuthService {
	return &AuthService{Auth: r}
}

// ===== Session middleware helpers

func (s *AuthService) GetUser(sessionId string) (types.UserAuth, error) {
	user, err := s.Auth.GetUserBySessionId(sessionId)
	if err != nil {
		return user, err
	}
	if user.Id == "" {
		return types.UserAuth{}, nil
	}
	if time.Since(user.SessionTime) >= 24*time.Hour {
		return types.UserAuth{}, nil
	}
	return user, nil
}

func (s *AuthService) Logout(sessionId string) error {
	if sessionId == "" {
		return nil
	}
	return s.Auth.ClearSession(sessionId)
}

// ===== Register / Login

func (s *AuthService) Register(input types.RegisterInput) error {
	if err := ValidateRegisterInput(input); err != nil {
		return err
	}
	hashed, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("Register: %w", err)
	}
	uuid := generateUUID()
	return s.Auth.CreateUser(input, string(hashed), uuid)
}

func (s *AuthService) Login(input types.LoginInput) (types.User, string, error) {
	user, err := s.Auth.GetUserByEmail(input.Email)
	if err != nil {
		return types.User{}, "", fmt.Errorf("invalid credentials")
	}
	if bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)) != nil {
		return types.User{}, "", fmt.Errorf("invalid credentials")
	}
	sessionID := generateUUID()
	if err := s.Auth.SetSession(user.ID, sessionID); err != nil {
		return types.User{}, "", fmt.Errorf("Login: session error: %w", err)
	}
	return user, sessionID, nil
}

func (s *AuthService) GetUserById(id string) (types.User, error) {
	return s.Auth.GetUserById(id)
}

func generateUUID() string {
	b := make([]byte, 16)
	rand.Read(b)
	return hex.EncodeToString(b)
}

func (s *AuthService) ValidateSession(sessionID string) (string, bool) {
	return s.Auth.ValidateSession(sessionID)
}

func (s *AuthService) UpdatePrivacy(userID string, isPublic bool) error {
	return s.Auth.UpdatePrivacy(userID, isPublic)
}

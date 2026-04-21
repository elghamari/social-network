package services

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"regexp"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
	"soc-net/internal/repositories"
	"soc-net/internal/types"
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

var (
	emailRegex = regexp.MustCompile(`^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,4}$`)
	nameRegex  = regexp.MustCompile(`^[a-zA-Z\s]{2,20}$`)
	dateRegex  = regexp.MustCompile(`^\d{4}-\d{2}-\d{2}$`)
)

func validateRegisterInput(input types.RegisterInput) error {
	email := strings.ToLower(strings.TrimSpace(input.Email))
	if !emailRegex.MatchString(email) {
		return errors.New("invalid email format")
	}
	if len(strings.TrimSpace(input.Password)) < 6 {
		return errors.New("password must be at least 6 characters")
	}
	if !nameRegex.MatchString(strings.TrimSpace(input.FirstName)) {
		return errors.New("first name must be 2-20 letters only")
	}
	if !nameRegex.MatchString(strings.TrimSpace(input.LastName)) {
		return errors.New("last name must be 2-20 letters only")
	}
	if !dateRegex.MatchString(input.DateOfBirth) {
		return errors.New("date of birth must be YYYY-MM-DD")
	}
	return nil
}

func (s *AuthService) Register(input types.RegisterInput) error {
	if err := validateRegisterInput(input); err != nil {
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

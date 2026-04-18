package services

import (
	"fmt"
	"time"

	"socialnetwork/modle"
	"socialnetwork/repositorie"
)

type AuthSrvs struct {
	AuthRepo *repositorie.Auth
}

func NewAuthSrvs(authRepo *repositorie.Auth) *AuthSrvs {
	return &AuthSrvs{AuthRepo: authRepo}
}

// GetUserById fetches a user's public profile by UUID.
func (a *AuthSrvs) GetUserById(userid string) (modle.User, error) {
	return a.AuthRepo.GetUserById(userid)
}

// GetUser validates the session cookie value and returns the associated user.
// Returns an empty UserAuth (ID == "") if the session is expired or unknown.
func (a *AuthSrvs) GetUser(sessionId string) (modle.UserAuth, error) {
	user, err := a.AuthRepo.GetUserBySessionId(sessionId)
	if err != nil {
		return modle.UserAuth{}, err
	}

	// Treat sessions older than 24 h as expired
	if user.ID != "" && time.Since(user.SessionTime) >= 24*time.Hour {
		return modle.UserAuth{}, nil
	}

	return user, nil
}

// Register validates input, hashes the password, and creates a new user.
func (a *AuthSrvs) Register(input modle.RegisterInput) error {
	if err := ValidRegisterInput(input); err != nil {
		return err
	}

	available, err := a.AuthRepo.IsEmailAvailable(input.Email)
	if err != nil {
		return fmt.Errorf("Register: %w", err)
	}
	if !available {
		return fmt.Errorf("email already in use")
	}

	hashed, err := hashPassword(input.Password)
	if err != nil {
		return fmt.Errorf("Register: %w", err)
	}

	uuid := generateUUID()
	return a.AuthRepo.CreateUser(input, hashed, uuid)
}

// Login checks credentials and, on success, stores a session and returns
// the new sessionId to be placed in a cookie.
func (a *AuthSrvs) Login(input modle.LoginInput) (string, error) {
	user, err := a.AuthRepo.GetUserByEmail(input.Email)
	if err != nil {
		return "", fmt.Errorf("invalid credentials")
	}

	if !checkPassword(user.Password, input.Password) {
		return "", fmt.Errorf("invalid credentials")
	}

	sessionId := generateUUID()
	if err := a.AuthRepo.SetSession(user.Email, sessionId); err != nil {
		return "", fmt.Errorf("Login: %w", err)
	}

	return sessionId, nil
}

// Logout clears the session from the database.
func (a *AuthSrvs) Logout(sessionId string) error {
	if sessionId == "" {
		return nil
	}
	return a.AuthRepo.ClearSession(sessionId)
}

package repositorie

import (
	"database/sql"
	"errors"
	"fmt"

	"socialnetwork/modle"
)

type Auth struct {
	Db *sql.DB
}

func NewAuth(db *sql.DB) *Auth {
	return &Auth{Db: db}
}

// GetUserById fetches a user's public profile by UUID.
func (a *Auth) GetUserById(id string) (modle.User, error) {
	var u modle.User
	var avatar, nickname, aboutMe sql.NullString

	query := `SELECT id, email, first_name, last_name, date_of_birth,
	                 avatar, nickname, about_me, is_public, created_at
	          FROM users WHERE id = ?`

	err := a.Db.QueryRow(query, id).Scan(
		&u.ID,
		&u.Email,
		&u.FirstName,
		&u.LastName,
		&u.DateOfBirth,
		&avatar,
		&nickname,
		&aboutMe,
		&u.IsPublic,
		&u.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return modle.User{}, errors.New("user not found")
		}
		return modle.User{}, fmt.Errorf("GetUserById: %w", err)
	}

	if avatar.Valid {
		u.Avatar = &avatar.String
	}
	if nickname.Valid {
		u.Nickname = &nickname.String
	}
	if aboutMe.Valid {
		u.AboutMe = &aboutMe.String
	}

	return u, nil
}

// GetUserByEmail fetches a full user row by email (used during login).
func (a *Auth) GetUserByEmail(email string) (modle.User, error) {
	var u modle.User
	var avatar, nickname, aboutMe sql.NullString

	query := `SELECT id, email, password, first_name, last_name, date_of_birth,
	                 avatar, nickname, about_me, is_public, created_at
	          FROM users WHERE email = ?`

	err := a.Db.QueryRow(query, email).Scan(
		&u.ID,
		&u.Email,
		&u.Password,
		&u.FirstName,
		&u.LastName,
		&u.DateOfBirth,
		&avatar,
		&nickname,
		&aboutMe,
		&u.IsPublic,
		&u.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return modle.User{}, errors.New("user not found")
		}
		return modle.User{}, fmt.Errorf("GetUserByEmail: %w", err)
	}

	if avatar.Valid {
		u.Avatar = &avatar.String
	}
	if nickname.Valid {
		u.Nickname = &nickname.String
	}
	if aboutMe.Valid {
		u.AboutMe = &aboutMe.String
	}

	return u, nil
}

// CreateUser inserts a new user row.
func (a *Auth) CreateUser(input modle.RegisterInput, hashedPassword, uuid string) error {
	query := `INSERT INTO users
	          (id, email, password, first_name, last_name, date_of_birth,
	           nickname, avatar, about_me)
	          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`

	_, err := a.Db.Exec(query,
		uuid,
		input.Email,
		hashedPassword,
		input.FirstName,
		input.LastName,
		input.DateOfBirth,
		input.Nickname,
		input.Avatar,
		input.AboutMe,
	)
	if err != nil {
		return fmt.Errorf("CreateUser: %w", err)
	}
	return nil
}

// IsEmailAvailable returns true if no user has the given email yet.
func (a *Auth) IsEmailAvailable(email string) (bool, error) {
	var exists int
	err := a.Db.QueryRow(`SELECT 1 FROM users WHERE email = ?`, email).Scan(&exists)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return false, fmt.Errorf("IsEmailAvailable: %w", err)
	}
	return exists == 0, nil
}

// IsUserPublic returns whether the target user has a public profile.
func (a *Auth) IsUserPublic(targetID string) (bool, error) {
	var isPublic bool
	err := a.Db.QueryRow(`SELECT is_public FROM users WHERE id = ?`, targetID).Scan(&isPublic)
	if err != nil {
		return false, fmt.Errorf("IsUserPublic: %w", err)
	}
	return isPublic, nil
}

// ── Session management ───────────────────────────────────────────────────────

// GetUserBySessionId returns the lightweight UserAuth for an active session.
// Returns an empty UserAuth (ID == "") when the session does not exist.
func (a *Auth) GetUserBySessionId(sessionId string) (modle.UserAuth, error) {
	var u modle.UserAuth
	var sessionTime sql.NullTime

	err := a.Db.QueryRow(
		`SELECT id, email, session_time FROM users WHERE session_id = ?`, sessionId,
	).Scan(&u.ID, &u.Email, &sessionTime)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return modle.UserAuth{}, nil // expired / unknown session
		}
		return modle.UserAuth{}, fmt.Errorf("GetUserBySessionId: %w", err)
	}

	if sessionTime.Valid {
		u.SessionTime = sessionTime.Time
	}

	return u, nil
}

// SetSession stores a new sessionId for the user identified by email.
func (a *Auth) SetSession(email, sessionId string) error {
	_, err := a.Db.Exec(
		`UPDATE users SET session_id = ?, session_time = CURRENT_TIMESTAMP WHERE email = ?`,
		sessionId, email,
	)
	if err != nil {
		return fmt.Errorf("SetSession: %w", err)
	}
	return nil
}

// ClearSession removes the session for the given sessionId (logout).
func (a *Auth) ClearSession(sessionId string) error {
	_, err := a.Db.Exec(
		`UPDATE users SET session_id = NULL, session_time = NULL WHERE session_id = ?`,
		sessionId,
	)
	if err != nil {
		return fmt.Errorf("ClearSession: %w", err)
	}
	return nil
}

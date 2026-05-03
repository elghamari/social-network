package repositories

import (
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"time"

	"soc-net/internal/types"
)

type AuthRepo struct {
	DB *sql.DB
}

func NewAuthRepo(db *sql.DB) *AuthRepo {
	return &AuthRepo{DB: db}
}

// ===== Session

func (r *AuthRepo) GetUserBySessionId(sessionId string) (types.UserAuth, error) {
	user := types.UserAuth{}
	err := r.DB.QueryRow(`
		SELECT id, session_time 
		FROM users
		WHERE session_id = ?
	`, sessionId).Scan(&user.Id, &user.SessionTime)
	if err != nil {
		if err == sql.ErrNoRows {
			return types.UserAuth{}, nil
		}
		return user, fmt.Errorf("authRepo.GetUserBySessionId: %w", err)
	}
	nickname, err := r.GetUserNicknameById(user.Id)
	if err != nil {
		if err == sql.ErrNoRows {
			return types.UserAuth{}, nil
		}
		return user, fmt.Errorf("authRepo.GetUserBySessionId: %w", err)
	}
	user.Nickname = nickname
	return user, nil
}

func (r *AuthRepo) SetSession(userID, sessionID string) error {
	expiresAt := time.Now().Add(24 * time.Hour)

	_, err := r.DB.Exec(`
		UPDATE users
		SET session_id = ?, session_time = ?
		WHERE id = ?
	`, sessionID, expiresAt, userID)
	if err != nil {
		return fmt.Errorf("authRepo.SetSession: %w", err)
	}
	return nil
}

func (r *AuthRepo) ClearSession(sessionId string) error {
	_, err := r.DB.Exec(`
		UPDATE users
		SET session_id = NULL, session_time = NULL
		WHERE session_id = ?
	`, sessionId)
	if err != nil {
		return fmt.Errorf("authRepo.ClearSession: %w", err)
	}
	return nil
}

// ===== Register / Login

func (r *AuthRepo) CreateUser(input types.RegisterInput, hashedPassword, uuid string) error {
	_, err := r.DB.Exec(`
		INSERT INTO users (id, email, password, first_name, last_name, date_of_birth, nickname, avatar, about_me)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	`, uuid, input.Email, hashedPassword, input.FirstName, input.LastName,
		input.DateOfBirth, input.Nickname, input.Avatar, input.AboutMe)
	if err != nil {
		return fmt.Errorf("Email already registered")
	}
	return nil
}

func (r *AuthRepo) GetUserByEmail(email string) (types.User, error) {
	var u types.User
	var avatar, nickname, aboutMe sql.NullString

	err := r.DB.QueryRow(`
		SELECT id, email, password, first_name, last_name, date_of_birth,
		       avatar, nickname, about_me, is_public, created_at
		FROM users WHERE email = ?
	`, email).Scan(
		&u.ID, &u.Email, &u.Password, &u.FirstName, &u.LastName,
		&u.DateOfBirth, &avatar, &nickname, &aboutMe, &u.IsPublic, &u.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return types.User{}, fmt.Errorf("authRepo.GetUserByEmail: user not found")
		}
		return types.User{}, fmt.Errorf("authRepo.GetUserByEmail: %w", err)
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

func (r *AuthRepo) GetUserNicknameById(id string) (string, error) {
	var nickname sql.NullString

	err := r.DB.QueryRow(`
		SELECT nickname
		FROM users WHERE id = ?
	`, id).Scan(&nickname)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return "", fmt.Errorf("authRepo.GetUserNicknameById: user not found")
		}
		return "", fmt.Errorf("authRepo.GetUserNicknameById: %w", err)
	}
	if nickname.Valid {
		return nickname.String, nil
	}
	return "", nil
}

func (r *AuthRepo) GetUserById(id string) (types.User, error) {
	var u types.User
	var avatar, nickname, aboutMe sql.NullString

	err := r.DB.QueryRow(`
		SELECT id, email, first_name, last_name, date_of_birth,
		       avatar, nickname, about_me, is_public, created_at
		FROM users WHERE id = ?
	`, id).Scan(
		&u.ID, &u.Email, &u.FirstName, &u.LastName,
		&u.DateOfBirth, &avatar, &nickname, &aboutMe, &u.IsPublic, &u.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return types.User{}, fmt.Errorf("authRepo.GetUserById: user not found")
		}
		return types.User{}, fmt.Errorf("authRepo.GetUserById: %w", err)
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

func (r *AuthRepo) IsUserPublic(targetID string) (bool, error) {
	var isPublic bool
	err := r.DB.QueryRow(`SELECT is_public FROM users WHERE id = ?`, targetID).Scan(&isPublic)
	if err != nil {
		return false, fmt.Errorf("authRepo.IsUserPublic: %w", err)
	}
	return isPublic, nil
}

func (r *AuthRepo) CheckUserExists(id string) (bool, error) {
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM users WHERE id = ?)`
	err := r.DB.QueryRow(query, id).Scan(&exists)
	return exists, err
}

func (s *AuthRepo) ValidateSession(sessionID string) (string, bool) {
	var userID string
	var sessionTime time.Time

	query := `SELECT id, session_time FROM users WHERE session_id = ?`
	err := s.DB.QueryRow(query, sessionID).Scan(&userID, &sessionTime)
	if err != nil {
		return "", false
	}
	if time.Now().After(sessionTime) {
		s.DB.Exec(`UPDATE users SET session_id = NULL, session_time = NULL WHERE id = ?`, userID)
		return "", false
	}
	return userID, true
}

func (r *AuthRepo) UpdatePrivacy(userID string, isPublic bool) error {
	query := `UPDATE users SET is_public = ? WHERE id = ?`
	_, err := r.DB.Exec(query, isPublic, userID)
	return err
}

func (r *AuthRepo) UserExists(userID string) (bool, error) {
	var exists bool
	err := r.DB.QueryRow(`
		SELECT EXISTS(
			SELECT 1 FROM users WHERE id = ?
		)
	`, userID).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("authRepo.UserExists: %w", err)
	}
	return exists, nil
}

func (r *AuthRepo) CheckAllUsersExist(userIds []string) (bool, error) {
	if len(userIds) == 0 {
		return true, nil
	}

	placeholders := make([]string, len(userIds))
	args := make([]interface{}, len(userIds))

	for i, id := range userIds {
		placeholders[i] = "?"
		args[i] = id
	}

	query := fmt.Sprintf("SELECT COUNT(id) FROM users WHERE id IN (%s)", strings.Join(placeholders, ","))

	var count int
	err := r.DB.QueryRow(query, args...).Scan(&count)
	if err != nil {
		return false, fmt.Errorf("CheckAllUsersExist (QueryRow): %w", err)
	}

	return count == len(userIds), nil
}

package repositories

import (
	"database/sql"
	"fmt"
	"soc-net/internal/types"
)

type AuthRepo struct {
	DB *sql.DB
}

func NewAuthRepo(db *sql.DB) *AuthRepo {
	return &AuthRepo{DB: db}
}

func (r *AuthRepo) GetUserBySessionId(sessionId string) (types.UserAuth, error) {
	user := types.UserAuth{}

	err := r.DB.QueryRow(`
		SELECT id, session_time
		FROM users
		WHERE session_id = ?
		`, sessionId).Scan(&user.Id, &user.SessionTime)
	if err != nil {
		if err == sql.ErrNoRows {
			return types.UserAuth{
				Id: "",
			}, nil
		}
		return user, fmt.Errorf("authRepo.GetUserBySessionID: %w", err)
	}

	return user, nil
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

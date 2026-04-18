package repositorie

import (
	"database/sql"
	"errors"
)

func (r *Repo) GetUserIDBySession(s string) (string, error) {
	var id string

	err := r.Db.QueryRow("SELECT id FROM users WHERE sessionid=?", s).Scan(&id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return "", errors.New("invalid session")
		}
		return "", err
	}

	return id, nil
}

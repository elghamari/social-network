package repositories

import "database/sql"

type Repos struct {
	Auth *AuthRepo
}

func New(db *sql.DB) *Repos {
	return &Repos{
		Auth: NewAuthRepo(db),
	}
}

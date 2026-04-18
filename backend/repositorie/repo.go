package repositorie

import "database/sql"

// Repo is the base repository holding the DB connection for generic queries.
type Repo struct {
	Db *sql.DB
}

func NewRepo(db *sql.DB) *Repo {
	return &Repo{Db: db}
}

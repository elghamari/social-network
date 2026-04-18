package app

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/mattn/go-sqlite3"
)

type App struct {
	Db *sql.DB
}

func NewApp(db *sql.DB) *App {
	return &App{Db: db}
}

// SetupDb opens the SQLite database, enables foreign keys, and runs the
// migration SQL file so all tables are created if they do not yet exist.
func SetupDb(dbPath, migrationsPath string) (*sql.DB, error) {
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, fmt.Errorf("SetupDb: error opening db: %w", err)
	}

	// Enable FK constraints
	if _, err = db.Exec("PRAGMA foreign_keys = ON;"); err != nil {
		db.Close()
		return nil, fmt.Errorf("SetupDb: PRAGMA foreign_keys: %w", err)
	}

	if err = db.Ping(); err != nil {
		db.Close()
		return nil, fmt.Errorf("SetupDb: db unreachable: %w", err)
	}

	// Run migration file
	migration, err := os.ReadFile(migrationsPath)
	if err != nil {
		db.Close()
		return nil, fmt.Errorf("SetupDb: reading migration file: %w", err)
	}

	if _, err = db.Exec(string(migration)); err != nil {
		db.Close()
		return nil, fmt.Errorf("SetupDb: running migrations: %w", err)
	}

	log.Println("Database initialized successfully")
	return db, nil
}

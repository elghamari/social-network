package sqlite

import (
	"database/sql"
	"fmt"
	"os"
	"sort"
	"strings"
)

func RunMigrations(db *sql.DB, migrationsPath string) (err error) {
	defer func() {
		if err != nil {
			db.Close()
		}
	}()

	_, err = db.Exec("PRAGMA foreign_keys = ON;")
	if err != nil {
		return fmt.Errorf("RunMigrations: Enabling PRAGMA: %w", err)
	}

	entries, err := os.ReadDir(migrationsPath)
	if err != nil {
		return fmt.Errorf("RunMigrations: ReadDir: %w", err)
	}

	sort.Slice(entries, func(i, j int) bool {
		return entries[i].Name() < entries[j].Name()
	})

	for _, ent := range entries {
		if !strings.HasSuffix(ent.Name(), ".up.sql") {
			continue
		}

		path := migrationsPath + ent.Name()

		query, err := os.ReadFile(path)
		if err != nil {
			return fmt.Errorf("RunMigrations: %w \nReading `%s`", err, path)
		}

		_, err = db.Exec(string(query))
		if err != nil {
			return fmt.Errorf("RunMigrations: up tables: %w", err)
		}
	}

	return nil
}

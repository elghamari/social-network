package app

import (
	"database/sql"
	"fmt"
	"net/http"
	"os"
	"soc-net/internal/db/sqlite"
	"soc-net/internal/handlers"
	"soc-net/internal/middleware"
	"soc-net/internal/repositories"
	"soc-net/internal/services"

	_ "github.com/mattn/go-sqlite3"
)

type App struct {
	DB       *sql.DB
	Repos    *repos.Repos
	Services *services.Services
	Server   *http.Server
}

type Config struct {
	DBPath         string
	MigrationsPath string
	Port           string
}

func New(cfg *Config) (*App, error) {

	err := os.MkdirAll("data", 0755)
	if err != nil {
		return nil, err
	}

	db, err := initDataBase(cfg.DBPath, cfg.MigrationsPath)
	if err != nil {
		return nil, err
	}

	repos := repositories.New(db)
	svcs := services.New(repos)
	handler := handlers.New(svcs, cfg.Port)

	limiter := middleware.NewLimiterStore()
	handler = middleware.RateLimit(limiter, handler)

	server := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: handler,
	}

	return &App{
		Server: server,
	}, nil
}

func initDataBase(dbPath, migrationsPath string) (*sql.DB, error) {
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, fmt.Errorf("initDataBase: Opening DB: %w", err)
	}

	err = db.Ping()
	if err != nil {
		db.Close()
		return nil, fmt.Errorf("initDataBase: Pinging: %w", err)
	}

	err = sqlite.RunMigrations(db, migrationsPath)
	if err != nil {
		return nil, err
	}

	return db, nil
}

func (a *App) Start() error {
	return a.Server.ListenAndServe()
}

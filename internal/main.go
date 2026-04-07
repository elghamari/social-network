package main

import (
	"database/sql"
	"soc-net/internal/db/sqlite"
)

func main() {
	// config := &app.Config{
	// 	DBPath:         "./data/forum.db",
	// 	MigrationsPath: "./migrations/setup.sql",
	// 	Port:           "8080",
	// }

	// appStore, err := app.New(config)
	// if err != nil {
	// 	log.Fatal("Failed to initialize app:", err)
	// }
	// defer appStore.DB.Close()

	// log.Println("Server started at http://localhost:8080")
	// log.Fatal(app.Start())

	sqlite.RunMigrations(&sql.DB{})

}

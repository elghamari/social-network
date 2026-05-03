package main

import (
	"log"
	"soc-net/internal/app"
)

func main() {
	config := &app.Config{
		DBPath:         "./data/database.db",
		MigrationsPath: "./internal/db/migrations/sqlite/",
		Port:           "8080",
	}

	appStore, err := app.New(config)
	if err != nil {
		log.Fatal("Failed to initialize app:", err)
	}
	defer appStore.DB.Close()

	log.Println("Server started on :" + config.Port)
	log.Fatal(appStore.Start())
}

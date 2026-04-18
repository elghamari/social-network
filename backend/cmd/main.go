package main

import (
	"fmt"
	"log"
	"net/http"

	"socialnetwork/app"
	"socialnetwork/handler"
	"socialnetwork/repositorie"
	"socialnetwork/services"
)

func main() {
	// Open DB and run migrations
	db, err := app.SetupDb("./social.db", "./migration/db.sql")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Wire up repositories → services → handler
	authRepo   := repositorie.NewAuth(db)
	followRepo := repositorie.NewFollowRepo(db)
	srv        := services.New(authRepo, followRepo)
	h          := handler.New(srv)

	// Register routes (returns handler wrapped with SessionLoader + CORS)
	mux    := http.NewServeMux()
	router := h.SetupRoutes(mux)

	fmt.Println("Server running on :8080")
	log.Fatal(http.ListenAndServe(":8080", router))
}

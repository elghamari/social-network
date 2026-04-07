package utils

import (
	"encoding/json"
	"log"
	"net/http"
)

func WriteJson(w http.ResponseWriter, data map[string]any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(data["status"].(int))
	err := json.NewEncoder(w).Encode(data)
	if err != nil {
		log.Println(err)
	}
}

func GetUserId(r *http.Request) string {
	value := r.Context().Value("userId")
	userID, ok := value.(string)
	if !ok {
		return ""
	}
	return userID
}

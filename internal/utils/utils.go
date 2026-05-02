package utils

import (
	"encoding/json"
	"log"
	"net/http"
)

func WriteJson(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(data); err != nil {
		log.Println("WriteJson encode error:", err)
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
func GetNickname(r *http.Request) string {
	value := r.Context().Value("nickname")
	nickname, ok := value.(string)
	if !ok {
		return ""
	}
	return nickname
}
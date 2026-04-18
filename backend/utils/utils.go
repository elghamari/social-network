package utils

import (
	"encoding/json"
	"net/http"
)

// WriteJson encodes v as JSON and writes it with the given status code.
func WriteJson(w http.ResponseWriter, status int, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(v); err != nil {
		http.Error(w, "Error encoding JSON", http.StatusInternalServerError)
	}
}

// GetUserId extracts the user ID stored in the request context.
func GetUserId(r *http.Request) string {
	value := r.Context().Value("userId")
	userID, ok := value.(string)
	if !ok {
		return ""
	}
	return userID
}

// GetNickname extracts the nickname stored in the request context.
func GetNickname(r *http.Request) string {
	value := r.Context().Value("nickname")
	nickname, ok := value.(string)
	if !ok {
		return ""
	}
	return nickname
}

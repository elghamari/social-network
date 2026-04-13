package handlers

import (
	"errors"
	"log"
	"net/http"
	"soc-net/internal/types"
	"soc-net/internal/utils"
)

func HandleError(w http.ResponseWriter, err error) {
	var ve types.ValidationError

	switch {
	case errors.As(err, &ve):
		utils.WriteJson(w, map[string]any{
			"status": http.StatusBadRequest,
			"fields": ve.Fields,
		})

	default:
		utils.WriteJson(w, map[string]any{
			"status": http.StatusInternalServerError,
		})
		log.Println(err)
	}
}

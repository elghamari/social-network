package handlers

import (
	"errors"
	"log"
	"net/http"
	"soc-net/internal/types"
	"soc-net/internal/utils"
)

func HandleError(w http.ResponseWriter, err error) {
	var ve *types.FormError
	var ae *types.ActionError

	switch {
	case errors.As(err, &ve):
		utils.WriteJson(w, map[string]any{
			"status": http.StatusBadRequest,
			"fields": ve.Fields,
		})

	case errors.As(err, &ae):
		utils.WriteJson(w, map[string]any{
			"status": http.StatusBadRequest,
			"error":  ae.Message,
		})

	default:
		log.Println(err)
		utils.WriteJson(w, map[string]any{
			"status": http.StatusInternalServerError,
		})
	}
}

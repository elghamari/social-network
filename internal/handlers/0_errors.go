package handlers

import (
	"errors"
	"log"
	"net/http"

	"soc-net/internal/types"
	"soc-net/internal/utils"
)

func HandleError(w http.ResponseWriter, err error) {
	var fe *types.FormError
	var ae *types.ActionError
	var nfe *types.NotFoundError
	var fbe *types.ForbiddenError

	switch {
	case errors.As(err, &fe):
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{
			"fields": fe.Fields,
		})

	case errors.As(err, &ae):
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{
			"error": ae.Message,
		})

	case errors.As(err, &nfe):
		utils.WriteJson(w, http.StatusNotFound, map[string]any{
			"error": nfe.Message,
		})

	case errors.As(err, &fbe):
		utils.WriteJson(w, http.StatusForbidden, map[string]any{
			"error": fbe.Message,
		})

	default:
		log.Println(err)
		utils.WriteJson(w, http.StatusInternalServerError, map[string]any{
			"error": "Something went wrong",
		})
	}
}

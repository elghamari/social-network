package handlers

import (
	"errors"
	"log"
	"net/http"

	"soc-net/internal/types"
	"soc-net/internal/utils"
)

func HandleError(w http.ResponseWriter, err error) {
	var formErr *types.FormError
	var actionErr *types.ActionError
	var notFoundErr *types.NotFoundError
	var unauthorizedErr *types.UnauthError

	switch {
	case errors.As(err, &formErr):
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{
			"fields": formErr.Fields,
		})

	case errors.As(err, &actionErr):
		utils.WriteJson(w, http.StatusBadRequest, map[string]any{
			"error": actionErr.Message,
		})

	case errors.As(err, &notFoundErr):
		utils.WriteJson(w, http.StatusNotFound, map[string]any{
			"error": notFoundErr.Message,
		})

	case errors.As(err, &unauthorizedErr):
		utils.WriteJson(w, http.StatusUnauthorized, map[string]any{
			"error": unauthorizedErr.Message,
		})

	default:
		log.Println(err)
		utils.WriteJson(w, http.StatusInternalServerError, map[string]any{
			"error": "Something went wrong",
		})
	}
}

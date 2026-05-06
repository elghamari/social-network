package hub

import (
	"errors"
	"log"
	"net/http"

	"soc-net/internal/types"
)

func HandleError(err error) (int, string) {
	var ae *types.ActionError
	var nfe *types.NotFoundError
	var fbe *types.ForbiddenError

	switch {
	case errors.As(err, &ae):
		return http.StatusBadRequest, ae.Message

	case errors.As(err, &nfe):
		return http.StatusNotFound, ae.Message

	case errors.As(err, &fbe):
		return http.StatusForbidden, ae.Message

	default:
		log.Println(err)
		return http.StatusInternalServerError, "Something went wrong"
	}
}

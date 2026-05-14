package hub

import (
	"errors"
	"log"
	"net/http"

	"soc-net/internal/types"
)


// internal/hub/0_errors.go

func HandleError(err error) (int, string) {
	var ae *types.ActionError
	var nfe *types.NotFoundError
	var fbe *types.ForbiddenError

	switch {
	case errors.As(err, &ae):
		return http.StatusBadRequest, ae.Message

	case errors.As(err, &nfe):
		return http.StatusUnauthorized, "ACCOUNT_DELETED"

	case errors.As(err, &fbe):
		return http.StatusForbidden, fbe.Message 

	default:
		log.Println("WebSocket Internal Error:", err)
		return http.StatusInternalServerError, "INTERNAL_SERVER_ERROR"
	}
}
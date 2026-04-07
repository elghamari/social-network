package types

import (
	"time"
)

type UserAuth struct {
	Id          string `json:"id"`
	SessionTime time.Time
}

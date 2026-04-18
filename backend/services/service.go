package services

import "socialnetwork/repositorie"

// Service aggregates all application-level services.
type Service struct {
	AuthSrv   *AuthSrvs
	FollowSrv *FollowService
}

// New builds the full service layer from repository instances.
func New(authRepo *repositorie.Auth, followRepo *repositorie.FollowRepo) *Service {
	return &Service{
		AuthSrv:   NewAuthSrvs(authRepo),
		FollowSrv: NewFolloweService(followRepo),
	}
}

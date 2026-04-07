package services

import (
	"soc-net/internal/repositories"
	"soc-net/internal/types"
	"strconv"
)

type GroupsService struct {
	Auth   *repositories.AuthRepo
	Groups *repositories.GroupsRepo
}

func NewGroupsService(auth *repositories.AuthRepo, grps *repositories.GroupsRepo) *GroupsService {
	return &GroupsService{
		Auth:   auth,
		Groups: grps,
	}
}

var srvs string = "groups-service"

func (s *GroupsService) GetAll(strCursorId string) ([]types.Group, error) {
	cursorId, err := strconv.Atoi(strCursorId)
	if err != nil {
		return nil, ErrInvalidGroupId
	}

	lastGroupId, err := s.Groups.GetMaxGroupId()
	if err != nil {
		return nil, err
	}

	if cursorId > lastGroupId {
		return nil, ErrInvalidGroupId
	}
}

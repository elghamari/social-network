package services

import (
	"fmt"
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

func (s *GroupsService) CreateGroup(input types.GroupInput) (types.Group, error) {

	group := types.Group{}

	err := ValidateGroupInput(input)
	if err != nil {
		return group, err
	}

	tx, err := s.Groups.DB.Begin()
	if err != nil {
		return group, fmt.Errorf("%s.AddGroup: Starting tx: %w", srvs, err)
	}
	defer tx.Rollback()

	groupId, err := s.Groups.Insert(tx, input)
	if err != nil {
		return group, err
	}

	group, err = s.Groups.GetGroupById(tx, groupId)
	if err != nil {
		return group, err
	}

	err = tx.Commit()
	if err != nil {
		return group, fmt.Errorf("%s.AddGroup: Commiting tx: %w", srvs, err)
	}

	return group, nil
}

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

	// s.Groups.GetAll(cursorId)

	return []types.Group{}, nil
}

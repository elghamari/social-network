package services

import (
	"fmt"
	"soc-net/internal/repositories"
	"soc-net/internal/types"
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

// ===== Group Services
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

	groupId, err := s.Groups.CreateGroup(tx, input)
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

func GetGroupsSqlParams(tab, search, userId string) (string, []any) {
	query := `
	SELECT 
		g.id, g.creator_id, g.title, g.description, g.created_at,

		(SELECT COUNT(*) FROM group_members WHERE group_id = g.id) AS members_cnt,

		EXISTS(
			SELECT 1 
			FROM group_members gm 
			WHERE gm.user_id = ? AND gm.group_id = g.id
		) AS is_joined,

		EXISTS(
			SELECT 1 
			FROM group_join_requests gjr 
			WHERE gjr.user_id = ? AND gjr.group_id = g.id
		) AS is_pending

	FROM groups g
	WHERE 1=1
	`
	args := []any{userId, userId}

	if search != "" {
		query += ` AND g.title LIKE '%' || ? || '%'`
		args = append(args, search)
	}

	switch tab {
	case "joined":
		query += `
		AND EXISTS(
			SELECT 1 
			FROM group_members gm 
			WHERE gm.user_id = ? AND gm.group_id = g.id
		)`
		args = append(args, userId)

	case "pending":
		query += `
		AND EXISTS(
			SELECT 1 
			FROM group_join_requests gjr 
			WHERE gjr.user_id = ? AND gjr.group_id = g.id
		)`
		args = append(args, userId)
	}

	return query, args
}

func (s *GroupsService) ListGroups(tab, search string) ([]types.Group, error) {
	err := ValidateGroupsReq(tab, search)
	if err != nil {
		return nil, err
	}

	query, args := GetGroupsSqlParams(tab, search, "user")

	groups, err := s.Groups.ListGroups(query, args)
	if err != nil {
		return nil, err
	}

	return groups, err
}

// ===== JoinRequest Handlers
func (s *GroupsService) RequestToJoinGroup(req types.JoinRequest) error {
	exists, err := s.Groups.ValidGroupId(req.GroupId)
	if err != nil {
		return err
	}

	err = ValidateJoinRequest(exists)
	if err != nil {
		return err
	}

	err = s.Groups.CreateJoinRequest(req)
	if err != nil {
		return err
	}

	return nil
}

func (s *GroupsService) CancelToJoinGroup(req types.JoinRequest) error {
	exists, err := s.Groups.ValidGroupId(req.GroupId)
	if err != nil {
		return err
	}

	err = ValidateJoinRequest(exists)
	if err != nil {
		return err
	}

	fmt.Println(req)

	err = s.Groups.DeleteJoinRequest(req)
	if err != nil {
		return err
	}

	return nil
}

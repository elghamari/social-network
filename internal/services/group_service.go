package services

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"soc-net/internal/repositories"
	"soc-net/internal/types"

	"github.com/google/uuid"
)

type GroupService struct {
	Auth  *repositories.AuthRepo
	Group *repositories.GroupRepo
}

func NewGroupService(auth *repositories.AuthRepo, gr *repositories.GroupRepo) *GroupService {
	return &GroupService{
		Auth:  auth,
		Group: gr,
	}
}

var groupServiceName = "group-service"

// ===== Guards

func (s *GroupService) ensureUserExists(userId string) error {
	exists, err := s.Auth.UserExists(userId)
	if err != nil {
		return err
	}
	if !exists {
		return types.NewActionError("User does not exist.")
	}
	return nil
}

func (s *GroupService) ensureGroupExists(groupId string) error {
	exists, err := s.Group.GroupExists(groupId)
	if err != nil {
		return err
	}
	if !exists {
		return types.NewActionError("Group does not exist.")
	}
	return nil
}

func (s *GroupService) ensureUserIsCreator(groupId, userId string) error {
	role, err := s.Group.GetUserGroupRole(groupId, userId)
	if err != nil {
		return err
	}
	if role != "CREATOR" {
		return types.NewActionError("You are not authorized to perform this action")
	}
	return nil
}

func (s *GroupService) ensureUserIsMember(groupId, userId string) error {
	role, err := s.Group.GetUserGroupRole(groupId, userId)
	if err != nil {
		return err
	}
	if role != "MEMBER" && role != "CREATOR" {
		return types.NewActionError("You must be a member to perform this action")
	}
	return nil
}

func (s *GroupService) ensureUserIsNotMember(groupId, userId string) error {
	role, err := s.Group.GetUserGroupRole(groupId, userId)
	if err != nil {
		return err
	}
	switch role {
	case "MEMBER", "CREATOR":
		return types.NewActionError("You are already a member of this group")
	case "PENDING":
		return types.NewActionError("You already have a pending request")
	}
	return nil
}

// ===== Group

func (s *GroupService) saveGroupCoverImage(formErr *types.FormError, image io.Reader, name string) (string, error) {
	ext := filepath.Ext(name)
	switch ext {
	case ".png", ".jpg", ".jpeg", ".webp":
	default:
		if ext != "" {
			formErr.Fields["coverImage"] = "Invalid image type"
		}
		return "", nil
	}

	id := uuid.New().String()
	destPath := "/uploads/" + id + ext
	fullPath := "./data" + destPath

	dest, err := os.Create(fullPath)
	if err != nil {
		os.Remove(fullPath)
		return "", fmt.Errorf("%s.saveGroupCoverImage: Create %w", groupServiceName, err)
	}

	written, err := io.Copy(dest, image)
	dest.Close()
	if err != nil {
		os.Remove(fullPath)
		return "", fmt.Errorf("%s.saveGroupCoverImage: Copy %w", groupServiceName, err)
	}

	if written == 0 {
		os.Remove(fullPath)
		return "", nil
	}

	if written > int64(2<<20) {
		os.Remove(fullPath)
		formErr.Fields["coverImage"] = "Image size must not exceed 2MB"
		return "", nil
	}

	return destPath, nil
}

func (s *GroupService) CreateGroup(input types.GroupInput) error {
	formErr := ValidateGroupInput(input)

	destPath, err := s.saveGroupCoverImage(formErr, input.CoverImage, input.CoverImageName)
	if err != nil {
		return err
	}

	if formErr.HasErrors() {
		return formErr
	}

	groupId, err := s.Group.InsertGroup(input, destPath)
	if err != nil {
		return err
	}

	return s.Group.InsertGroupMember(groupId, input.CreatorId, true)
}

func (s *GroupService) ListGroups(userId, tab, search string) ([]types.Group, error) {
	if err := ValidateTab(tab); err != nil {
		return nil, err
	}
	return s.Group.ListGroups(userId, tab, search)
}

func (s *GroupService) GetGroup(groupId, userId string) (types.Group, error) {
	if err := s.ensureGroupExists(groupId); err != nil {
		return types.Group{}, err
	}
	return s.Group.GetGroupForUser(groupId, userId)
}

// ===== Join requests

func (s *GroupService) SubmitJoinRequest(req types.JoinRequest) error {
	if err := s.ensureGroupExists(req.GroupId); err != nil {
		return err
	}
	if err := s.ensureUserIsNotMember(req.GroupId, req.UserId); err != nil {
		return err
	}
	return s.Group.InsertJoinRequest(req.GroupId, req.UserId)
}

func (s *GroupService) CancelJoinRequest(req types.JoinRequest) error {
	if err := s.ensureGroupExists(req.GroupId); err != nil {
		return err
	}
	return s.Group.DeleteJoinRequest(req.GroupId, req.UserId)
}

// ===== Manage — Invitations

func (s *GroupService) GetInvitableUsers(groupId, userId string) ([]types.InvitableUser, error) {
	if err := s.ensureGroupExists(groupId); err != nil {
		return nil, err
	}
	if err := s.ensureUserIsMember(groupId, userId); err != nil {
		return nil, err
	}
	return s.Group.ListInvitableUsersForGroup(groupId, userId)
}

func (s *GroupService) CreateGroupInvitation(groupId, inviterId string, inv types.Invitation) error {
	if inviterId == inv.UserId {
		return types.NewActionError("You cannot invite yourself")
	}
	if err := s.ensureGroupExists(groupId); err != nil {
		return err
	}
	if err := s.ensureUserExists(inv.UserId); err != nil {
		return err
	}
	if err := s.ensureUserIsMember(groupId, inviterId); err != nil {
		return err
	}
	return s.Group.InsertGroupInvitation(groupId, inviterId, inv.UserId)
}

func (s *GroupService) RevokeGroupInvitation(groupId, revokerId string, inv types.Invitation) error {
	if err := s.ensureGroupExists(groupId); err != nil {
		return err
	}
	if err := s.ensureUserExists(inv.UserId); err != nil {
		return err
	}
	if err := s.ensureUserIsMember(groupId, revokerId); err != nil {
		return err
	}
	return s.Group.DeleteGroupInvitation(groupId, inv.UserId)
}

// ===== Manage — Join requests

func (s *GroupService) ListJoinRequestUsers(groupId, userId string) ([]types.JoinRequestUser, error) {
	if err := s.ensureGroupExists(groupId); err != nil {
		return nil, err
	}
	if err := s.ensureUserIsCreator(groupId, userId); err != nil {
		return nil, err
	}
	return s.Group.ListJoinRequestUsersForGroup(groupId)
}

func (s *GroupService) ApproveJoinRequest(groupId, approverId string, req types.JoinRequest) error {
	if err := s.ensureGroupExists(groupId); err != nil {
		return err
	}
	if err := s.ensureUserExists(req.UserId); err != nil {
		return err
	}
	if err := s.ensureUserIsCreator(groupId, approverId); err != nil {
		return err
	}
	if err := s.Group.InsertGroupMember(groupId, req.UserId, false); err != nil {
		return err
	}
	if err := s.Group.DeleteGroupInvitation(groupId, req.UserId); err != nil {
		return err
	}
	return s.Group.DeleteJoinRequest(groupId, req.UserId)
}

func (s *GroupService) RejectJoinRequest(groupId, rejecterId string, req types.JoinRequest) error {
	if err := s.ensureGroupExists(groupId); err != nil {
		return err
	}
	if err := s.ensureUserExists(req.UserId); err != nil {
		return err
	}
	if err := s.ensureUserIsCreator(groupId, rejecterId); err != nil {
		return err
	}
	return s.Group.DeleteJoinRequest(groupId, req.UserId)
}

func (s *GroupService) CreateEvent(groupId, userId string, event types.Event) (types.Event, error) {
	if err := s.ensureGroupExists(groupId); err != nil {
		return types.Event{}, err
	}

	if err := s.ensureUserIsMember(groupId, userId); err != nil {
		return types.Event{}, err
	}

	if err := s.ensureUserIsMember(groupId, userId); err != nil {
		return types.Event{}, err
	}

	if err := ValidateEvent(event); err != nil {
		return types.Event{}, err
	}

	tx, err := s.Group.DB.Begin()
	if err != nil {
		return types.Event{}, fmt.Errorf("%s.CreateEvent: Starting transaction: %w", groupServiceName, err)
	}
	defer tx.Rollback()

	eventId, err := s.Group.InsertEvent(tx, groupId, event)
	if err != nil {
		return types.Event{}, err
	}

	event, err = s.Group.GetEventForUser(tx, eventId)
	if err != nil {
		return types.Event{}, err
	}

	err = tx.Commit()
	if err != nil {
		return types.Event{}, fmt.Errorf("%s.CreateEvent: Commiting transaction: %w", groupServiceName, err)
	}

	return event, nil
}

func (s *GroupService) ListEvents(groupId, userId string) ([]types.Event, error) {
	if err := s.ensureGroupExists(groupId); err != nil {
		return nil, err
	}
	if err := s.ensureUserIsMember(groupId, userId); err != nil {
		return nil, err
	}

	return s.Group.ListEvents(groupId, userId)
}

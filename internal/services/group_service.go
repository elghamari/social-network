package services

import (
	"fmt"
	"soc-net/internal/repositories"
	"soc-net/internal/types"
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

// ============================================================
// Guards — shared pre-condition checks
// ============================================================

// ensureUserExists returns an error if the user does not exist.
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

// ensureGroupExists returns an error if the group does not exist.
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

// ensureUserIsCreator returns an error if the user is not the group creator.
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

// ensureUserIsMember returns an error if the user is not a member or creator.
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

// ensureUserIsNotMember returns an error if the user is already a member,
// creator, or has a pending join request.
func (s *GroupService) ensureUserIsNotMember(groupId, userId string) error {
	role, err := s.Group.GetUserGroupRole(groupId, userId)
	if err != nil {
		return err
	}
	switch role {
	case "MEMBER", "CREATOR":
		return types.NewActionError("You are already a member of this group")
	}
	return nil
}

// ensureEventIsInGroup returns an error if the event does not belong to the group.
func (s *GroupService) ensureEventIsInGroup(eventId, groupId string) error {
	exists, err := s.Group.EventBelongsToGroup(eventId, groupId)
	if err != nil {
		return err
	}
	if !exists {
		return types.NewActionError("Event Not found")
	}
	return nil
}

// ============================================================
// Groups
// ============================================================

// CreateGroup validates input, creates the group, adds the creator
// as a member, and returns the created group — all within a transaction.
func (s *GroupService) CreateGroup(userId string, group types.Group) (types.Group, error) {
	if formErr := ValidateGroup(group); formErr.HasErrors() {
		return types.Group{}, formErr
	}

	tx, err := s.Group.DB.Begin()
	if err != nil {
		return types.Group{}, fmt.Errorf("%s.CreateGroup: Starting transaction: %w", groupServiceName, err)
	}
	defer tx.Rollback()

	groupId, err := s.Group.InsertGroup(tx, group, userId)
	if err != nil {
		return types.Group{}, err
	}

	if err = s.Group.InsertGroupMember(tx, groupId, userId, true); err != nil {
		return types.Group{}, err
	}

	group, err = s.Group.GetGroupForUser(tx, groupId, userId)
	if err != nil {
		return types.Group{}, err
	}

	err = tx.Commit()
	if err != nil {
		return types.Group{}, fmt.Errorf("%s.CreateGroup: Commiting transaction: %w", groupServiceName, err)
	}

	return group, nil
}

// ListGroups returns groups filtered by tab (discover | joined | pending)
// and an optional search query.
func (s *GroupService) ListGroups(userId, tab, search string) ([]types.Group, error) {
	if err := ValidateTab(tab); err != nil {
		return nil, err
	}
	return s.Group.ListGroups(userId, tab, search)
}

// GetGroup returns a single group with the current user's role.
func (s *GroupService) GetGroup(groupId, userId string) (types.Group, error) {
	// if err := s.ensureGroupExists(groupId); err != nil {
	// 	return types.Group{}, err
	// }
	return s.Group.GetGroupForUser(nil, groupId, userId)
}

// ============================================================
// Join Requests (user-facing)
// ============================================================

// SubmitJoinRequest creates a join request for the user.
// Fails if the user is already a member or has a pending request.
func (s *GroupService) SubmitJoinRequest(req types.JoinRequest) error {
	if err := s.ensureGroupExists(req.GroupId); err != nil {
		return err
	}
	if err := s.ensureUserIsNotMember(req.GroupId, req.UserId); err != nil {
		return err
	}
	return s.Group.InsertJoinRequest(req.GroupId, req.UserId)
}

// CancelJoinRequest removes the user's pending join request.
func (s *GroupService) CancelJoinRequest(req types.JoinRequest) error {
	if err := s.ensureGroupExists(req.GroupId); err != nil {
		return err
	}
	return s.Group.DeleteJoinRequest(req.GroupId, req.UserId)
}

// ============================================================
// Invitations (member-facing)
// ============================================================

// GetInvitableUsers returns non-members that can be invited,
// with an IsInvited flag for already-invited users.
func (s *GroupService) GetInvitableUsers(groupId, userId string) ([]types.InvitableUser, error) {
	if err := s.ensureGroupExists(groupId); err != nil {
		return nil, err
	}
	if err := s.ensureUserIsMember(groupId, userId); err != nil {
		return nil, err
	}
	return s.Group.ListInvitableUsersForGroup(groupId, userId)
}

// CreateGroupInvitation sends an invitation to a user.
// Only group members can invite. Cannot invite yourself.
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

// RevokeGroupInvitation cancels a previously sent invitation.
// Only group members can revoke.
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

// ============================================================
// Join Requests (creator-facing)
// ============================================================

// ListJoinRequestUsers returns all users with pending join requests.
// Creator only.
func (s *GroupService) ListJoinRequestUsers(groupId, userId string) ([]types.JoinRequestUser, error) {
	if err := s.ensureGroupExists(groupId); err != nil {
		return nil, err
	}
	if err := s.ensureUserIsCreator(groupId, userId); err != nil {
		return nil, err
	}
	return s.Group.ListJoinRequestUsersForGroup(groupId)
}

// ApproveJoinRequest adds the user as a member, removes their join request,
// and cleans up any existing invitation. Creator only.
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
	if err := s.Group.InsertGroupMember(nil, groupId, req.UserId, false); err != nil {
		return err
	}
	if err := s.Group.DeleteJoinRequest(groupId, req.UserId); err != nil {
		return err
	}
	return s.Group.DeleteGroupInvitation(groupId, req.UserId)
}

// RejectJoinRequest removes a user's join request without adding them.
// Creator only.
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

// ============================================================
// Events
// ============================================================

// CreateEvent validates and inserts a new event into the group,
// then returns the full created event. Members only.
func (s *GroupService) CreateEvent(groupId, userId string, event types.Event) (types.Event, error) {
	if err := s.ensureGroupExists(groupId); err != nil {
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

// ListEvents returns all events for the group. Members only.
func (s *GroupService) ListEvents(groupId, userId string) ([]types.Event, error) {
	if err := s.ensureGroupExists(groupId); err != nil {
		return nil, err
	}
	if err := s.ensureUserIsMember(groupId, userId); err != nil {
		return nil, err
	}
	return s.Group.ListEvents(groupId, userId)
}

// UpdateEventStatus sets or updates the user's RSVP for an event.
// Status must be GOING or NOT_GOING. Members only.
func (s *GroupService) UpdateEventStatus(groupId, userId string, es types.EventStatus) error {
	if err := s.ensureGroupExists(groupId); err != nil {
		return err
	}
	if err := s.ensureUserIsMember(groupId, userId); err != nil {
		return err
	}
	if err := s.ensureEventIsInGroup(es.EventId, groupId); err != nil {
		return err
	}
	if err := ValidateEventStatus(es); err != nil {
		return err
	}
	return s.Group.UpdateEventStatus(es.EventId, userId, es.Status)
}

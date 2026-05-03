package services

import (
	"fmt"
	"soc-net/internal/repositories"
	"soc-net/internal/types"
	"time"
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

// ensureGroupIsValid return a *FormError if it group is invalid.
func (s *GroupService) ensureGroupIsValid(group types.Group) error {
	formErr := types.NewFormError()

	if !(len(group.Title) >= 3 && len(group.Title) <= 100) {
		formErr.Fields["title"] = append(formErr.Fields["title"], "Title cannot be empty and must be between 3 and 100 letters.")
	}

	exists, err := s.Group.IsTitleTaken(group.Title)
	if err != nil {
		return err
	}

	if exists {
		formErr.Fields["title"] = append(formErr.Fields["title"], "A group with this title already exists.")
	}

	if !(len(group.Description) >= 10 && len(group.Description) <= 500) {
		formErr.Fields["description"] = append(formErr.Fields["description"], "Description cannot be empty and must be between 10 and 500 letters.")
	}

	if formErr.HasErrors() {
		return formErr
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

func (s *GroupService) ensureEventIsValid(event types.Event) error {
	formErr := types.NewFormError()

	if !(len(event.Title) >= 3 && len(event.Title) <= 100) {
		formErr.Fields["title"] = append(formErr.Fields["title"], "Title cannot be empty and must be between 3 and 100 letters.")
	}

	if !(len(event.Description) >= 10 && len(event.Description) <= 500) {
		formErr.Fields["description"] = append(formErr.Fields["description"], "Description cannot be empty and must be between 10 and 500 letters.")
	}

	_, err := time.Parse("2006-01-02T15:04", event.Date)
	if err != nil {
		formErr.Fields["date"] = append(formErr.Fields["date"], "Invalid date/time format")
	}

	if formErr.HasErrors() {
		return formErr
	}

	return nil
}

// ============================================================
// Groups
// ============================================================

// CreateGroup validates input, creates the group, adds the creator
// as a member, and returns the created group — all within a transaction.
func (s *GroupService) CreateGroup(userId string, group types.Group) (types.Group, error) {
	if err := s.ensureGroupIsValid(group); err != nil {
		return types.Group{}, err
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
func (s *GroupService) ListGroups(userId, tab, search, cursor string) ([]types.Group, error) {
	if err := ValidateTab(tab); err != nil {
		return nil, err
	}

	if err := ValidateIntegerCursor(cursor); err != nil {
		return nil, err
	}

	return s.Group.ListGroups(userId, tab, search, cursor)
}

// GetGroup returns a single group with the current user's role.
func (s *GroupService) GetGroup(groupId, userId string) (types.Group, error) {
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

func (s *GroupService) GetInvitableUsers(groupId, userId, query, cursor string) ([]types.InvitableUser, error) {

	if err := s.ensureGroupExists(groupId); err != nil {
		return nil, err
	}
	if err := s.ensureUserIsMember(groupId, userId); err != nil {
		return nil, err
	}

	cursor, err := NormalizeDateCursor(cursor)
	if err != nil {
		return nil, err
	}

	return s.Group.GetInvitableUsersForGroup(groupId, userId, query, cursor)
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
func (s *GroupService) GetJoinRequestUsers(groupId, userId, cursor string) ([]types.JoinRequestUser, error) {
	if err := s.ensureGroupExists(groupId); err != nil {
		return nil, err
	}
	if err := s.ensureUserIsCreator(groupId, userId); err != nil {
		return nil, err
	}

	cursor, err := NormalizeDateCursor(cursor)
	if err != nil {
		return nil, err
	}

	return s.Group.GetJoinRequestUsersForGroup(groupId, cursor)
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

	if err := s.ensureEventIsValid(event); err != nil {
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

	event, err = s.Group.GetEventForUser(tx, userId, eventId)
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
func (s *GroupService) ListEvents(groupId, userId, cursor string) ([]types.Event, error) {
	if err := s.ensureGroupExists(groupId); err != nil {
		return nil, err
	}
	if err := s.ensureUserIsMember(groupId, userId); err != nil {
		return nil, err
	}

	if err := ValidateIntegerCursor(cursor); err != nil {
		return nil, err
	}

	return s.Group.ListEvents(groupId, userId, cursor)
}

// RespondToEvent sets or updates the user's Response for an event.
// Response must be GOING or NOT_GOING. Members only.
func (s *GroupService) RespondToEvent(groupId, userId string, er types.EventResponse) error {
	if err := s.ensureGroupExists(groupId); err != nil {
		return err
	}
	if err := s.ensureUserIsMember(groupId, userId); err != nil {
		return err
	}
	if err := s.ensureEventIsInGroup(er.EventId, groupId); err != nil {
		return err
	}
	if err := ValidateEventStatus(er); err != nil {
		return err
	}
	return s.Group.UpsertEventResponse(er.EventId, userId, er.Response)
}

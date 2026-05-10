package services

import (
	"fmt"
	"soc-net/internal/repositories"
	"soc-net/internal/types"
	"strings"
	"time"
)

type GroupService struct {
	Auth  *repositories.AuthRepo
	Group *repositories.GroupRepo
}

func NewGroupService(auth *repositories.AuthRepo, group *repositories.GroupRepo) *GroupService {
	return &GroupService{
		Auth:  auth,
		Group: group,
	}
}

var groupServiceName = "group-service"

// ============================================================
// Guards — shared pre-condition checks
// ============================================================

func (s *GroupService) ensureGroupIsValid(group types.Group) error {
	formErr := types.NewFormError()

	if !(len(group.Title) >= 3 && len(group.Title) <= 100) {
		formErr.Fields["title"] = append(formErr.Fields["title"], "Title must be between 3 and 100 characters.")
	}

	exists, err := s.Group.IsTitleTaken(group.Title)
	if err != nil {
		return err
	}
	if exists {
		formErr.Fields["title"] = append(formErr.Fields["title"], "A group with this title already exists.")
	}

	if !(len(group.Description) >= 10 && len(group.Description) <= 500) {
		formErr.Fields["description"] = append(formErr.Fields["description"], "Description must be between 10 and 500 characters.")
	}

	if formErr.HasErrors() {
		return formErr
	}

	return nil
}

func (s *GroupService) ensureGroupExists(groupId string) error {
	exists, err := s.Group.GroupExists(groupId)
	if err != nil {
		return err
	}
	if !exists {
		return types.NewNotFoundError("Group does not exist.")
	}
	return nil
}

func (s *GroupService) ensureUserExists(userId string) error {
	exists, err := s.Auth.UserExists(userId)
	if err != nil {
		return err
	}
	if !exists {
		return types.NewNotFoundError("User does not exist.")
	}
	return nil
}

func (s *GroupService) ensureUserIsCreator(groupId, userId string) error {
	role, err := s.Group.GetUserGroupRole(groupId, userId)
	if err != nil {
		return err
	}
	if role != "creator" {
		return types.NewForbiddenError("You are not authorized to perform this action")
	}
	return nil
}

func (s *GroupService) ensureUserIsMember(groupId, userId string) error {
	role, err := s.Group.GetUserGroupRole(groupId, userId)
	if err != nil {
		return err
	}
	if role != "member" && role != "creator" {
		return types.NewForbiddenError("You must be a member to perform this action")
	}
	return nil
}

func (s *GroupService) ensureUserIsNotMember(groupId, userId string) error {
	role, err := s.Group.GetUserGroupRole(groupId, userId)
	if err != nil {
		return err
	}
	switch role {
	case "member", "creator":
		return types.NewActionError("already a member of this group")
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

func (s *GroupService) ensureEventIsInGroup(eventId, groupId string) error {
	exists, err := s.Group.EventBelongsToGroup(eventId, groupId)
	if err != nil {
		return err
	}
	if !exists {
		return types.NewNotFoundError("Event Not found")
	}
	return nil
}

// ============================================================
// Groups
// ============================================================

func (s *GroupService) CreateGroup(userId string, group types.Group) (types.Group, error) {
	group.Title = strings.TrimSpace(group.Title)
	group.Description = strings.TrimSpace(group.Description)

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

func (s *GroupService) ListGroups(userId, tab, query, cursor string) ([]types.Group, error) {
	query = strings.ToLower(query)

	if err := ValidateTab(tab); err != nil {
		return nil, err
	}

	if err := ValidateIntegerCursor(cursor); err != nil {
		return nil, err
	}

	return s.Group.ListGroups(userId, tab, query, cursor)
}

func (s *GroupService) GetGroup(groupId, userId string) (types.Group, error) {
	return s.Group.GetGroupForUser(nil, groupId, userId)
}

func (s *GroupService) autoJoinUser(groupId, userId string) error {
	tx, err := s.Group.DB.Begin()
	if err != nil {
		return fmt.Errorf("%s.autoJoinUser: Starting transaction: %w", groupServiceName, err)
	}
	defer tx.Rollback()

	if err := s.Group.InsertGroupMember(tx, groupId, userId, false); err != nil {
		return err
	}
	if err := s.Group.DeleteJoinRequest(tx, groupId, userId); err != nil {
		return err
	}
	if err := s.Group.DeleteInvitation(tx, groupId, userId); err != nil {
		return err
	}

	return tx.Commit()
}

// ============================================================
// Invitations
// ============================================================

func (s *GroupService) GetInvitableUsers(groupId, userId, query, cursor string) ([]types.InvitableUser, error) {

	query = strings.ToLower(query)

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

	return s.Group.GetInvitableUsers(groupId, userId, query, cursor)
}

func (s *GroupService) SendInvitation(groupId, inviterId, userId string) (types.MembershipResult, error) {
	if inviterId == userId {
		return "", types.NewActionError("You cannot invite yourself")
	}

	if err := s.ensureGroupExists(groupId); err != nil {
		return "", err
	}

	if err := s.ensureUserExists(userId); err != nil {
		return "", err
	}

	if err := s.ensureUserIsMember(groupId, inviterId); err != nil {
		return "", err
	}

	if err := s.ensureUserIsNotMember(groupId, userId); err != nil {
		return "", err
	}

	hasRequest, err := s.Group.HasJoinRequest(groupId, userId)
	if err != nil {
		return "", err
	}

	if hasRequest {
		return types.UserJoined, s.autoJoinUser(groupId, userId)
	}

	if err := s.Group.InsertInvitation(groupId, inviterId, userId); err != nil {
		return "", err
	}

	return types.InvitationCreated, nil
}

func (s *GroupService) RevokeInvitation(groupId, revokerId, userId string) error {
	if err := s.ensureGroupExists(groupId); err != nil {
		return err
	}
	if err := s.ensureUserExists(userId); err != nil {
		return err
	}
	if err := s.ensureUserIsMember(groupId, revokerId); err != nil {
		return err
	}

	hasInvitation, err := s.Group.HasInvitation(groupId, userId)
	if err != nil {
		return err
	}
	if !hasInvitation {
		return types.NewNotFoundError("No invitation found")
	}

	return s.Group.DeleteInvitation(nil, groupId, userId)
}

func (s *GroupService) AcceptInvitation(groupId, userId string) error {
	if err := s.ensureGroupExists(groupId); err != nil {
		return err
	}

	hasInvitation, err := s.Group.HasInvitation(groupId, userId)
	if err != nil {
		return err
	}
	if !hasInvitation {
		return types.NewNotFoundError("No invitation found")
	}

	return s.autoJoinUser(groupId, userId)
}

func (s *GroupService) DeclineInvitation(groupId, userId string) error {
	if err := s.ensureGroupExists(groupId); err != nil {
		return err
	}

	hasInvitation, err := s.Group.HasInvitation(groupId, userId)
	if err != nil {
		return err
	}
	if !hasInvitation {
		return types.NewNotFoundError("No invitation found")
	}

	return s.Group.DeleteInvitation(nil, groupId, userId)
}

func (s *GroupService) GetInvitationNotification(groupId, inviterId, userId string) (types.Notification, error) {

	data, err := s.Group.GetInvitationData(groupId, inviterId)
	if err != nil {
		return types.Notification{}, err
	}

	content := fmt.Sprintf("%s invited you to join %s", data.InviterName, data.GroupTitle)

	notif := types.Notification{
		Type:       "group_invitation",
		SenderID:   inviterId,
		ReceiverID: userId,
		EntityID:   groupId,
		Content:    content,
		CreatedAt:  time.Now(),
	}

	return notif, nil
}

// ============================================================
// Join Requests
// ============================================================

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

func (s *GroupService) ApproveJoinRequest(groupId, approverId, userId string) error {

	if err := s.ensureGroupExists(groupId); err != nil {
		return err
	}
	if err := s.ensureUserExists(userId); err != nil {
		return err
	}
	if err := s.ensureUserIsCreator(groupId, approverId); err != nil {
		return err
	}
	if err := s.ensureUserIsNotMember(groupId, userId); err != nil {
		return err
	}

	return s.autoJoinUser(groupId, userId)
}

func (s *GroupService) RejectJoinRequest(groupId, rejecterId, userId string) error {
	if err := s.ensureGroupExists(groupId); err != nil {
		return err
	}
	if err := s.ensureUserExists(userId); err != nil {
		return err
	}
	if err := s.ensureUserIsCreator(groupId, rejecterId); err != nil {
		return err
	}

	return s.Group.DeleteJoinRequest(nil, groupId, userId)
}

func (s *GroupService) SendJoinRequest(groupId, userId string) (types.MembershipResult, error) {
	if err := s.ensureGroupExists(groupId); err != nil {
		return "", err
	}
	if err := s.ensureUserIsNotMember(groupId, userId); err != nil {
		return "", err
	}

	hasInvitation, err := s.Group.HasInvitation(groupId, userId)
	if err != nil {
		return "", err
	}
	if hasInvitation {
		return types.UserJoined, s.autoJoinUser(groupId, userId)
	}

	if err := s.Group.InsertJoinRequest(groupId, userId); err != nil {
		return "", err
	}

	return types.JoinRequestCreated, nil
}

func (s *GroupService) RevokeJoinRequest(groupId, userId string) error {
	if err := s.ensureGroupExists(groupId); err != nil {
		return err
	}

	return s.Group.DeleteJoinRequest(nil, groupId, userId)
}

func (s *GroupService) GetJoinRequestNotification(groupId, userId string) (types.Notification, error) {

	data, err := s.Group.GetJoinRequestData(groupId, userId)
	if err != nil {
		return types.Notification{}, err
	}

	content := fmt.Sprintf("%s requested to join %s", data.RequesterName, data.GroupTitle)

	notif := types.Notification{
		Type:       "group_join_request",
		SenderID:   userId,
		ReceiverID: data.GroupCreatorId,
		EntityID:   groupId,
		Content:    content,
		CreatedAt:  time.Now(),
	}

	return notif, nil
}

// ============================================================
// Events
// ============================================================

func (s *GroupService) CreateEvent(groupId, userId string, event types.Event) (types.Event, error) {
	if err := s.ensureGroupExists(groupId); err != nil {
		return types.Event{}, err
	}

	if err := s.ensureUserIsMember(groupId, userId); err != nil {
		return types.Event{}, err
	}

	event.Title = strings.TrimSpace(event.Title)
	event.Description = strings.TrimSpace(event.Description)
	event.Date = strings.TrimSpace(event.Date)

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

func (s *GroupService) GetEventNotifications(groupId, eventId, creatorId string) ([]types.Notification, error) {
	data, err := s.Group.GetEventNotificationData(eventId, creatorId)
	if err != nil {
		return nil, err
	}

	content := fmt.Sprintf("New event in %s: %s", data.GroupTitle, data.EventTitle)

	notifications := []types.Notification{}
	for _, id := range data.GroupMemberIds {
		notif := types.Notification{
			Type:       "group_event",
			SenderID:   creatorId,
			ReceiverID: id,
			EntityID:   groupId,
			Content:    content,
			CreatedAt:  time.Now(),
		}

		notifications = append(notifications, notif)
	}

	return notifications, nil
}

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
	if err := ValidateEventResponse(er); err != nil {
		return err
	}
	return s.Group.UpsertEventResponse(er.EventId, userId, er.Response)
}

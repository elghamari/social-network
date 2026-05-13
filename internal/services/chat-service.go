package services

import (
	"log"

	"soc-net/internal/repositories"
	"soc-net/internal/types"
)

type ChatService struct {
	Auth  *repositories.AuthRepo
	Chat  *repositories.ChatRepo
	Group *repositories.GroupRepo
}

func NewChatService(auth *repositories.AuthRepo, chat *repositories.ChatRepo, group *repositories.GroupRepo) *ChatService {
	return &ChatService{
		Chat:  chat,
		Group: group,
		Auth:  auth,
	}
}

func (s *ChatService) ProcessPrivateMessage(senderId string, input types.IncomingMessage) (types.Message, error) {
	if senderId == "" || input.ReceiverID == "" {
		return types.Message{}, types.NewActionError("sender and receiver IDs are required")
	}

	if err := ValidateIncomingMessage(&input); err != nil {
		return types.Message{}, err
	}

	if senderId == input.ReceiverID {
		return types.Message{}, types.NewActionError("you cannot send a message to yourself")
	}

	userExists, err := s.Auth.UserExists(input.ReceiverID)
	if err != nil {
		return types.Message{}, err
	}
	if !userExists {
		return types.Message{}, types.NewNotFoundError("the specified user does not exist")
	}

	isConnected, err := s.Chat.AreConnected(senderId, input.ReceiverID)
	if err != nil {
		return types.Message{}, err 
	}
	if !isConnected {
		return types.Message{}, types.NewForbiddenError("you do not have permission to message this user")
	}

	tx, err := s.Chat.DB.Begin()
	if err != nil {
		return types.Message{}, err 
	}
	defer tx.Rollback()

	msgId, err := s.Chat.InsertPrivateMessage(tx, senderId, input.ReceiverID, input.Content)
	if err != nil {
		return types.Message{}, err 
	}

	savedMsg, err := s.Chat.FetchPrivateMessageByID(tx, msgId)
	if err != nil {
		return types.Message{}, err
	}

	if err := tx.Commit(); err != nil {
		return types.Message{}, err 
	}

	return savedMsg, nil
}

func (s *ChatService) ProcessGroupMessage(senderId string, groupId int, input types.IncomingMessage) (types.Message, []string, error) {
	if senderId == "" || groupId <= 0 {
		return types.Message{}, nil, types.NewActionError("valid senderId and groupId are required")
	}

	if err := ValidateIncomingMessage(&input); err != nil {
		return types.Message{}, nil, err
	}

	groupExists, isMember, err := s.Group.CheckGroupAndMembership(groupId, senderId)
	if err != nil {
		return types.Message{}, nil, err 
	}
	if !groupExists {
		return types.Message{}, nil, types.NewNotFoundError("the specified group does not exist")
	}
	if !isMember {
		return types.Message{}, nil, types.NewForbiddenError("you are not a member of this group")
	}

	members, err := s.Chat.GetGroupMemberIDs(groupId)
	if err != nil {
		return types.Message{}, nil, err 
	}

	tx, err := s.Chat.DB.Begin()
	if err != nil {
		return types.Message{}, nil, err 
	}
	defer tx.Rollback()

	msgId, err := s.Chat.InsertGroupMessage(tx, groupId, senderId, input.Content)
	if err != nil {
		return types.Message{}, nil, err 
	}

	savedMsg, err := s.Chat.FetchGroupMessageByID(tx, msgId)
	if err != nil {
		return types.Message{}, nil, err 
	}

	if err := tx.Commit(); err != nil {
		return types.Message{}, nil, err 
	}

	return savedMsg, members, nil
}

func (s *ChatService) CanReceiveLive(receiverID, senderID string) (bool, error) {
	if receiverID == "" || senderID == "" {
		return false, types.NewActionError("receiverID and senderID are required")
	}

	isPublic, err := s.Chat.CheckUserPrivacy(receiverID)
	if err != nil {
		return false, err 
	}
	if isPublic {
		return true, nil
	}

	isFollowing, err := s.Chat.IsFollowing(receiverID, senderID)
	if err != nil {
		return false, err 
	}
	
	return isFollowing, nil
}

func (s *ChatService) GetRecentContacts(userId string) ([]types.Contact, error) {
	if userId == "" {
		return nil, types.NewActionError("userId is required")
	}
	return s.Chat.GetRecentContacts(userId)
}

func (s *ChatService) GetAvailableChatUsers(userId string) ([]types.Contact, error) {
	if userId == "" {
		return nil, types.NewActionError("userId is required")
	}

	return s.Chat.GetAvailableChatUsers(userId)
}

func (s *ChatService) GetPrivateHistory(currentUserId string, targetUserId string, cursor int64) ([]types.Message, error) {
	if currentUserId == "" || targetUserId == "" {
		return nil, types.NewActionError("user IDs are required")
	}
	if cursor < 0 {
		return nil, types.NewActionError("invalid cursor: must be zero or positive")
	}

	userExists, err := s.Auth.UserExists(targetUserId)
	if err != nil {
		return nil, err 
	}
	if !userExists {
		return nil, types.NewNotFoundError("the specified user does not exist")
	}

	return s.Chat.GetPrivateHistory(currentUserId, targetUserId, cursor)
}

func (s *ChatService) GetGroupHistory(groupId int, currentUserId string, cursor int64) (map[string]any, error) {
	if currentUserId == "" || groupId <= 0 {
		return nil, types.NewActionError("valid currentUserId and groupId are required")
	}
	if cursor < 0 {
		return nil, types.NewActionError("invalid cursor: must be zero or positive")
	}

	groupExists, isMember, err := s.Group.CheckGroupAndMembership(groupId, currentUserId)
	if err != nil {
		return nil, err 
	}
	if !groupExists {
		return nil, types.NewNotFoundError("the specified group does not exist")
	}
	if !isMember {
		return nil, types.NewForbiddenError("you are not a member of this group")
	}

	messages, err := s.Chat.GetGroupHistory(groupId, cursor)
	if err != nil {
		return nil, err
	}

	lastReadId, err := s.Chat.GetGroupLastRead(groupId, currentUserId)
	if err != nil {
		log.Println("Error getting last read:", err)
		lastReadId = 0
	}

	return map[string]any{
		"messages":     messages,
		"last_read_id": lastReadId,
	}, nil
}

func (s *ChatService) MarkMessagesAsRead(currentUserId string, senderId string) error {
	if currentUserId == "" || senderId == "" {
		return types.NewActionError("user IDs are required")
	}
	if currentUserId == senderId {
		return types.NewActionError("you cannot mark your own messages as read")
	}

	return s.Chat.MarkPrivateAsRead(senderId, currentUserId)
}

func (s *ChatService) MarkGroupAsRead(groupId int, userId string, lastMessageId int64) error {
	if userId == "" || groupId <= 0 {
		return types.NewActionError("valid userId and groupId are required")
	}

	groupExists, isMember, err := s.Group.CheckGroupAndMembership(groupId, userId)
	if err != nil {
		return err 
	}
	if !groupExists {
		return types.NewNotFoundError("the specified group does not exist")
	}
	if !isMember {
		return types.NewForbiddenError("you are not a member of this group")
	}

	return s.Chat.UpdateGroupLastRead(groupId, userId, lastMessageId)
}
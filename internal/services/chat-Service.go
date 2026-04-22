package services

import (
	"errors"
	"fmt"
	"log"

	"soc-net/internal/repositories"
	"soc-net/internal/types"
)

type ChatService struct {
	Chat   *repositories.ChatRepo
	Groups *repositories.GroupsRepo
}

func NewChatService(chat *repositories.ChatRepo, groups *repositories.GroupsRepo) *ChatService {
	return &ChatService{
		Chat:   chat,
		Groups: groups,
	}
}

func (s *ChatService) ProcessPrivateMessage(senderId string, input types.IncomingMessage) (types.Message, error) {
	if err := ValidateIncomingMessage(&input); err != nil {
		return types.Message{}, err
	}

	if senderId == input.ReceiverID {
		return types.Message{}, ErrSelfChat
	}

	userExists, err := s.Groups.UserExists(input.ReceiverID)
	if err != nil {
		return types.Message{}, fmt.Errorf("ChatService.ProcessPrivateMessage (Check User): %w", err)
	}
	if !userExists {
		return types.Message{}, ErrUserNotFound
	}

	isConnected, err := s.Chat.AreConnected(senderId, input.ReceiverID)
	if err != nil {
		return types.Message{}, fmt.Errorf("ChatService.ProcessPrivateMessage (AreConnected): %w", err)
	}
	if !isConnected {
		return types.Message{}, ErrChatPermissionDenied
	}

	tx, err := s.Chat.DB.Begin()
	if err != nil {
		return types.Message{}, fmt.Errorf("ChatService.ProcessPrivateMessage (Begin Tx): %w", err)
	}
	defer tx.Rollback()

	msgId, err := s.Chat.InsertPrivateMessage(tx, senderId, input.ReceiverID, input.Content)
	if err != nil {
		return types.Message{}, fmt.Errorf("ChatService.ProcessPrivateMessage (Insert): %w", err)
	}

	savedMsg, err := s.Chat.FetchPrivateMessageByID(tx, msgId)
	if err != nil {
		return types.Message{}, fmt.Errorf("ChatService.ProcessPrivateMessage (Fetch): %w", err)
	}

	if err := tx.Commit(); err != nil {
		return types.Message{}, fmt.Errorf("ChatService.ProcessPrivateMessage (Commit Tx): %w", err)
	}

	return savedMsg, nil
}

func (s *ChatService) ProcessGroupMessage(senderId string, groupId int, input types.IncomingMessage) (types.Message, []string, error) {
	if err := ValidateIncomingMessage(&input); err != nil {
		return types.Message{}, nil, err
	}

	groupExists, isMember, err := s.Groups.CheckGroupAndMembership(groupId, senderId)
	if err != nil {
		return types.Message{}, nil, fmt.Errorf("ChatService.ProcessGroupMessage (Check Group/Member): %w", err)
	}
	if !groupExists {
		return types.Message{}, nil, ErrGroupNotFound
	}
	if !isMember {
		return types.Message{}, nil, ErrNotGroupMember
	}

	members, err := s.Chat.GetGroupMemberIDs(groupId)
	if err != nil {
		return types.Message{}, nil, fmt.Errorf("ChatService.ProcessGroupMessage (Get Members): %w", err)
	}

	tx, err := s.Chat.DB.Begin()
	if err != nil {
		return types.Message{}, nil, fmt.Errorf("ChatService.ProcessGroupMessage (Begin Tx): %w", err)
	}
	defer tx.Rollback()

	msgId, err := s.Chat.InsertGroupMessage(tx, groupId, senderId, input.Content)
	if err != nil {
		return types.Message{}, nil, fmt.Errorf("ChatService.ProcessGroupMessage (Insert): %w", err)
	}

	savedMsg, err := s.Chat.FetchGroupMessageByID(tx, msgId)
	if err != nil {
		return types.Message{}, nil, fmt.Errorf("ChatService.ProcessGroupMessage (Fetch Msg): %w", err)
	}

	if err := tx.Commit(); err != nil {
		return types.Message{}, nil, fmt.Errorf("ChatService.ProcessGroupMessage (Commit Tx): %w", err)
	}

	return savedMsg, members, nil
}

func (s *ChatService) CanReceiveLive(receiverID, senderID string) (bool, error) {
	isPublic, err := s.Chat.CheckUserPrivacy(receiverID)
	if err != nil {
		return false, fmt.Errorf("ChatService.CanReceiveLive (Privacy Check): %w", err)
	}
	if isPublic {
		return true, nil
	}

	isFollowing, err := s.Chat.IsFollowing(receiverID, senderID)
	if err != nil {
		return false, fmt.Errorf("ChatService.CanReceiveLive (Following Check): %w", err)
	}
	return isFollowing, nil
}

func (s *ChatService) GetRecentContacts(userId string) ([]types.Contact, error) {
	return s.Chat.GetRecentContacts(userId)
}

func (s *ChatService) GetAvailableChatUsers(userId string) ([]types.Contact, error) {
	return s.Chat.GetAvailableChatUsers(userId)
}

func (s *ChatService) GetPrivateHistory(currentUserId string, targetUserId string, cursor int64) ([]types.Message, error) {
	if cursor < 0 {
		return nil, fmt.Errorf("invalid cursor: must be zero or positive")
	}

	userExists, err := s.Groups.UserExists(targetUserId)
	if err != nil {
		return nil, fmt.Errorf("ChatService.GetPrivateHistory (Check User): %w", err)
	}
	if !userExists {
		return nil, ErrUserNotFound
	}

	isConnected, err := s.Chat.AreConnected(currentUserId, targetUserId)
	if err != nil {
		return nil, fmt.Errorf("ChatService.GetPrivateHistory (AreConnected): %w", err)
	}
	if !isConnected {
		return nil, ErrChatPermissionDenied
	}

	return s.Chat.GetPrivateHistory(currentUserId, targetUserId, cursor)
}

func (s *ChatService) GetGroupHistory(groupId int, currentUserId string, cursor int64) (map[string]any, error) {
	if cursor < 0 {
		return nil, fmt.Errorf("invalid cursor: must be zero or positive")
	}

	groupExists, isMember, err := s.Groups.CheckGroupAndMembership(groupId, currentUserId)
	if err != nil {
		return nil, fmt.Errorf("ChatService.GetGroupHistory (Check Group/Member): %w", err)
	}
	if !groupExists {
		return nil, ErrGroupNotFound
	}
	if !isMember {
		return nil, ErrNotGroupMember
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
	return s.Chat.MarkPrivateAsRead(senderId, currentUserId)
}


func (s *ChatService) MarkGroupAsRead(groupId int, userId string, lastMessageId int64) error {
	groupExists, isMember, err := s.Groups.CheckGroupAndMembership(groupId, userId)
	if err != nil {
		return fmt.Errorf("ChatService.MarkGroupAsRead (Check): %w", err)
	}
	if !groupExists {
		return ErrGroupNotFound
	}
	if !isMember {
		return errors.New("unauthorized: not a member of this group")
	}

	return s.Chat.UpdateGroupLastRead(groupId, userId, lastMessageId)
}
package services

import (
    "soc-net/internal/repositories"
    "soc-net/internal/types"
)

type NotificationService struct {
    Repo *repositories.NotificationRepo
}

func NewNotificationService(repo *repositories.NotificationRepo) *NotificationService {
    return &NotificationService{Repo: repo}
}

func (s *NotificationService) CreateNotification(notif types.Notification) (types.Notification, error) {
    if notif.ReceiverID == "" || notif.SenderID == "" || notif.Type == "" {
        return types.Notification{}, types.NewActionError("missing required fields for notification")
    }

    if notif.SenderID == notif.ReceiverID {
        return types.Notification{}, nil
    }

    return s.Repo.CreateNotification(notif)
}

func (s *NotificationService) GetUserNotifications(userID string) ([]types.Notification, error) {
    if userID == "" {
        return nil, types.NewActionError("userID is required")
    }
    return s.Repo.GetUserNotifications(userID)
}

func (s *NotificationService) MarkAsRead(notifID int, userID string) error {
    if userID == "" || notifID <= 0 {
        return types.NewActionError("valid userID and notification ID are required")
    }
    return s.Repo.MarkAsRead(notifID, userID)
}

func (s *NotificationService) DeleteNotification(receiverID string, senderID string, notifType string) error {
    if receiverID == "" || senderID == "" || notifType == "" {
        return types.NewActionError("missing parameters for deleting notification")
    }
    return s.Repo.DeleteNotification(receiverID, senderID, notifType)
}
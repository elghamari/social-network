package services

import (
	"soc-net/internal/repositories"
	"soc-net/internal/types"
)

type FollowService struct {
	Follow *repositories.FollowRepo
	Auth   *repositories.AuthRepo
}

func NewFollowService(follow *repositories.FollowRepo, auth *repositories.AuthRepo) *FollowService {
	return &FollowService{Follow: follow, Auth: auth}
}

func (s *FollowService) GetFollowers(userID string) ([]types.FollowerInfo, error) {
	return s.Follow.GetFollowers(userID)
}

func (s *FollowService) GetFollowing(userID string) ([]types.FollowerInfo, error) {
	return s.Follow.GetFollowing(userID)
}

func (s *FollowService) GetPendingRequests(userID string) ([]types.FollowerInfo, error) {
	return s.Follow.GetPendingRequests(userID)
}

func (s *FollowService) GetFollowStatus(viewerID, targetID string) (string, error) {
	return s.Follow.GetFollowStatus(viewerID, targetID)
}

func (s *FollowService) FollowUser(senderID, targetID string) (string, error) {
	status, err := s.Follow.GetFollowStatus(senderID, targetID)
	if err != nil {
		return "", err
	}
	if status != "none" {
		return status, nil
	}

	isPublic, err := s.Auth.IsUserPublic(targetID)
	if err != nil {
		return "", err
	}

	if isPublic {
		if err := s.Follow.FollowUserDirectly(senderID, targetID); err != nil {
			return "", err
		}
		return "following", nil
	}

	if err := s.Follow.SendFollowRequest(senderID, targetID); err != nil {
		return "", err
	}
	return "pending", nil
}

func (s *FollowService) AcceptFollowRequest(senderID, receiverID string) error {
	return s.Follow.AcceptFollowRequest(senderID, receiverID)
}

func (s *FollowService) DeclineFollowRequest(senderID, receiverID string) error {
	return s.Follow.DeclineFollowRequest(senderID, receiverID)
}

func (s *FollowService) UnfollowUser(followerID, followingID string) error {
	return s.Follow.UnfollowUser(followerID, followingID)
}

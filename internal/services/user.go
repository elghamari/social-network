package services

import (
	"soc-net/internal/repositories"
	"soc-net/internal/types"
)

type UserService struct {
	Follow *repositories.UserRepo
	Auth   *repositories.AuthRepo
}

func NewUserService(follow *repositories.UserRepo, auth *repositories.AuthRepo) *UserService {
	return &UserService{Follow: follow, Auth: auth}
}

func (s *UserService) GetFollowers(userID string) ([]types.FollowerInfo, error) {
	return s.Follow.GetFollowers(userID)
}

func (s *UserService) GetFollowing(userID string) ([]types.FollowerInfo, error) {
	return s.Follow.GetFollowing(userID)
}

func (s *UserService) GetPendingRequests(userID string) ([]types.FollowerInfo, error) {
	return s.Follow.GetPendingRequests(userID)
}

func (s *UserService) GetFollowStatus(viewerID, targetID string) (string, error) {
	return s.Follow.GetFollowStatus(viewerID, targetID)
}

func (s *UserService) FollowUser(senderID, targetID string) (string, error) {
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

func (s *UserService) AcceptFollowRequest(senderID, receiverID string) error {
	return s.Follow.AcceptFollowRequest(senderID, receiverID)
}

func (s *UserService) DeclineFollowRequest(senderID, receiverID string) error {
	return s.Follow.DeclineFollowRequest(senderID, receiverID)
}

func (s *UserService) UnfollowUser(followerID, followingID string) error {
	return s.Follow.UnfollowUser(followerID, followingID)
}

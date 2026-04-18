package services

import (
	"socialnetwork/modle"
	"socialnetwork/repositorie"
)

type FollowService struct {
	FollowRepo *repositorie.FollowRepo
	AuthRepo   *repositorie.Auth
}

func NewFolloweService(f *repositorie.FollowRepo) *FollowService {
	return &FollowService{FollowRepo: f}
}

func (f *FollowService) GetUserById(userid string) (modle.User, error) {
	return f.AuthRepo.GetUserById(userid)
}

func (f *FollowService) GetFollowers(userID string) ([]modle.FollowerInfo, error) {
	return f.FollowRepo.GetFollowers(userID)
}

func (f *FollowService) GetFollowing(userID string) ([]modle.FollowerInfo, error) {
	return f.FollowRepo.GetFollowing(userID)
}

func (f *FollowService) GetPendingRequests(userID string) ([]modle.FollowerInfo, error) {
	return f.FollowRepo.GetPendingRequests(userID)
}

func (f *FollowService) SendFollowRequest(senderID, receiverID string) error {
	return f.FollowRepo.SendFollowRequest(senderID, receiverID)
}

func (f *FollowService) FollowUserDirectly(senderID, receiverID string) error {
	return f.FollowRepo.FollowUserDirectly(senderID, receiverID)
}

func (f *FollowService) AcceptFollowRequest(senderID, receiverID string) error {
	return f.FollowRepo.AcceptFollowRequest(senderID, receiverID)
}

func (f *FollowService) DeclineFollowRequest(senderID, receiverID string) error {
	return f.FollowRepo.DeclineFollowRequest(senderID, receiverID)
}

func (f *FollowService) UnfollowUser(senderID, receiverID string) error {
	return f.FollowRepo.UnfollowUser(senderID, receiverID)
}

func (f *FollowService) GetFollowStatus(viewerID, targetID string) (string, error) {
	return f.FollowRepo.GetFollowStatus(viewerID, targetID)
}

func (f *FollowService) IsUserPublic(targetID string) (bool, error) {
	return f.AuthRepo.IsUserPublic(targetID)
}

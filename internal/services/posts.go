package services

import (
	"errors"
	"fmt"

	"soc-net/internal/repositories"
	"soc-net/internal/types"
)

type PostsService struct {
	Posts *repositories.PostsRepo
	Group *repositories.GroupRepo
	Auth  *repositories.AuthRepo
}

func NewPostsService(posts *repositories.PostsRepo, groups *repositories.GroupRepo) *PostsService {
	return &PostsService{
		Posts: posts,
		Group: groups,
	}
}

func (s *PostsService) CreatePost(input types.PostInput) (int64, error) {
	if err := ValidatePostInput(&input); err != nil {
		return 0, err
	}

	if input.GroupId != nil {
		groupExists, isMember, err := s.Group.CheckGroupAndMembership(*input.GroupId, input.UserId)
		if err != nil {
			return 0, fmt.Errorf("PostsService.CreatePost (Check Group/Member): %w", err)
		}

		if !groupExists {
			return 0, ErrGroupNotFound
		}

		if !isMember {
			return 0, ErrNotGroupMember
		}

		input.Privacy = "public"
	}

	if input.Privacy == "private" {
		allExist, err := s.Auth.CheckAllUsersExist(input.PrivateUsers)
		if err != nil {
			return 0, fmt.Errorf("PostsService.CreatePost (Check All Users): %w", err)
		}
		if !allExist {
			return 0, ErrInvalidPrivateUsers
		}
	}

	return s.Posts.InsertPost(input)
}

func (s *PostsService) GetProfilePosts(currentUserId string, targetUserId string, cursor int) ([]types.PostResponse, error) {
	if cursor < 0 {
		return nil, errors.New("invalid cursor: must be zero or positive")
	}

	// TODO: Move this UserExists function to UsersRepo.
	userExists, err := s.Auth.UserExists(targetUserId)
	if err != nil {
		return nil, fmt.Errorf("PostsService.GetProfilePosts (Check User): %w", err)
	}

	if !userExists {
		return nil, ErrUserNotFound
	}

	return s.Posts.GetProfilePosts(targetUserId, currentUserId, cursor)
}

func (s *PostsService) GetGroupPosts(groupId int, currentUserId string, cursor int) ([]types.PostResponse, error) {
	if cursor < 0 {
		return nil, errors.New("invalid cursor: must be zero or positive")
	}

	groupExists, isMember, err := s.Group.CheckGroupAndMembership(groupId, currentUserId)
	if err != nil {
		return nil, fmt.Errorf("PostsService.GetGroupPosts (Check Group/Member): %w", err)
	}

	if !groupExists {
		return nil, ErrGroupNotFound
	}

	if !isMember {
		return nil, ErrNotGroupMember
	}

	return s.Posts.GetGroupPosts(groupId, currentUserId, cursor)
}

func (s *PostsService) GetFeedPosts(currentUserId string, cursor int) ([]types.PostResponse, error) {
	if cursor < 0 {
		return nil, errors.New("invalid cursor: must be zero or positive")
	}

	return s.Posts.GetFeedPosts(currentUserId, cursor)
}

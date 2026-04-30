package services

import (
	"errors"
	"strconv"

	"soc-net/internal/repositories"
	"soc-net/internal/types"
)

type PostService struct {
	Post  *repositories.PostRepo
	Group *repositories.GroupRepo
}

func NewPostService(posts *repositories.PostRepo, groups *repositories.GroupRepo) *PostService {
	return &PostService{
		Post:  posts,
		Group: groups,
	}
}

func (s *PostService) CreatePost(input types.PostInput) (int64, error) {
	if err := ValidatePostInput(&input); err != nil {
		return 0, err
	}

	if input.GroupId != nil {

		groupId := strconv.Itoa(*input.GroupId)

		groupExists, err := s.Group.GroupExists(groupId)
		if err != nil {
			return 0, err
		}
		if !groupExists {
			return 0, ErrGroupNotFound
		}

		userRole, err := s.Group.GetUserGroupRole(groupId, input.UserId)
		if err != nil {
			return 0, err
		}

		if userRole != "MEMBER" && userRole != "CREATOR" {
			return 0, ErrNotGroupMember
		}

		input.Privacy = "public"
	}

	// if input.Privacy == "private" {
	// 	allExist, err := s.Group.CheckAllUsersExist(input.PrivateUsers)
	// 	if err != nil {
	// 		return 0, fmt.Errorf("PostService.CreatePost (Check All Users): %w", err)
	// 	}
	// 	if !allExist {
	// 		return 0, ErrInvalidPrivateUsers
	// 	}
	// }

	return s.Post.InsertPost(input)
}

func (s *PostService) GetGroupPosts(groupId int, currentUserId string, cursor int) ([]types.PostResponse, error) {
	if cursor < 0 {
		return nil, errors.New("invalid cursor: must be zero or positive")
	}

	gid := strconv.Itoa(groupId)

	groupExists, err := s.Group.GroupExists(gid)
	if err != nil {
		return nil, err
	}
	if !groupExists {
		return nil, ErrGroupNotFound
	}

	userRole, err := s.Group.GetUserGroupRole(gid, currentUserId)
	if err != nil {
		return nil, err
	}

	if userRole != "MEMBER" && userRole != "CREATOR" {
		return nil, ErrNotGroupMember
	}

	return s.Post.GetGroupPosts(groupId, currentUserId, cursor)
}

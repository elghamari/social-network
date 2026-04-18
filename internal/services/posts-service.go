package services

import (
	"errors"
	"fmt"

	"soc-net/internal/repositories"
	"soc-net/internal/types"
)

var (
	ErrGroupNotFound  = errors.New("the specified group does not exist")
	ErrNotGroupMember = errors.New("you are not a member of this group")
)

type PostsService struct {
	Posts  *repositories.PostsRepo
	Groups *repositories.GroupsRepo
}

func NewPostsService(posts *repositories.PostsRepo, groups *repositories.GroupsRepo) *PostsService {
	return &PostsService{
		Posts:  posts,
		Groups: groups,
	}
}

func (s *PostsService) CreatePost(currentUserId string, input types.PostInput) (int64, error) {
	input.UserId = currentUserId

	if err := ValidatePostInput(input); err != nil {
		return 0, err
	}

	if input.GroupId != nil {
		groupExists, isMember, err := s.Groups.CheckGroupAndMembership(*input.GroupId, currentUserId)
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

	return s.Posts.InsertPost(input)
}

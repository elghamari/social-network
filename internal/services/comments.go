package services

import (
	"errors"
	"fmt"

	"soc-net/internal/repositories"
	"soc-net/internal/types"
)

type CommentsService struct {
	Comments *repositories.CommentsRepo
	Posts    *repositories.PostsRepo
}

func NewCommentsService(comments *repositories.CommentsRepo, posts *repositories.PostsRepo) *CommentsService {
	return &CommentsService{
		Comments: comments,
		Posts:    posts,
	}
}

func (s *CommentsService) CreateComment(currentUserId string, input types.CommentInput) (int64, error) {
	input.UserId = currentUserId

	if err := ValidateCommentInput(&input); err != nil {
		return 0, err
	}

	postExists, canInteract, err := s.Posts.CanUserInteractWithPost(input.PostId, currentUserId)
	if err != nil {
		return 0, fmt.Errorf("CommentsService.CreateComment (Check Access): %w", err)
	}

	if !postExists {
		return 0, types.NewNotFoundError("the specified post does not exist")
	}

	if !canInteract {
		return 0, types.NewForbiddenError("you do not have permission to interact with this post.")
	}

	return s.Comments.InsertComment(input)
}

func (s *CommentsService) GetPostComments(currentUserId string, postId int, cursor int) ([]types.CommentResponse, error) {
	if cursor < 0 {
		return nil, errors.New("invalid cursor: must be zero or positive")
	}

	postExists, canInteract, err := s.Posts.CanUserInteractWithPost(postId, currentUserId)
	if err != nil {
		return nil, fmt.Errorf("CommentsService.GetPostComments (Check Access): %w", err)
	}

	if !postExists {
		return nil, types.NewNotFoundError("the specified user does not exist.")
	}

	if !canInteract {
		return nil, types.NewForbiddenError("you do not have permission to interact with this post.")
	}

	return s.Comments.GetPostComments(postId, cursor)
}

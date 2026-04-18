package services

import (
	"errors"
	"fmt"

	"soc-net/internal/repositories"
	"soc-net/internal/types"
)

var (
	ErrPostNotFound       = errors.New("the specified post does not exist")
	ErrUnauthorizedAccess = errors.New("you do not have permission to interact with this post")
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

	if err := ValidateCommentInput(input); err != nil {
		return 0, err
	}

	postExists, canInteract, err := s.Posts.CanUserInteractWithPost(input.PostId, currentUserId)
	if err != nil {
		return 0, fmt.Errorf("CommentsService.CreateComment (Check Access): %w", err)
	}

	if !postExists {
		return 0, ErrPostNotFound
	}

	if !canInteract {
		return 0, ErrUnauthorizedAccess
	}

	return s.Comments.InsertComment(input)
}

package services

import (
	"fmt"

	"soc-net/internal/repositories"
	"soc-net/internal/types"
)

type ReactionsService struct {
	Reactions *repositories.ReactionsRepo
	Posts     *repositories.PostsRepo
}

func NewReactionsService(reactions *repositories.ReactionsRepo, posts *repositories.PostsRepo) *ReactionsService {
	return &ReactionsService{
		Reactions: reactions,
		Posts:     posts,
	}
}

func (s *ReactionsService) UpdateReaction(currentUserId string, postId int) (bool, int, error) {
	postExists, canInteract, err := s.Posts.CanUserInteractWithPost(postId, currentUserId)
	if err != nil {
		return false, 0, fmt.Errorf("ReactionsService.UpdateReaction (Check Access): %w", err)
	}

	if !postExists {
		return false, 0, types.NewNotFoundError("the specified post does not exist.")
	}

	if !canInteract {
		return false, 0, types.NewForbiddenError("you do not have permission to interact with this post.")
	}

	return s.Reactions.ToggleReaction(currentUserId, postId)
}

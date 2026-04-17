package services

import (
	"soc-net/internal/repositories"
)

type PostsService struct {
	Auth  *repositories.AuthRepo
	Posts *repositories.PostsRepo
}

func NewPostsService(auth *repositories.AuthRepo, posts *repositories.PostsRepo) *PostsService {
	return &PostsService{
		Auth:  auth,
		Posts: posts,
	}
}


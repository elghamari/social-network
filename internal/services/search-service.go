package services

import (
	"soc-net/internal/repositories"
	"soc-net/internal/types"
)

type SearchServs struct {
	srchrepo *repositories.SearchRepo
}

func NewSearchServs(search *repositories.SearchRepo) *SearchServs {
	return &SearchServs{srchrepo: search}
}

func (s *SearchServs) SearchUsers(query string) ([]types.FollowerInfo, error) {
	return s.srchrepo.SearchUsers(query)
}

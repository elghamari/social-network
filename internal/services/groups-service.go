package services

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"soc-net/internal/repositories"
	"soc-net/internal/types"

	"github.com/google/uuid"
)

type GroupsService struct {
	Auth   *repositories.AuthRepo
	Groups *repositories.GroupsRepo
}

func NewGroupsService(auth *repositories.AuthRepo, grps *repositories.GroupsRepo) *GroupsService {
	return &GroupsService{
		Auth:   auth,
		Groups: grps,
	}
}

var srvs string = "groups-service"

// ===== Group Services
func (s *GroupsService) SaveCoverImage(formErr *types.FormError, image io.Reader, name string) (string, error) {

	ext := filepath.Ext(name)
	switch ext {
	case ".png", ".jpg", ".jpeg", ".webp":

	default:
		if ext != "" {
			formErr.Fields["coverImage"] = "Invalid image type"
		}
		return "", nil
	}

	id := uuid.New().String()
	destPath := "/uploads/" + id + ext
	fullPath := "./data" + destPath

	dest, err := os.Create(fullPath)
	if err != nil {
		os.Remove(fullPath)
		return "", fmt.Errorf("%s.CreateCoverImage: Create  %w", srvs, err)
	}

	written, err := io.Copy(dest, image)
	dest.Close()
	if err != nil {
		os.Remove(fullPath)
		return "", fmt.Errorf("%s.CreateCoverImage Copy: %w", srvs, err)
	}

	if written == 0 {
		os.Remove(fullPath)
		return "", nil
	}

	maxSize := int64(2 << 20)
	if written > maxSize {
		os.Remove(fullPath)
		formErr.Fields["coverImage"] = "Image size must not exceed 2MB"
		return "", nil
	}

	return destPath, nil
}

func (s *GroupsService) CreateGroup(input types.GroupInput) error {

	formErr := ValidateGroupInput(input)

	return types.FormError{}

	destPath, err := s.SaveCoverImage(formErr, input.CoverImage, input.CoverImageName)
	if err != nil {
		return err
	}

	if formErr.HasErrors() {
		fmt.Println(formErr.Fields)
		return formErr
	}

	err = s.Groups.CreateGroup(input, destPath)
	if err != nil {
		return err
	}

	return nil
}

func (s *GroupsService) ListGroups(userId, tab, search string) ([]types.Group, error) {
	actionErr := ValidateTab(tab)
	if actionErr.HasErrors() {
		return nil, actionErr
	}

	groups, err := s.Groups.ListGroups(userId, tab, search)
	if err != nil {
		return nil, err
	}

	return groups, err
}

func (s *GroupsService) GetGroup(userId, groupId string) (types.Group, error) {
	exists, err := s.Groups.ValidGroupId(groupId)
	if err != nil {
		return types.Group{}, err
	}

	if !exists {
		actionErr := types.NewActionError()
		actionErr.Message = "Group does not exist."
		return types.Group{}, actionErr
	}

	return s.Groups.GetGroup(userId, groupId)
}

// ===== JoinRequest Handlers
func (s *GroupsService) RequestToJoinGroup(req types.JoinRequest) error {
	exists, err := s.Groups.ValidGroupId(req.GroupId)
	if err != nil {
		return err
	}

	if !exists {
		actionErr := types.NewActionError()
		actionErr.Message = "Group does not exist."
		return actionErr
	}

	return s.Groups.CreateJoinRequest(req)
}

func (s *GroupsService) CancelToJoinGroup(req types.JoinRequest) error {
	exists, err := s.Groups.ValidGroupId(req.GroupId)
	if err != nil {
		return err
	}

	if !exists {
		actionErr := types.NewActionError()
		actionErr.Message = "Group does not exist."
		return actionErr
	}

	return s.Groups.DeleteJoinRequest(req)
}

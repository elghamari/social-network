package repositories

import (
	"database/sql"
	"fmt"

	"soc-net/internal/types"
)

type PostRepo struct {
	DB *sql.DB
}

func NewPostRepo(db *sql.DB) *PostRepo {
	return &PostRepo{DB: db}
}

func (r *PostRepo) InsertPost(input types.PostInput) (int64, error) {
	tx, err := r.DB.Begin()
	if err != nil {
		return 0, fmt.Errorf("PostRepo.InsertPost (Begin): %w", err)
	}
	defer tx.Rollback()

	queryInsert := `
    INSERT INTO posts (user_id, group_id, title, description, privacy, image_url)
    VALUES (?, ?, ?, ?, ?, ?)`

	result, err := tx.Exec(queryInsert, input.UserId, input.GroupId, input.Title, input.Description, input.Privacy, input.ImageUrl)
	if err != nil {
		return 0, fmt.Errorf("PostRepo.InsertPost (Exec): %w", err)
	}

	lastPostId, err := result.LastInsertId()
	if err != nil {
		return 0, fmt.Errorf("PostRepo.InsertPost (LastInsertId): %w", err)
	}

	if input.Privacy == "private" && len(input.PrivateUsers) > 0 {
		stmt, err := tx.Prepare("INSERT INTO post_private (post_id, user_id) VALUES (?, ?)")
		if err != nil {
			return 0, fmt.Errorf("PostRepo.InsertPost (Prepare Private): %w", err)
		}
		defer stmt.Close()

		for _, pUserId := range input.PrivateUsers {
			_, err = stmt.Exec(lastPostId, pUserId)
			if err != nil {
				return 0, fmt.Errorf("PostRepo.InsertPost (Exec Private): %w", err)
			}
		}
	}

	if err = tx.Commit(); err != nil {
		return 0, fmt.Errorf("PostRepo.InsertPost (Commit): %w", err)
	}

	return lastPostId, nil
}

var selectClause = `
        SELECT 
            p.id, p.user_id, u.nickname, u.first_name, u.last_name, u.avatar,
			p.group_id, p.title, p.description, p.privacy, p.image_url, p.created_at,
            EXISTS(SELECT 1 FROM reactions WHERE post_id = p.id AND user_id = ?),
            (SELECT COUNT(*) FROM reactions WHERE post_id = p.id),
            (SELECT COUNT(*) FROM comments WHERE post_id = p.id)
        FROM posts as p
        INNER JOIN users as u ON p.user_id = u.id
    `

func (r *PostRepo) GetGroupPosts(groupId int, currentUserId string, cursor int) ([]types.PostResponse, error) {
	posts := []types.PostResponse{}

	var query string
	var args []interface{}

	if cursor == 0 {
		query = selectClause + " WHERE p.group_id = ? ORDER BY p.id DESC LIMIT 20 "
		args = []interface{}{currentUserId, groupId}
	} else {
		query = selectClause + " WHERE p.group_id = ? AND p.id < ? ORDER BY p.id DESC LIMIT 20 "
		args = []interface{}{currentUserId, groupId, cursor}
	}

	rows, err := r.DB.Query(query, args...)
	if err != nil {
		return nil, fmt.Errorf("PostRepo.GetGroupPosts (Query): %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var p types.PostResponse

		err := rows.Scan(
			&p.Id, &p.User.Id, &p.User.Nickname,
			&p.User.FirstName, &p.User.LastName, &p.User.Avatar,
			&p.GroupId, &p.Title, &p.Description,
			&p.Privacy, &p.ImageUrl, &p.CreatedAt,
			&p.IsLiked, &p.TotalLikes, &p.TotalComments,
		)
		if err != nil {
			return nil, fmt.Errorf("PostRepo.GetGroupPosts (Scan): %w", err)
		}
		posts = append(posts, p)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("PostRepo.GetGroupPosts (Rows Err): %w", err)
	}

	return posts, nil
}

func (r *PostRepo) CanUserInteractWithPost(postId int, userId string) (bool, bool, error) {
	var postExists, canInteract bool

	query := `
        SELECT 
            EXISTS(SELECT 1 FROM posts WHERE id = ?),
            EXISTS(
                SELECT 1 FROM posts p
                WHERE p.id = ? AND (
                    (p.user_id = ?) OR 
                    (p.privacy = 'public' AND p.group_id IS NULL) OR 
                    (p.group_id IN (SELECT group_id FROM group_members WHERE user_id = ?)) OR 
                    (p.privacy = 'almost private' AND p.user_id IN (SELECT following_id FROM followers WHERE follower_id = ?)) OR 
                    (p.id IN (SELECT post_id FROM post_private WHERE user_id = ?))
                )
            )
    `
	err := r.DB.QueryRow(query, postId, postId, userId, userId, userId, userId).Scan(&postExists, &canInteract)
	if err != nil {
		return false, false, fmt.Errorf("PostRepo.CanUserInteractWithPost: %w", err)
	}

	return postExists, canInteract, nil
}

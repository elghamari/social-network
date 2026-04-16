package repositories

import (
	"database/sql"
	"fmt"
	"soc-net/internal/types"
)

type PostsRepo struct {
	DB *sql.DB
}

func NewPostsRepo(db *sql.DB) *PostsRepo {
	return &PostsRepo{DB: db}
}

func (r *PostsRepo) InsertPost(input types.Post) (int64, error) {
	queryInsert := `
	INSERT INTO posts (user_id, group_id, content, privacy)
    VALUES (?, ?, ?, ?)`

	result, err := r.DB.Exec(queryInsert, input.UserId, input.GroupId, input.Content, input.Privacy)
	if err != nil {
		return 0, fmt.Errorf("PostsRepo.InsertPost (Exec): %w", err)
	}
	lastPostId, err := result.LastInsertId()
	if err != nil {
		return 0, fmt.Errorf("PostsRepo.InsertPost (LastInsertId): %w", err)
	}

	return lastPostId, nil
}

func (r *PostsRepo) GetProfilePosts(userId string, cursor int) ([]types.PostResponse, error) {

	posts := []types.PostResponse{}

	var query string
	var args []interface{}

	if cursor == 0 {
		query = `
		SELECT p.id, p.user_id, u.name, p.content, p.privacy, p.created_at
		FROM posts as p
		INNER JOIN users as u ON p.user_id = u.id
		WHERE p.user_id = ? AND p.group_id IS NULL
		ORDER BY p.id DESC LIMIT 20
		`
		args = []interface{}{userId}
	} else {
		query = `
		SELECT p.id, p.user_id, u.name, p.content, p.privacy, p.created_at
		FROM posts as p
		INNER JOIN users as u ON p.user_id = u.id
		WHERE p.user_id = ? AND p.group_id IS NULL AND p.id < ?
		ORDER BY p.id DESC LIMIT 20
		`
		args = []interface{}{userId, cursor}
	}

	rows, err := r.DB.Query(query, args...)
	if err != nil {
		return nil, fmt.Errorf("PostsRepo.GetProfilePosts (Query): %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var p types.PostResponse
		err := rows.Scan(&p.Id, &p.User.Id, &p.User.Username, &p.Content, &p.Privacy, &p.CreatedAt)
		if err != nil {
			return nil, fmt.Errorf("PostsRepo.GetProfilePosts (Scan): %w", err)
		}
		posts = append(posts, p)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("PostsRepo.GetProfilePosts (Rows Err): %w", err)
	}

	return posts, nil
}


func (r *PostsRepo) GetGroupPosts(groupId int, cursor int) ([]types.PostResponse, error) {

    posts := []types.PostResponse{}

    var query string
    var args []interface{}
    
    if cursor == 0 {

		query = `
        SELECT p.id, p.user_id, u.username, p.group_id, p.content, p.privacy, p.created_at
        FROM posts as p
        INNER JOIN users as u ON p.user_id = u.id
        WHERE p.group_id = ? 
        ORDER BY p.id DESC LIMIT 20
        `
        args = []interface{}{groupId}
    } else {

		query = `
        SELECT p.id, p.user_id, u.username, p.group_id, p.content, p.privacy, p.created_at
        FROM posts as p
        INNER JOIN users as u ON p.user_id = u.id
        WHERE p.group_id = ? AND p.id < ? 
        ORDER BY p.id DESC LIMIT 20
        `
        args = []interface{}{groupId, cursor}
    }

    rows, err := r.DB.Query(query, args...)
    if err != nil {
        return nil, fmt.Errorf("PostsRepo.GetGroupPosts (Query): %w", err)
    }
    defer rows.Close()
    
    for rows.Next() {
        var p types.PostResponse
        
        err := rows.Scan(&p.Id, &p.User.Id, &p.User.Username, &p.GroupId, &p.Content, &p.Privacy, &p.CreatedAt)
        if err != nil {
            return nil, fmt.Errorf("PostsRepo.GetGroupPosts (Scan): %w", err)
        }
        posts = append(posts, p)
    }

    if err = rows.Err(); err != nil {
        return nil, fmt.Errorf("PostsRepo.GetGroupPosts (Rows Err): %w", err)
    }

    return posts, nil
}
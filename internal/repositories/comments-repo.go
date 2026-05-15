package repositories

import (
	"database/sql"
	"fmt"

	"soc-net/internal/types"
)

type CommentsRepo struct {
	DB *sql.DB
}

func NewCommentsRepo(db *sql.DB) *CommentsRepo {
	return &CommentsRepo{DB: db}
}

func (r *CommentsRepo) InsertComment(input types.CommentInput) (int, error) {
	tx, err := r.DB.Begin()
	if err != nil {
		return 0, fmt.Errorf("CommentsRepo.InsertComment (Begin): %w", err)
	}
	defer tx.Rollback()

	queryInsert := `
    INSERT INTO comments (user_id, post_id, content, image_url)
    VALUES (?, ?, ?, ?)`

	_, err = tx.Exec(queryInsert, input.UserId, input.PostId, input.Content, input.ImageUrl)
	if err != nil {
		return 0, fmt.Errorf("CommentsRepo.InsertComment (Exec): %w", err)
	}

	var totalComments int
	queryCount := `SELECT COUNT(*) FROM comments WHERE post_id = ?`

	err = tx.QueryRow(queryCount, input.PostId).Scan(&totalComments)
	if err != nil {
		return 0, fmt.Errorf("CommentsRepo.InsertComment (Count): %w", err)
	}

	if err = tx.Commit(); err != nil {
		return 0, fmt.Errorf("CommentsRepo.InsertComment (Commit): %w", err)
	}

	return totalComments, nil
}

func (r *CommentsRepo) GetPostComments(postId int, cursor int) ([]types.CommentResponse, error) {
	comments := []types.CommentResponse{}

	var query string
	var args []interface{}

	selectClause := `
	    SELECT c.id, c.post_id, u.id, u.nickname, u.first_name, u.last_name, u.avatar, 
		c.content, c.image_url, c.created_at
        FROM comments c
        INNER JOIN users u ON c.user_id = u.id
	`

	if cursor == 0 {
		query = selectClause + ` WHERE c.post_id = ?
        ORDER BY c.id DESC LIMIT 20
        `
		args = []interface{}{postId}
	} else {
		query = selectClause + ` WHERE c.post_id = ? AND c.id < ? 
        ORDER BY c.id DESC LIMIT 20
        `
		args = []interface{}{postId, cursor}
	}

	rows, err := r.DB.Query(query, args...)
	if err != nil {
		return nil, fmt.Errorf("CommentsRepo.GetPostComments (Query): %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var c types.CommentResponse

		err := rows.Scan(
			&c.Id, &c.PostId,
			&c.User.Id, &c.User.Nickname, &c.User.FirstName, &c.User.LastName, &c.User.Avatar,
			&c.Content, &c.ImageUrl, &c.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("CommentsRepo.GetPostComments (Scan): %w", err)
		}
		comments = append(comments, c)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("CommentsRepo.GetPostComments (Rows Err): %w", err)
	}

	return comments, nil
}

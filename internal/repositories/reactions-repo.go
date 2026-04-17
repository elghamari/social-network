package repositories

import (
	"database/sql"
	"fmt"
)

type ReactionsRepo struct {
	DB *sql.DB
}

func NewReactionsRepo(db *sql.DB) *ReactionsRepo {
	return &ReactionsRepo{DB: db}
}

func (r *ReactionsRepo) ToggleReaction(userId string, postId int) (bool, int, error) {
	tx, err := r.DB.Begin()
	if err != nil {
		return false, 0, fmt.Errorf("ReactionsRepo.ToggleReaction (Begin): %w", err)
	}

	defer tx.Rollback()

	res, err := tx.Exec("DELETE FROM reactions WHERE user_id = ? AND post_id = ?", userId, postId)
	if err != nil {
		return false, 0, fmt.Errorf("ReactionsRepo.ToggleReaction (Delete): %w", err)
	}

	rowsAffected, _ := res.RowsAffected()
	isLiked := false

	if rowsAffected == 0 {
		_, err = tx.Exec("INSERT INTO reactions (user_id, post_id) VALUES (?, ?)", userId, postId)
		if err != nil {
			return false, 0, fmt.Errorf("ReactionsRepo.ToggleReaction (Insert): %w", err)
		}
		isLiked = true
	}

	var totalLikes int
	err = tx.QueryRow("SELECT COUNT(*) FROM reactions WHERE post_id = ?", postId).Scan(&totalLikes)
	if err != nil {
		return false, 0, fmt.Errorf("ReactionsRepo.ToggleReaction (Count): %w", err)
	}

	if err = tx.Commit(); err != nil {
		return false, 0, fmt.Errorf("ReactionsRepo.ToggleReaction (Commit): %w", err)
	}

	return isLiked, totalLikes, nil
}

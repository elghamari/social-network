package repositories

import (
	"database/sql"
	"fmt"

	"soc-net/internal/types"
)

type UserRepo struct {
	DB *sql.DB
}

func NewUserRepo(db *sql.DB) *UserRepo {
	return &UserRepo{DB: db}
}

func (f *UserRepo) getUsersByQuery(query string, args ...any) ([]types.FollowerInfo, error) {
	rows, err := f.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := []types.FollowerInfo{}
	for rows.Next() {
		var info types.FollowerInfo
		var avatar, nickname, aboutMe sql.NullString
		var dob sql.NullTime

		if err := rows.Scan(
			&info.ID,
			&info.FirstName,
			&info.LastName,
			&avatar,
			&info.Email,
			&dob,
			&nickname,
			&aboutMe,
		); err != nil {
			return nil, err
		}

		if avatar.Valid {
			info.Avatar = avatar.String
		}
		if nickname.Valid {
			info.Nickname = nickname.String
		}
		if aboutMe.Valid {
			info.AboutMe = aboutMe.String
		}
		if dob.Valid {
			info.DateOfBirth = dob.Time
		}

		list = append(list, info)
	}
	return list, nil
}

func (f *UserRepo) GetFollowers(userID string) ([]types.FollowerInfo, error) {
	q := `SELECT u.id, u.first_name, u.last_name, u.avatar, u.email, u.date_of_birth, u.nickname, u.about_me
          FROM followers fl JOIN users u ON fl.follower_id = u.id
          WHERE fl.following_id = ?`
	return f.getUsersByQuery(q, userID)
}

func (f *UserRepo) GetFollowing(userID string) ([]types.FollowerInfo, error) {
	q := `SELECT u.id, u.first_name, u.last_name, u.avatar, u.email, u.date_of_birth, u.nickname, u.about_me
          FROM followers fl JOIN users u ON fl.following_id = u.id
          WHERE fl.follower_id = ?`
	return f.getUsersByQuery(q, userID)
}

func (f *UserRepo) GetPendingRequests(userID string) ([]types.FollowerInfo, error) {
	q := `SELECT u.id, u.first_name, u.last_name  , u.avatar, u.email, u.date_of_birth, u.nickname, u.about_me
	      FROM follow_requests fr JOIN users u ON fr.sender_id = u.id
	      WHERE fr.receiver_id = ?`
	return f.getUsersByQuery(q, userID)
}

func (f *UserRepo) GetFollowStatus(viewerID, targetID string) (string, error) {
	var id string

	err := f.DB.QueryRow(
		`SELECT follower_id FROM followers WHERE follower_id = ? AND following_id = ?`,
		viewerID, targetID,
	).Scan(&id)
	if err == nil {
		return "following", nil
	} else if err != sql.ErrNoRows {
		return "", fmt.Errorf("UserRepo.GetFollowStatus: %w", err)
	}

	err = f.DB.QueryRow(
		`SELECT sender_id FROM follow_requests WHERE sender_id = ? AND receiver_id = ?`,
		viewerID, targetID,
	).Scan(&id)
	if err == nil {
		return "pending", nil
	} else if err != sql.ErrNoRows {
		return "", fmt.Errorf("UserRepo.GetFollowStatus: %w", err)
	}

	return "none", nil
}

func (f *UserRepo) FollowUserDirectly(followerID, followingID string) error {
	_, err := f.DB.Exec(
		`INSERT INTO followers (follower_id, following_id) VALUES (?, ?)`,
		followerID, followingID,
	)
	if err != nil {
		return fmt.Errorf("UserRepo.FollowUserDirectly: %w", err)
	}
	return nil
}

func (f *UserRepo) SendFollowRequest(senderID, receiverID string) error {
	_, err := f.DB.Exec(
		`INSERT INTO follow_requests (sender_id, receiver_id) VALUES (?, ?)`,
		senderID, receiverID,
	)
	if err != nil {
		return fmt.Errorf("UserRepo.SendFollowRequest: %w", err)
	}
	return nil
}

func (f *UserRepo) AcceptFollowRequest(senderID, receiverID string) error {
	tx, err := f.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	res, err := tx.Exec(
		`DELETE FROM follow_requests WHERE sender_id = ? AND receiver_id = ?`,
		senderID, receiverID,
	)
	if err != nil {
		return err
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return &types.NotFoundError{"no pending request"}
	}

	_, err = tx.Exec(
		`INSERT INTO followers (follower_id, following_id) VALUES (?, ?)`,
		senderID, receiverID,
	)
	if err != nil {
		return err
	}
	return tx.Commit()
}

func (f *UserRepo) DeclineFollowRequest(senderID, receiverID string) error {
	_, err := f.DB.Exec(
		`DELETE FROM follow_requests WHERE sender_id = ? AND receiver_id = ?`,
		senderID, receiverID,
	)
	return err
}

func (f *UserRepo) UnfollowUser(followerID, followingID string) error {
    _, err := f.DB.Exec(
        `DELETE FROM followers WHERE follower_id = ? AND following_id = ?`,
        followerID, followingID,
    )
    if err != nil {
        return err
    }

    _, err = f.DB.Exec(
        `DELETE FROM follow_requests WHERE sender_id = ? AND receiver_id = ?`,
        followerID, followingID,
    )
    return err
}
func (f *UserRepo) AcceptAllFollowRequests(receiverID string) error {
    tx, err := f.DB.Begin()
    if err != nil {
        return err
    }
    defer tx.Rollback()
    _, err = tx.Exec(
        `INSERT OR IGNORE INTO followers (follower_id, following_id)
         SELECT sender_id, receiver_id FROM follow_requests WHERE receiver_id = ?`,
        receiverID,
    )
    if err != nil {
        return err
    }

    _, err = tx.Exec(
        `DELETE FROM follow_requests WHERE receiver_id = ?`,
        receiverID,
    )
    if err != nil {
        return err
    }

    return tx.Commit()
}
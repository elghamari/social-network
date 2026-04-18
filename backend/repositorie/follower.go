package repositorie

import (
	"database/sql"
	"fmt"

	"socialnetwork/modle"
)

type FollowRepo struct {
	Db *sql.DB
}

func NewFollowRepo(db *sql.DB) *FollowRepo {
	return &FollowRepo{Db: db}
}

func (f *FollowRepo) getUsersByQuery(query string, userID string) ([]modle.FollowerInfo, error) {
	rows, err := f.Db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	ListInfo := []modle.FollowerInfo{}
	for rows.Next() {
		var info modle.FollowerInfo
		if err := rows.Scan(&info.ID, &info.FirstName, &info.LastName); err != nil {
			return nil, err
		}
		ListInfo = append(ListInfo, info)
	}
	return ListInfo, nil
}

func (f *FollowRepo) GetUserProfileByID(userID string) {
}

func (f *FollowRepo) GetFollowers(userID string) ([]modle.FollowerInfo, error) {
	query := `SELECT u.id, u.first_name, u.last_name FROM followers f JOIN users u ON f.follower_id = u.id WHERE f.following_id = ?`
	return f.getUsersByQuery(query, userID)
}

func (f *FollowRepo) GetFollowing(userID string) ([]modle.FollowerInfo, error) {
	query := `SELECT u.id, u.first_name, u.last_name FROM followers f JOIN users u ON f.following_id = u.id WHERE f.follower_id = ?`
	return f.getUsersByQuery(query, userID)
}

func (f *FollowRepo) GetPendingRequests(userID string) ([]modle.FollowerInfo, error) {
	query := `SELECT u.id, u.first_name, u.last_name FROM follow_requests fr JOIN users u ON fr.sender_id = u.id WHERE fr.receiver_id = ?`
	return f.getUsersByQuery(query, userID)
}

func (f *FollowRepo) SendFollowRequest(senderid, reciverid string) error {
	_, err := f.Db.Exec("INSERT INTO follow_requests (sender_id, receiver_id) VALUES (?, ?)", senderid, reciverid)
	if err != nil {
		return fmt.Errorf("SendFollowRequest: error instirting %v", err)
	}

	return nil
}

func (f *FollowRepo) FollowUserDirectly(senderid, reciverid string) error {
	_, err := f.Db.Exec("INSERT INTO followers (sender_id, receiver_id) VALUES (?, ?)", senderid, reciverid)
	if err != nil {
		return fmt.Errorf("FollowUserDirectly: error instirting %v", err)
	}

	return nil
}

func (f *FollowRepo) AcceptFollowRequest(senderID, receiverID string) error {
	tx, err := f.Db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	res, err := tx.Exec("DELETE FROM follow_requests WHERE sender_id = ? AND receiver_id = ?", senderID, receiverID)
	if err != nil {
		return err
	}

	rows, _ := res.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("no pending request found")
	}
	_, err = tx.Exec("INSERT INTO followers (follower_id, following_id) VALUES (?, ?)", senderID, receiverID)
	if err != nil {
		return err
	}

	return tx.Commit()
}

func (f *FollowRepo) DeclineFollowRequest(senderID, receiverID string) error {
	query := `DELETE FROM follow_requests WHERE sender_id = ? AND receiver_id = ?`
	_, err := f.Db.Exec(query, senderID, receiverID)
	return err
}

func (f *FollowRepo) GetFollowStatus(viewerID, targetID string) (string, error) {
	var id string

	queryFollowers := `SELECT follower_id FROM followers WHERE follower_id = ? AND following_id = ?`
	err := f.Db.QueryRow(queryFollowers, viewerID, targetID).Scan(&id)

	if err == nil {
		return "following", nil
	} else if err != sql.ErrNoRows {
		return "", fmt.Errorf("GetFollowStatus: error checking followers: %w", err)
	}

	queryRequests := `SELECT sender_id FROM follow_requests WHERE sender_id = ? AND receiver_id = ?`
	err = f.Db.QueryRow(queryRequests, viewerID, targetID).Scan(&id)

	if err == nil {
		return "pending", nil
	} else if err != sql.ErrNoRows {
		return "", fmt.Errorf("GetFollowStatus: error checking pending requests: %w", err)
	}

	return "none", nil
}

func (f *FollowRepo) UnfollowUser(followerID, followingID string) error {
	query := `DELETE FROM followers WHERE follower_id = ? AND following_id = ?`
	_, err := f.Db.Exec(query, followerID, followingID)
	return err
}

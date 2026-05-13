package repositories

import (
	"database/sql"
	"strings"

	"soc-net/internal/types"
)

type SearchRepo struct {
	DB *sql.DB
}

func NewSearchRepo(db *sql.DB) *SearchRepo {
	return &SearchRepo{DB: db}
}

func (r *SearchRepo) SearchUsers(query string) ([]types.FollowerInfo, error) {
    q := `SELECT id, first_name, last_name, avatar 
          FROM users 
          WHERE (first_name || ' ' || last_name) LIKE ? 
          OR (last_name || ' ' || first_name) LIKE ? 
          LIMIT 10`
          
    words := strings.Fields(query)
    cleanQuery := strings.Join(words, " ")
    
    searchTerm := "%" + cleanQuery + "%"
    return r.getUsersByQuery(q, searchTerm, searchTerm)
}

func (r *SearchRepo) getUsersByQuery(query string, args ...any) ([]types.FollowerInfo, error) {
	rows, err := r.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := []types.FollowerInfo{}
	for rows.Next() {
		var info types.FollowerInfo
		var avatar sql.NullString
		if err := rows.Scan(&info.ID, &info.FirstName, &info.LastName, &avatar); err != nil {
			return nil, err
		}
		if avatar.Valid {
			info.Avatar = avatar.String
		} else {
			info.Avatar = ""
		}
		list = append(list, info)
	}
	return list, nil
}

CREATE TABLE IF NOT EXISTS group_join_requests (
    group_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(group_id, user_id)
)
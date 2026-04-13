CREATE TABLE IF NOT EXISTS group_members (
    group_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    is_creator BOOLEAN NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
)
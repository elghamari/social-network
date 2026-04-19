CREATE TABLE IF NOT EXISTS followers (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    follower_id  TEXT NOT NULL,
    following_id TEXT NOT NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (follower_id)  REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(follower_id, following_id)
);

CREATE TABLE IF NOT EXISTS follow_requests (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id   TEXT NOT NULL,
    receiver_id TEXT NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id)   REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(sender_id, receiver_id)
);

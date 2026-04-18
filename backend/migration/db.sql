PRAGMA foreign_keys = ON;

-- Users table (from both projects, unified)
CREATE TABLE IF NOT EXISTS users (
    id           TEXT PRIMARY KEY,
    email        TEXT UNIQUE NOT NULL,
    password     TEXT NOT NULL,
    first_name   TEXT NOT NULL,
    last_name    TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    avatar       TEXT,
    nickname     TEXT,
    about_me     TEXT,
    is_public    BOOLEAN DEFAULT 1,   -- 1 = public, 0 = private
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_id   TEXT UNIQUE,
    session_time DATETIME
);

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

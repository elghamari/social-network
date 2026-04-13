CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
);

INSERT OR IGNORE INTO users (id, name) VALUES ('user', 'User');
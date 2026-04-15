CREATE TABLE IF NOT EXISTS reactions (
    user_id TEXT NOT NULL,   
    post_id INTEGER NOT NULL,

    PRIMARY KEY(user_id,post_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);
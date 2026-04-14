CREATE TABLE IF NOT EXISTS group_invitations (
    group_id INTEGER NOT NULL,
    inviter_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    FOREIGN KEY (inviter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)
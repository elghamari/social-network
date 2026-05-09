CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    receiver_id TEXT NOT NULL,        
    sender_id TEXT NOT NULL,           
    type TEXT NOT NULL,                
    entity_id TEXT NOT NULL, 
    content TEXT NOT NULL,          
    is_read INTEGER DEFAULT 0,         
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    avatar TEXT,

    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);
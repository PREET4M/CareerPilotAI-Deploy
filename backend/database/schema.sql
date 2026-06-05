-- CareerPilot AI SQLite Schema

-- Enable foreign key support
PRAGMA foreign_keys = ON;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analyses Table
CREATE TABLE IF NOT EXISTS analyses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    role TEXT NOT NULL,
    score INTEGER NOT NULL,
    matched_skills TEXT NOT NULL,      -- JSON representation of array of strings
    missing_skills TEXT NOT NULL,      -- JSON representation of array of strings
    roadmap TEXT NOT NULL,             -- JSON representation of array of dicts/phases
    learning_resources TEXT NOT NULL,  -- JSON representation of array of dicts
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

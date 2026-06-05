import sqlite3
import os
import json
from config import Config

def get_db_connection():
    conn = sqlite3.connect(Config.DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    schema_path = os.path.join(os.path.dirname(__file__), 'schema.sql')
    if not os.path.exists(schema_path):
        raise FileNotFoundError(f"Schema file not found at {schema_path}")
        
    conn = get_db_connection()
    try:
        with open(schema_path, 'r') as f:
            conn.executescript(f.read())
        conn.commit()
    except Exception as e:
        print(f"Error initializing database: {e}")
        raise e
    finally:
        conn.close()

# User Helpers
def create_user(username, password_hash):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO users (username, password_hash) VALUES (?, ?)",
            (username, password_hash)
        )
        conn.commit()
        return cursor.lastrowid
    except sqlite3.IntegrityError:
        return None  # Username already exists
    except Exception as e:
        print(f"Error creating user: {e}")
        return None
    finally:
        conn.close()

def get_user_by_username(username):
    conn = get_db_connection()
    try:
        row = conn.execute(
            "SELECT * FROM users WHERE username = ?",
            (username,)
        ).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()

def get_user_by_id(user_id):
    conn = get_db_connection()
    try:
        row = conn.execute(
            "SELECT * FROM users WHERE id = ?",
            (user_id,)
        ).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()

# Analysis Helpers
def save_analysis(user_id, filename, role, score, matched_skills, missing_skills, roadmap, learning_resources):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            INSERT INTO analyses (user_id, filename, role, score, matched_skills, missing_skills, roadmap, learning_resources)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                user_id,
                filename,
                role,
                score,
                json.dumps(matched_skills),
                json.dumps(missing_skills),
                json.dumps(roadmap),
                json.dumps(learning_resources)
            )
        )
        conn.commit()
        return cursor.lastrowid
    except Exception as e:
        print(f"Error saving analysis: {e}")
        return None
    finally:
        conn.close()

def get_user_analyses(user_id):
    conn = get_db_connection()
    try:
        rows = conn.execute(
            "SELECT id, filename, role, score, created_at FROM analyses WHERE user_id = ? ORDER BY created_at DESC",
            (user_id,)
        ).fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()

def get_analysis_by_id(analysis_id, user_id):
    conn = get_db_connection()
    try:
        row = conn.execute(
            "SELECT * FROM analyses WHERE id = ? AND user_id = ?",
            (analysis_id, user_id)
        ).fetchone()
        if not row:
            return None
            
        data = dict(row)
        # Deserialize JSON fields
        data['matched_skills'] = json.loads(data['matched_skills'])
        data['missing_skills'] = json.loads(data['missing_skills'])
        data['roadmap'] = json.loads(data['roadmap'])
        data['learning_resources'] = json.loads(data['learning_resources'])
        return data
    finally:
        conn.close()

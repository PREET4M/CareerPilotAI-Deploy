import bcrypt

def hash_password(password: str) -> str:
    """
    Hashes a plain-text password using bcrypt.
    """
    if not password:
        raise ValueError("Password cannot be empty")
    # Generate salt and hash the password
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def check_password(password: str, password_hash: str) -> bool:
    """
    Checks if a plain-text password matches the stored bcrypt hash.
    """
    if not password or not password_hash:
        return False
    try:
        return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))
    except Exception as e:
        print(f"Error checking password: {e}")
        return False

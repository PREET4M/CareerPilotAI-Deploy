import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Base directories
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
INSTANCE_DIR = os.path.join(BASE_DIR, 'instance')
UPLOAD_DIR = os.path.join(BASE_DIR, 'uploads')

# Create necessary directories
os.makedirs(INSTANCE_DIR, exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)

class Config:
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev_secret_key_careerpilot_12345')
    PORT = int(os.getenv('PORT', 5000))
    DATABASE_PATH = os.path.join(INSTANCE_DIR, 'careerpilot.db')
    UPLOAD_FOLDER = UPLOAD_DIR
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '').strip()
    
    # Check if Gemini API is enabled
    @classmethod
    def is_gemini_enabled(cls):
        return len(cls.GEMINI_API_KEY) > 0

import os
from datetime import timedelta

class Config:
    # Flask settings
    SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-here')  # Change this in production
    SESSION_TYPE = 'filesystem'
    PERMANENT_SESSION_LIFETIME = timedelta(days=1)
    
    # MongoDB settings - using environment variable
    MONGODB_URI = os.environ.get('MONGODB_URI')
    
    # File upload settings
    MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10MB max file size
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
    ALLOWED_EXTENSIONS = {'pdf'}
    
    # Ensure upload folder exists
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    
    # CORS settings
    CORS_HEADERS = 'Content-Type'
    CORS_ORIGINS = ['http://localhost:3000', 'http://localhost:3001']
    CORS_SUPPORTS_CREDENTIALS = True 
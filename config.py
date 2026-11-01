import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'civicsaathi-pune-civic-secret-key-2026')
    
    # Upload Folder
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'static', 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max upload
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'gif'}
    
    # MySQL Database Configuration
    MYSQL_HOST = os.environ.get('MYSQL_HOST', 'localhost')
    MYSQL_USER = os.environ.get('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD', '')
    MYSQL_DB = os.environ.get('MYSQL_DB', 'civicsaathi_pune_db')
    MYSQL_PORT = int(os.environ.get('MYSQL_PORT', 3306))
    
    # SQLite Fallback Path
    SQLITE_PATH = os.path.join(BASE_DIR, 'civicsaathi.db')
    
    # Force SQLite flag (set to 'True' if MySQL is not available)
    USE_SQLITE = os.environ.get('USE_SQLITE', 'auto')

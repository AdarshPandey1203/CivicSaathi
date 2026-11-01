import os
import pymysql
import time
from pymysql.cursors import DictCursor

def get_connection():
    """Create a MySQL connection using environment variables with retry logic."""
    host = os.getenv('MYSQL_HOST', 'db')
    port = int(os.getenv('MYSQL_PORT', '3306'))
    user = os.getenv('MYSQL_USER', 'appuser')
    password = os.getenv('MYSQL_PASSWORD', 'apppassword')
    database = os.getenv('MYSQL_DATABASE', 'appdb')

    max_retries = 5
    delay = 3
    for attempt in range(1, max_retries + 1):
        try:
            conn = pymysql.connect(host=host,
                                   port=port,
                                   user=user,
                                   password=password,
                                   database=database,
                                   cursorclass=DictCursor,
                                   autocommit=True)
            return conn
        except pymysql.MySQLError as e:
            if attempt < max_retries:
                print(f"MySQL connection failed (attempt {attempt}/{max_retries}): {e}. Retrying in {delay}s...")
                time.sleep(delay)
            else:
                raise

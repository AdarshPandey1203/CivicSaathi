import os
import sqlite3
import hashlib
from config import Config

def hash_password(password: str) -> str:
    """Hash password using SHA-256 with salt."""
    salt = "pune_civicsaathi_salt_2026"
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()

def verify_password(plain_password: str, hashed: str) -> bool:
    return hash_password(plain_password) == hashed

def get_db_connection():
    """
    Returns a database connection.
    Attempts MySQL connection if pymysql is installed and MySQL is running;
    Otherwise seamlessly uses SQLite with row_factory for full relational integrity.
    """
    if Config.USE_SQLITE == 'false' or Config.USE_SQLITE == 'False':
        try:
            import pymysql
            conn = pymysql.connect(
                host=Config.MYSQL_HOST,
                user=Config.MYSQL_USER,
                password=Config.MYSQL_PASSWORD,
                database=Config.MYSQL_DB,
                port=Config.MYSQL_PORT,
                cursorclass=pymysql.cursors.DictCursor,
                autocommit=True
            )
            return conn, 'mysql'
        except Exception as e:
            print(f"[Database] MySQL connection failed ({e}). Falling back to SQLite.")

    # SQLite Connection
    conn = sqlite3.connect(Config.SQLITE_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn, 'sqlite'

def query_db(query, args=(), one=False):
    """Execute a query and fetch rows as dictionaries."""
    conn, db_type = get_db_connection()
    try:
        cur = conn.cursor()
        if db_type == 'sqlite':
            # Replace MySQL specific syntax if any
            sqlite_query = query.replace('%s', '?')
            cur.execute(sqlite_query, args)
            rv = cur.fetchall()
            cur.close()
            if db_type == 'sqlite':
                conn.commit()
            conn.close()
            if rv is None:
                return None
            results = [dict(row) for row in rv]
            return (results[0] if results else None) if one else results
        else:
            cur.execute(query, args)
            rv = cur.fetchall()
            cur.close()
            conn.close()
            if rv is None:
                return None
            return (rv[0] if rv else None) if one else rv
    except Exception as e:
        conn.close()
        raise e

def execute_db(query, args=()):
    """Execute INSERT/UPDATE/DELETE and return lastrowid / affected rows."""
    conn, db_type = get_db_connection()
    try:
        cur = conn.cursor()
        if db_type == 'sqlite':
            sqlite_query = query.replace('%s', '?')
            cur.execute(sqlite_query, args)
            conn.commit()
            last_id = cur.lastrowid
            cur.close()
            conn.close()
            return last_id
        else:
            cur.execute(query, args)
            last_id = cur.lastrowid
            conn.commit()
            cur.close()
            conn.close()
            return last_id
    except Exception as e:
        conn.close()
        raise e

def init_db():
    """Initializes tables for SQLite if not already created."""
    conn, db_type = get_db_connection()
    if db_type == 'sqlite':
        cur = conn.cursor()
        
        # 1. Departments
        cur.execute('''
        CREATE TABLE IF NOT EXISTS departments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            authority TEXT NOT NULL,
            description TEXT,
            contact_email TEXT,
            contact_phone TEXT,
            sla_days INTEGER NOT NULL DEFAULT 7,
            icon TEXT DEFAULT 'building',
            is_active INTEGER NOT NULL DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ''')

        # 2. Complaint Categories
        cur.execute('''
        CREATE TABLE IF NOT EXISTS complaint_categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            department_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            default_urgency TEXT DEFAULT 'Medium',
            is_active INTEGER NOT NULL DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
        )
        ''')

        # 3. Users Table
        cur.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'citizen',
            phone TEXT,
            ward_area TEXT,
            department_id INTEGER,
            designation TEXT,
            official_id TEXT,
            is_active INTEGER NOT NULL DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
        )
        ''')

        # 4. Complaints Table
        cur.execute('''
        CREATE TABLE IF NOT EXISTS complaints (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            reference_no TEXT NOT NULL UNIQUE,
            citizen_id INTEGER NOT NULL,
            department_id INTEGER NOT NULL,
            category_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            ward_area TEXT NOT NULL,
            address_landmark TEXT NOT NULL,
            latitude REAL,
            longitude REAL,
            urgency TEXT NOT NULL DEFAULT 'Medium',
            photo_url TEXT,
            resolution_photo_url TEXT,
            status TEXT NOT NULL DEFAULT 'Submitted',
            assigned_officer_id INTEGER,
            officer_remarks TEXT,
            rejection_reason TEXT,
            resolved_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (citizen_id) REFERENCES users(id) ON DELETE RESTRICT,
            FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
            FOREIGN KEY (category_id) REFERENCES complaint_categories(id) ON DELETE RESTRICT,
            FOREIGN KEY (assigned_officer_id) REFERENCES users(id) ON DELETE SET NULL
        )
        ''')

        # 5. Timeline Table
        cur.execute('''
        CREATE TABLE IF NOT EXISTS complaint_timeline (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            complaint_id INTEGER NOT NULL,
            actor_id INTEGER NOT NULL,
            actor_name TEXT NOT NULL,
            actor_role TEXT NOT NULL,
            status TEXT NOT NULL,
            remarks TEXT NOT NULL,
            evidence_photo TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
            FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE RESTRICT
        )
        ''')

        # 6. Admin Logs
        cur.execute('''
        CREATE TABLE IF NOT EXISTS admin_activity_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            admin_id INTEGER NOT NULL,
            action_type TEXT NOT NULL,
            details TEXT NOT NULL,
            ip_address TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE RESTRICT
        )
        ''')

        conn.commit()
        cur.close()
        conn.close()

# Flask MySQL Docker Skeleton

## Overview
A minimal production‑ready Flask application that connects to a MySQL 8.0 database. The project is fully containerized with Docker and orchestrated via `docker‑compose`.

- **Framework:** Flask 3.x
- **Database driver:** PyMySQL
- **Web server:** Gunicorn (4 workers)
- **Containerization:** Multi‑stage Dockerfile, non‑root user, health‑checks
- **Orchestration:** `docker-compose` with a MySQL service and persistent volume

## Directory Layout
```
flask_mysql_app/
├─ app/                # Python source
│   ├─ __init__.py
│   ├─ main.py          # Flask entry point
│   └─ db.py            # MySQL connection helper with retry logic
├─ db_init/            # Optional schema initialization script
│   └─ init.sql
├─ Dockerfile           # Multi‑stage build
├─ docker-compose.yml   # Services definition
├─ requirements.txt    # Python dependencies
├─ .gitignore
└─ README.md
```

## Quick Start (Docker)
```bash
# Build and start the stack
docker compose up -d --build

# Test API
curl http://localhost:5000/          # health check
curl -X POST -H "Content-Type: application/json" \
    -d '{"name":"Alice","email":"alice@example.com"}' \
    http://localhost:5000/users
curl http://localhost:5000/users      # list users
```

The web service will automatically wait for MySQL to become healthy before starting.

## Running Locally (without Docker)
```bash
# Create a virtual environment
python -m venv .venv
source .venv/bin/activate   # on Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Export required environment variables
export MYSQL_HOST=127.0.0.1
export MYSQL_PORT=3306
export MYSQL_USER=appuser
export MYSQL_PASSWORD=apppassword
export MYSQL_DATABASE=appdb

# Initialise the database (run the SQL script against your MySQL instance)
# e.g. mysql -u root -p < db_init/init.sql

# Run the app
python -m app.main
```

## Database Schema (init.sql)
```sql
CREATE DATABASE IF NOT EXISTS appdb;
USE appdb;
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
```

## Git Setup (initial commit)
```bash
git init
git add .
git commit -m "Initial commit – Flask MySQL Docker skeleton"
git branch -M main
# Replace <repo-url> with your GitHub repository URL
git remote add origin <repo-url>
git push -u origin main
```

## Production Deployment Guide (Linux server)
See `deploy.sh` for a ready‑to‑run bash script that:
1. Updates the OS packages.
2. Installs Docker Engine and Docker Compose plugin.
3. Adds the current user to the `docker` group.
4. Clones the repository.
5. Creates a `.env` file with DB credentials.
6. Starts the stack with `docker compose up -d --build`.

---
*All secrets must be stored in environment variables or a `.env` file that is **not** committed to version control.*
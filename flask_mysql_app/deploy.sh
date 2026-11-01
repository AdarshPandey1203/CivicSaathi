#!/usr/bin/env bash
set -e

# -------------------------------------------------
# Production deployment script for Flask‑MySQL app
# -------------------------------------------------
# 1. Update system packages
sudo apt-get update && sudo apt-get upgrade -y

# 2. Install Docker Engine (official script)
# Note: This script is safe for Debian/Ubuntu based distros.
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
rm get-docker.sh

# 3. Install Docker Compose (v2 plugin)
# Docker Compose is now a Docker CLI plugin.
sudo apt-get install -y docker-compose-plugin

# 4. Add current user to the docker group (requires re-login)
sudo usermod -aG docker $USER

# 5. Clone the repository (replace <repo-url> with your GitHub URL)
# Example: git clone https://github.com/yourname/flask_mysql_app.git
read -p "Enter the Git repository URL: " REPO_URL
git clone "$REPO_URL" app_repo
cd app_repo

# 6. Create a .env file with production credentials
cat > .env <<EOF
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=appdb
MYSQL_USER=appuser
MYSQL_PASSWORD=apppassword
# Optional: Override if your DB host differs
# MYSQL_HOST=db
# MYSQL_PORT=3306
EOF

# 7. Build and start the Docker stack in detached mode
# Docker Compose will read .env automatically
docker compose up -d --build

# 8. Verify containers are running
docker ps

# 9. Test the API (optional)
# curl http://localhost:5000/
# curl -X POST -H "Content-Type: application/json" -d '{"name":"Bob","email":"bob@example.com"}' http://localhost:5000/users

echo "Deployment completed successfully."

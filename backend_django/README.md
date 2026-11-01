# CivicSaathi - Python & Django Backend with MySQL

Multipurpose Community Assistance and Civic Issue Management Platform backend.

## Technology Stack
- **Language**: Python 3.10+
- **Framework**: Django 4.2+ / 5.0+ with Django REST Framework
- **Database**: MySQL 8.0+ / MariaDB
- **Authentication**: Role-based access (Citizen, Volunteer/Provider, Moderator, Administrator)
- **Maps**: OpenStreetMap / Leaflet compatible Geo coordinates

## Quick Setup Guide

### 1. MySQL Database Setup
Open MySQL shell:
```bash
mysql -u root -p
```
Run the schema setup script:
```sql
SOURCE backend_django/schema.sql;
```

### 2. Python Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install django djangorestframework django-cors-headers mysqlclient pillow
```

### 3. Run Migrations & Server
```bash
cd backend_django
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

The Django REST API will run at `http://127.0.0.1:8000/api/v1/` and the Django Admin at `http://127.0.0.1:8000/admin/`.

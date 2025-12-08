# Ronoos BakeHub - Backend

Django REST Framework backend for Ronoos BakeHub bakery management system.

## Setup Instructions

### Prerequisites
- Python 3.8+
- pip

### Installation

1. **Create and activate virtual environment:**
```bash
python -m venv venv
.\venv\Scripts\activate  # Windows
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Run migrations:**
```bash
python manage.py makemigrations
python manage.py migrate
```

4. **Create superuser (admin):**
```bash
python manage.py createsuperuser
```

5. **Run development server:**
```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Authentication
- `POST /api/register/` - Register new user
- `POST /api/login/` - Login (get JWT tokens)
- `POST /api/token/refresh/` - Refresh access token
- `POST /api/logout/` - Logout (blacklist refresh token)

### Catalog
- `GET /api/catalog/categories/` - List categories
- `GET /api/catalog/products/` - List products
- `GET /api/catalog/products/{id}/` - Product detail
- `GET /api/catalog/variants/` - List product variants
- `GET /api/catalog/images/` - List product images

### Admin Access
- `/admin/` - Django admin panel

## Database
Uses SQLite (`db.sqlite3`) for development.

## Environment
- Debug mode: ON (development only)
- CORS: Enabled for all origins (development only)

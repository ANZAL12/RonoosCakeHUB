# Authentication Testing Guide

## Issue Fixed
✅ Added `/api/me/` endpoint to retrieve current user data
✅ Fixed UserSerializer to properly handle password field (write-only)

## Testing Steps

### 1. Register a New User
1. Navigate to http://localhost:3000/register
2. Fill in:
   - Name: Test User
   - Email: test@example.com
   - Password: testpass123
   - Confirm Password: testpass123
3. Click "Register"
4. You should be automatically logged in and redirected to home page

### 2. Login
1. Navigate to http://localhost:3000/login
2. Enter:
   - Email: test@example.com
   - Password: testpass123
3. Click "Login"
4. You should be redirected to home page with navigation showing "Logout" button

### 3. View Products
1. Click "Products" in navigation
2. You should see the products page (currently empty until products are added via admin)

### 4. Admin Access
1. Create a superuser in backend:
   ```bash
   cd backend
   python manage.py createsuperuser
   ```
2. Navigate to http://localhost:8000/admin
3. Login with superuser credentials
4. Add some products, categories, and variants

### 5. Test Protected Routes
- Try accessing `/api/me/` with and without authentication
- Verify token refresh works automatically

## API Endpoints Available

### Public (No Auth Required)
- `POST /api/register/` - Register new user
- `POST /api/login/` - Login (get JWT tokens)
- `POST /api/token/refresh/` - Refresh access token
- `GET /api/catalog/categories/` - List categories
- `GET /api/catalog/products/` - List products

### Protected (Auth Required)
- `GET /api/me/` - Get current user data
- `POST /api/logout/` - Logout (blacklist token)

## Environment Setup Reminder

**Frontend** (`.env.local`):
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

**Backend** is already configured with:
- CORS enabled for all origins
- JWT token lifetime: 30 minutes (access), 1 day (refresh)
- SQLite database

## Common Issues

1. **CORS errors**: Make sure backend is running on port 8000
2. **Token errors**: Clear localStorage and try logging in again
3. **Database errors**: Run `python manage.py migrate` in backend

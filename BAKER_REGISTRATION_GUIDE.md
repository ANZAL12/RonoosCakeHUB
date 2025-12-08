# Baker Registration Guide

## How to Register Baker Accounts (Admin Side)

### Method 1: Django Admin Panel (Recommended)

1. **Access Django Admin**
   - Navigate to: `http://localhost:8000/admin/`
   - Login with superuser credentials

2. **Create New Baker Account**
   - Click on **"Users"** in the admin panel
   - Click **"Add User"** button (top right)
   - Fill in the form:
     - **Email**: Baker's email address
     - **Name**: Baker's full name
     - **Phone**: (Optional) Contact number
     - **Role**: Select **"Baker"** from dropdown
     - **Password**: Set a secure password (confirm it)
     - **Is staff**: ✓ Check this to allow admin access
     - **Is active**: ✓ Check this to activate the account
   - Click **"Save"**

3. **Baker Login**
   - Baker can now login at: `http://localhost:3000/login`
   - Select "Baker" login type
   - Use the email and password you created
   - They'll be redirected to: `http://localhost:3000/baker/dashboard`

### Method 2: Django Shell (For Developers)

```bash
cd backend
python manage.py shell
```

```python
from users.models import User

# Create a baker account
baker = User.objects.create_user(
    email='baker@example.com',
    password='securepassword123',
    name='Baker Name',
    phone='1234567890',
    role='baker',
    is_staff=True  # Optional: gives admin panel access
)
print(f"Baker created: {baker.email}")
```

### Method 3: Create Superuser (Full Admin)

```bash
cd backend
python manage.py createsuperuser
```

This creates a user with:
- Full admin access
- Role automatically set to "baker"
- Can manage all aspects of the system

## Managing Existing Bakers

1. Go to Django Admin → Users
2. Click on the baker's email
3. You can:
   - Change their role
   - Reset password
   - Activate/deactivate account
   - Grant/revoke admin access
   - View their products and orders

## Security Notes

- ✅ Only administrators can create baker accounts
- ✅ Bakers cannot self-register through the frontend
- ✅ All baker accounts should use strong passwords
- ✅ Consider enabling two-factor authentication for production

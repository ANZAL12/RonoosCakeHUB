import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ronoos_backend.settings')
django.setup()

from users.models import User

def create_baker():
    email = 'baker@example.com'
    password = 'bakerpassword123'
    
    if not User.objects.filter(email=email).exists():
        User.objects.create_user(
            email=email,
            password=password,
            name='Test Baker',
            role='baker',
            is_staff=True # Bakers might need staff access for admin panel if used, but mainly for app permissions
        )
        print(f"Baker user created: {email}")
    else:
        print(f"Baker user already exists: {email}")

if __name__ == '__main__':
    create_baker()

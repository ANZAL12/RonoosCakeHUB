from users.models import User
from users.serializers import UserSerializer

# Test creating a user
data = {
    'email': 'directtest@example.com',
    'password': 'testpass123',
    'name': 'Direct Test'
}

serializer = UserSerializer(data=data)
if serializer.is_valid():
    user = serializer.save()
    print(f"SUCCESS: Created user {user.email}")
else:
    print(f"ERRORS: {serializer.errors}")

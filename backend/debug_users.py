import os
import django
import sys

# Setup Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from users.models import User

print("--- User Debug Info ---")
bakers = User.objects.filter(role='baker')
print(f"Total Bakers Found: {bakers.count()}")

for baker in bakers:
    print(f"ID: {baker.id} | Email: {baker.email} | Name: {baker.name} | Enabled: {baker.is_custom_build_enabled}")

print("-----------------------")

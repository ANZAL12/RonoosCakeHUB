import os
import django
from django.conf import settings
from django.core.mail import send_mail

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ronoos_backend.settings')
django.setup()

def test_email():
    print("Testing email configuration...")
    print(f"EMAIL_HOST: {settings.EMAIL_HOST}")
    print(f"EMAIL_PORT: {settings.EMAIL_PORT}")
    print(f"EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")
    print(f"EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
    # Don't print the password, just check if it's set
    print(f"EMAIL_HOST_PASSWORD set: {'Yes' if settings.EMAIL_HOST_PASSWORD else 'No'}")
    
    recipient = settings.EMAIL_HOST_USER
    if not recipient:
        print("Error: EMAIL_HOST_USER is not set in settings.")
        return

    print(f"\nAttempting to send test email to {recipient}...")
    
    try:
        send_mail(
            subject='Test Email from Ronoos BakeHub',
            message='If you see this, email configuration is working correctly!',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient],
            fail_silently=False,
        )
        print("SUCCESS: Test email sent successfully!")
    except Exception as e:
        print(f"FAILURE: Could not send email.\nError: {e}")

if __name__ == "__main__":
    test_email()

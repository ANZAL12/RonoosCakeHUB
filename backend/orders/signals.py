from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Order
from users.models import User
from utils.notifications import send_push_notification
import threading

@receiver(post_save, sender=Order)
def notify_bakers_on_new_order(sender, instance, created, **kwargs):
    if created:
        bakers = User.objects.filter(role='baker').exclude(expo_push_token__isnull=True).exclude(expo_push_token='')
        for baker in bakers:
            send_push_notification(
                token=baker.expo_push_token,
                title="New Order Received! 🎂",
                message=f"Order #{instance.id} has been placed.",
                data={'order_id': instance.id}
            )
            
@receiver(post_save, sender=Order)
def notify_customer_on_status_change(sender, instance, created, **kwargs):
    if not created:
        # Send email in a separate thread to avoid Gunicorn timeouts
        def send_async_email():
            try:
                from utils.email import send_order_status_email
                send_order_status_email(instance)
            except Exception as e:
                print(f"Async Email Error: {e}")

        threading.Thread(target=send_async_email).start()

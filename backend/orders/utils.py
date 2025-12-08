from django.core.mail import send_mail
from django.conf import settings
import os

def send_order_emails(order):
    customer = order.user
    items = order.items.all()

    # Prepare product list text
    item_lines = []
    for item in items:
        variant_label = f" ({item.product_variant.label})" if item.product_variant else ""
        item_lines.append(
            f"{item.product.name}{variant_label} x {item.quantity} = ₹{item.subtotal}"
        )

    items_text = "\n".join(item_lines)

    # Customer Email
    customer_subject = f"Order Confirmed: Order #{order.id} at Ronoos BakeHub"
    customer_message = f"""
Hi {customer.name},  

Your order has been confirmed! 🎉  

Thank you for choosing Ronoos BakeHub. We have received your order and it is now being processed.

Order ID: {order.id}
Current Status: {order.status.capitalize()}

Items:
{items_text}

Total Amount: ₹{order.final_amount}

Delivery Type: {order.delivery_type}
Delivery Date: {order.delivery_date}
Delivery Slot: {order.delivery_slot}

We will update you once your order moves to the next stage.

Thank you for supporting us 🙏  
— Ronoos BakeHub
"""

    # Send to Customer
    if customer.email:
        try:
            send_mail(
                subject=customer_subject,
                message=customer_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[customer.email],
                fail_silently=False,
            )
            print(f"Email sent to customer: {customer.email}")
        except Exception as e:
            print(f"Failed to send email to customer: {e}")

    # Baker Email
    baker_email = os.environ.get('EMAIL_HOST_USER') # Send to the admin email
    
    if baker_email and customer.email == baker_email:
        print(f"WARNING: Customer email ({customer.email}) is the same as Baker email. You will receive both emails in the same inbox.")

    if baker_email:
        baker_subject = "New bakery order received"
        baker_message = f"""
New Order Alert 🚨

Order ID: {order.id}
Customer Name: {customer.name}
Customer Phone: {customer.phone}
Customer Email: {customer.email}

Delivery Type: {order.delivery_type}
Delivery Date: {order.delivery_date}
Delivery Slot: {order.delivery_slot}

Items:
{items_text}

Total: ₹{order.final_amount}

Please check the baker dashboard to manage this order.
"""

        try:
            send_mail(
                subject=baker_subject,
                message=baker_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[baker_email],
                fail_silently=False,
            )
            print(f"Email sent to baker: {baker_email}")
        except Exception as e:
            print(f"Failed to send email to baker: {e}")

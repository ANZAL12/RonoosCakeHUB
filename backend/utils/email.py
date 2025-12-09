from django.core.mail import send_mail
from django.conf import settings

def send_order_status_email(order):
    """
    Sends an email to the customer when the order status changes.
    """
    if not order.user or not order.user.email:
        print(f"Skipping email for Order #{order.id}: No customer email found.")
        return

    subject = f"Update on your Order #{order.id} - Ronoos BakeHub"
    
    # Get product names
    items = order.items.all()
    item_list = []
    print(f"Preparing email for Order #{order.id}. Found {items.count()} items.")
    
    for item in items:
        # Try to get name safely
        try:
             # Force refresh if needed or check IDs
             product_name = "Unknown Item"
             if item.product_variant:
                 product_name = f"{item.product.name} ({item.product_variant.label})"
             elif item.product:
                 product_name = item.product.name
             
             item_list.append(f"{product_name} x{item.quantity}")
        except Exception as e:
            print(f"Error processing item {item.id} for email: {e}")
            item_list.append(f"Item #{item.id} x{item.quantity}")

    if not item_list:
        product_summary = "your items"
    else:
        product_summary = ", ".join(item_list)
    
    print(f"Generated product summary: {product_summary}")
    
    if order.status == 'confirmed':
        message = f"""
Dear {order.user.name},

Great news! Your order including {product_summary} has been ACCEPTED by the builder.

We are now preparing your delicious items.
Total Amount: ₹{order.final_amount}

You can track your order status in the Ronoos BakeHub app.

Thank you for choosing us!
Ronoos BakeHub Team
        """
    elif order.status == 'cancelled':
        message = f"""
Dear {order.user.name},

We regret to inform you that your order for {product_summary} has been CANCELLED (Rejected).

If you have already made a payment, a refund will be processed shortly.

We apologize for the inconvenience.

Ronoos BakeHub Team
        """
    elif order.status == 'out_for_delivery':
        message = f"""
Dear {order.user.name},

Your order ({product_summary}) is now OUT FOR DELIVERY! 🚚

Get ready for some sweetness!

Ronoos BakeHub Team
        """
    elif order.status == 'completed':
         message = f"""
Dear {order.user.name},

Your order ({product_summary}) has been DELIVERED.

We hope you enjoy your treats! Please rate your experience in the app.

Ronoos BakeHub Team
        """
    else:
        # For other statuses, we might not send an email or just a generic one
        return

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[order.user.email],
            fail_silently=False,
        )
        print(f"Email sent to {order.user.email} for Order #{order.id} ({order.status})")
    except Exception as e:
        print(f"Failed to send email for Order #{order.id}: {e}")

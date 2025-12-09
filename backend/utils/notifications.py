from exponent_server_sdk import PushClient
from exponent_server_sdk import PushMessage
import logging

logger = logging.getLogger(__name__)

def send_push_notification(token, title, message, data=None):
    try:
        response = PushClient().publish(
            PushMessage(to=token,
                        body=message,
                        title=title,
                        data=data)
        )
    except Exception as exc:
        logger.error(f"Encountered some other error: {exc}")

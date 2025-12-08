import requests
import json

BASE_URL = 'http://localhost:8000/api'

def test_order():
    # 1. Login
    print("Logging in...")
    response = requests.post(f'{BASE_URL}/login/', data={'email': 'testuser2@example.com', 'password': 'password123'})
    if response.status_code != 200:
        print(f"Login failed: {response.text}")
        return
    
    token = response.json()['access']
    headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
    
    # 2. Get Product Variant
    # Assuming we have products from population script
    # We need a variant ID.
    # Let's just use ID 1 and hope it exists (from population script)
    
    # 3. Create Order
    print("Creating order...")
    order_data = {
        "delivery_type": "pickup",
        "delivery_date": "2025-12-01",
        "delivery_slot": "10:00-11:00 AM",
        "total_amount": 1200,
        "discount_amount": 0,
        "final_amount": 1200,
        "payment_status": "pending",
        "items": [
            {
                "product_id": 1,
                "product_variant_id": 1,
                "quantity": 1,
                "unit_price": 1200,
                "subtotal": 1200
            }
        ]
    }
    
    response = requests.post(f'{BASE_URL}/orders/', headers=headers, json=order_data)
    if response.status_code == 201:
        print("Order created successfully!")
        print(response.json())
    else:
        print(f"Order creation failed: {response.status_code}")
        try:
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(response.text, 'html.parser')
            exception = soup.find('pre', class_='exception_value')
            if exception:
                print(f"Exception: {exception.text}")
            else:
                print("Could not find exception value in HTML")
        except ImportError:
            print("bs4 not installed, printing raw text snippet")
            print(response.text[:500])

if __name__ == '__main__':
    test_order()

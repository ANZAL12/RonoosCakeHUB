import requests
import os

BASE_URL = 'http://localhost:8000/api'
IMAGE_PATH = r'C:\Users\USER\.gemini\antigravity\brain\8715c2b9-179e-4830-a0fd-2eb690a9aaa2\strawberry_cake_test_1763725171107.png'

def test_baker_flow():
    # 1. Login
    print("Logging in as baker...")
    response = requests.post(f'{BASE_URL}/users/login/', data={'email': 'baker@example.com', 'password': 'bakerpassword123'})
    if response.status_code != 200:
        print(f"Login failed: {response.text}")
        return
    
    token = response.json()['access']
    headers = {'Authorization': f'Bearer {token}'}
    
    # 2. Create Product
    print("Creating product...")
    product_data = {
        "name": "API Test Strawberry Cake",
        "description": "Created via API test script",
        "category": 1,
        "is_active": True,
        "is_customizable": False
    }
    response = requests.post(f'{BASE_URL}/catalog/baker/products/', headers=headers, json=product_data)
    if response.status_code != 201:
        print(f"Product creation failed: {response.status_code}")
        print(response.text)
        return
    
    product_id = response.json()['id']
    print(f"Product created: {product_id}")
    
    # 3. Create Variant
    print("Creating variant...")
    variant_data = {
        "label": "1 kg",
        "price": "1500.00",
        "preparation_hours": 24,
        "is_eggless": False
    }
    response = requests.post(f'{BASE_URL}/catalog/baker/products/{product_id}/variants/', headers=headers, json=variant_data)
    if response.status_code != 201:
        print(f"Variant creation failed: {response.status_code}")
        print(response.text)
    else:
        print("Variant created successfully")

    # 4. Upload Image
    print("Uploading image...")
    if os.path.exists(IMAGE_PATH):
        with open(IMAGE_PATH, 'rb') as f:
            files = {'image': f}
            data = {'is_primary': 'true'}
            response = requests.post(f'{BASE_URL}/catalog/baker/products/{product_id}/images/', headers=headers, files=files, data=data)
            if response.status_code != 201:
                print(f"Image upload failed: {response.status_code}")
                print(response.text)
            else:
                print("Image uploaded successfully")
                print(response.json())
    else:
        print(f"Image file not found: {IMAGE_PATH}")

if __name__ == '__main__':
    test_baker_flow()

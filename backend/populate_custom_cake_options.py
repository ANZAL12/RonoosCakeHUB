import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ronoos_backend.settings')
django.setup()

from catalog.models import CakeBase, CakeFlavour, CakeShape, CakeWeight

def populate():
    # Base
    bases = [
        {'name': 'Vanilla Sponge', 'price': 0},
        {'name': 'Chocolate Sponge', 'price': 50},
        {'name': 'Red Velvet', 'price': 100},
    ]
    for data in bases:
        CakeBase.objects.get_or_create(name=data['name'], defaults={'price': data['price']})
    print(f"Created {len(bases)} Bases")

    # Flavour
    flavours = [
        {'name': 'Vanilla Cream', 'price': 0},
        {'name': 'Chocolate Ganache', 'price': 50},
        {'name': 'Strawberry', 'price': 75},
        {'name': 'Butterscotch', 'price': 75},
    ]
    for data in flavours:
        CakeFlavour.objects.get_or_create(name=data['name'], defaults={'price': data['price']})
    print(f"Created {len(flavours)} Flavours")

    # Shape
    shapes = [
        {'name': 'Round', 'price': 0},
        {'name': 'Square', 'price': 0},
        {'name': 'Heart', 'price': 100},
        {'name': 'Custom Shape', 'price': 200},
    ]
    for data in shapes:
        CakeShape.objects.get_or_create(name=data['name'], defaults={'price': data['price']})
    print(f"Created {len(shapes)} Shapes")

    # Weight
    weights = [
        {'label': '500g', 'price': 0},
        {'label': '1kg', 'price': 200},
        {'label': '2kg', 'price': 500},
    ]
    for data in weights:
        CakeWeight.objects.get_or_create(label=data['label'], defaults={'price': data['price']})
    print(f"Created {len(weights)} Weights")

if __name__ == '__main__':
    populate()

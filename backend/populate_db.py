import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ronoos_backend.settings')
django.setup()

from catalog.models import Category, Product, ProductVariant, ProductImage

def populate():
    # Create Categories
    cakes, _ = Category.objects.get_or_create(name='Cakes', description='Delicious cakes')
    pastries, _ = Category.objects.get_or_create(name='Pastries', description='Tasty pastries')

    # Create Products
    chocolate_cake, _ = Product.objects.get_or_create(
        category=cakes,
        name='Chocolate Truffle Cake',
        description='Rich chocolate cake with truffle icing',
        is_customizable=True
    )
    
    vanilla_pastry, _ = Product.objects.get_or_create(
        category=pastries,
        name='Vanilla Pastry',
        description='Classic vanilla pastry',
        is_customizable=False
    )

    # Create Variants
    ProductVariant.objects.get_or_create(
        product=chocolate_cake,
        label='1 kg',
        price=1200.00,
        preparation_hours=24
    )
    
    ProductVariant.objects.get_or_create(
        product=chocolate_cake,
        label='500g',
        price=650.00,
        preparation_hours=24
    )

    ProductVariant.objects.get_or_create(
        product=vanilla_pastry,
        label='Single',
        price=80.00,
        preparation_hours=0
    )

    print("Database populated successfully!")

if __name__ == '__main__':
    populate()

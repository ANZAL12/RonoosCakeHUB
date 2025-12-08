from rest_framework import serializers
from .models import Category, Product, ProductVariant, ProductImage, CakeBase, CakeFlavour, CakeShape, CakeWeight

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_primary']

class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ['id', 'label', 'price', 'preparation_hours', 'is_eggless']

class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'image', 'category', 'category_name', 'images', 'variants', 'is_customizable']

    # Custom field to handle the main image logic similar to the frontend expectation
    image = serializers.SerializerMethodField()
    price = serializers.SerializerMethodField()

    def get_image(self, obj):
        # Return the primary image or the first image
        primary_image = obj.images.filter(is_primary=True).first()
        if primary_image:
            return primary_image.image.url # Assuming standard Django media handling
        first_image = obj.images.first()
        if first_image:
            return first_image.image.url
        return None

    def get_price(self, obj):
        # Return the lowest price from variants or a default
        if obj.variants.exists():
            return obj.variants.order_by('price').first().price
        return 0

class BakerProductSerializer(serializers.ModelSerializer):
    """
    Serializer for Baker to manage products.
    Includes 'is_active' and handles writing to 'price' and 'image'.
    """
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    # Write-only fields for simpler creation/update from mobile
    price = serializers.DecimalField(max_digits=10, decimal_places=2, write_only=True, required=False)
    image_url = serializers.URLField(write_only=True, required=False)
    image = serializers.ImageField(write_only=True, required=False)

    # Read-only fields for display
    display_price = serializers.SerializerMethodField()
    display_image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'image_url', 'image', 'display_price', 'display_image', 'category', 'category_name', 'images', 'variants', 'is_active', 'is_customizable']

    def get_display_price(self, obj):
        if obj.variants.exists():
            return obj.variants.order_by('price').first().price
        return 0

    def get_display_image(self, obj):
        primary_image = obj.images.filter(is_primary=True).first()
        if primary_image:
            if primary_image.image: return primary_image.image.url
            if primary_image.image_url: return primary_image.image_url
        first_image = obj.images.first()
        if first_image:
            if first_image.image: return first_image.image.url
            if first_image.image_url: return first_image.image_url
        return None
    
    def to_representation(self, instance):
        """Map display fields back to 'price' and 'image' for consistent API response"""
        data = super().to_representation(instance)
        data['price'] = data.pop('display_price')
        data['image'] = data.pop('display_image')
        return data

    def create(self, validated_data):
        price = validated_data.pop('price', None)
        image_url = validated_data.pop('image_url', None)
        image = validated_data.pop('image', None)
        
        product = Product.objects.create(**validated_data)
        
        if price is not None:
            # Create default variant
            ProductVariant.objects.create(product=product, label='Standard', price=price)
        
        if image:
             ProductImage.objects.create(product=product, image=image, is_primary=True)
        elif image_url:
            # Create default image
            ProductImage.objects.create(product=product, image_url=image_url, is_primary=True)
            
        return product

    def update(self, instance, validated_data):
        price = validated_data.pop('price', None)
        image_url = validated_data.pop('image_url', None)
        image = validated_data.pop('image', None)
        
        # Update standard product fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update Price (First Variant)
        if price is not None:
            variant = instance.variants.first()
            if variant:
                variant.price = price
                variant.save()
            else:
                ProductVariant.objects.create(product=instance, label='Standard', price=price)
        
        # Update Image (Primary Image)
        if image or image_url:
            # IDEALLY we should probably create a NEW image if one is uploaded, or replace the primary.
            # For simplicity let's update the existing primary if it exists, or create new.
            img = instance.images.filter(is_primary=True).first()
            
            if not img:
                 img = instance.images.first()
                 if img:
                     img.is_primary = True # promote to primary
            
            if img:
                if image:
                    img.image = image
                    img.image_url = None # clear URL if file provided
                elif image_url:
                    img.image_url = image_url
                    # Don't clear image file field necessarily? Or maybe we should? 
                    # If user pastes URL, let's assume they want that.
                
                img.save()
            else:
                if image:
                    ProductImage.objects.create(product=instance, image=image, is_primary=True)
                elif image_url:
                    ProductImage.objects.create(product=instance, image_url=image_url, is_primary=True)

        return instance

class CakeBaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = CakeBase
        fields = '__all__'

class CakeFlavourSerializer(serializers.ModelSerializer):
    class Meta:
        model = CakeFlavour
        fields = '__all__'

class CakeShapeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CakeShape
        fields = '__all__'

class CakeWeightSerializer(serializers.ModelSerializer):
    class Meta:
        model = CakeWeight
        fields = '__all__'

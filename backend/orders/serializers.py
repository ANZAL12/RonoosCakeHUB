from rest_framework import serializers
from .models import Order, OrderItem
from users.serializers import AddressSerializer, UserSerializer
from catalog.serializers import ProductSerializer, ProductVariantSerializer

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_variant = ProductVariantSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True, required=False)
    product_variant_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_id', 'product_variant', 'product_variant_id', 
                  'quantity', 'unit_price', 'subtotal', 'custom_cake_config', 'message_on_cake']
        read_only_fields = ['id', 'subtotal']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    delivery_address_detail = AddressSerializer(source='delivery_address', read_only=True)
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Order
        fields = ['id', 'user', 'status', 'delivery_type', 'delivery_address', 
                  'delivery_address_detail', 'delivery_date', 'delivery_slot', 
                  'total_amount', 'discount_amount', 'final_amount', 'payment_status', 
                  'payment_reference', 'created_at', 'updated_at', 'items']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

class OrderCreateSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    
    class Meta:
        model = Order
        fields = ['delivery_type', 'delivery_address', 'delivery_date', 'delivery_slot', 
                  'total_amount', 'discount_amount', 'final_amount', 'payment_status', 
                  'payment_reference', 'items']
        extra_kwargs = {
            'delivery_address': {'required': False, 'allow_null': True},
            'payment_reference': {'required': False, 'allow_blank': True},
        }
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)
        
        for item_data in items_data:
            # Calculate subtotal if not present (it's read-only in serializer)
            if 'subtotal' not in item_data:
                quantity = item_data.get('quantity', 1)
                unit_price = item_data.get('unit_price', 0)
                item_data['subtotal'] = quantity * unit_price
            
            OrderItem.objects.create(order=order, **item_data)
        
        return order

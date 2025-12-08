from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import models
from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderCreateSerializer
from catalog.models import Product, ProductVariant

class OrderViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'baker':
            queryset = Order.objects.all()
        else:
            queryset = Order.objects.filter(user=user)
            
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
            
        return queryset.prefetch_related('items', 'items__product', 'items__product_variant')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Return the full order details using OrderSerializer
        # We need to fetch the instance again or use the one from perform_create if it returned it
        # Since perform_create in DRF doesn't return, we rely on serializer.instance
        headers = self.get_success_headers(serializer.data)
        
        # Use the read serializer for the response
        read_serializer = OrderSerializer(serializer.instance)
        return Response(read_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def preview(self, request):
        """Calculate order totals with optional coupon"""
        items = request.data.get('items', [])
        coupon_code = request.data.get('coupon_code')
        
        total_amount = 0
        line_items = []
        
        for item in items:
            product_id = item.get('product_id')
            variant_id = item.get('product_variant_id')
            quantity = item.get('quantity', 1)
            
            if variant_id:
                variant = ProductVariant.objects.get(id=variant_id)
                unit_price = variant.price
                product_name = f"{variant.product.name} - {variant.label}"
            elif product_id:
                product = Product.objects.get(id=product_id)
                # For custom cakes, calculate price based on custom_config
                unit_price = 0  # TODO: Implement custom cake price calculation
                product_name = product.name
            else:
                continue
            
            subtotal = unit_price * quantity
            total_amount += subtotal
            
            line_items.append({
                'product_name': product_name,
                'quantity': quantity,
                'unit_price': str(unit_price),
                'subtotal': str(subtotal)
            })
        
        discount_amount = 0
        # TODO: Implement coupon validation
        
        final_amount = total_amount - discount_amount
        
        return Response({
            'items': line_items,
            'total_amount': str(total_amount),
            'discount_amount': str(discount_amount),
            'final_amount': str(final_amount)
        })
    
    @action(detail=True, methods=['patch'], url_path='status')
    def update_status(self, request, pk=None):
        """Update order status (baker only)"""
        if request.user.role != 'baker':
            return Response({'error': 'Only bakers can update order status'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        order = self.get_object()
        new_status = request.data.get('status')
        
        # Validate status progression
        valid_statuses = ['pending', 'confirmed', 'in_kitchen', 'ready', 
                         'out_for_delivery', 'completed', 'cancelled']
        
        if new_status not in valid_statuses:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
        order.status = new_status
        order.save()
        
        serializer = self.get_serializer(order)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'], url_path='payment-status')
    def update_payment_status(self, request, pk=None):
        """Update payment status (baker only)"""
        if request.user.role != 'baker':
            return Response({'error': 'Only bakers can update payment status'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        order = self.get_object()
        new_status = request.data.get('payment_status')
        
        valid_statuses = ['pending', 'paid', 'failed', 'refunded']
        
        if new_status not in valid_statuses:
            return Response({'error': 'Invalid payment status'}, status=status.HTTP_400_BAD_REQUEST)
        
        order.payment_status = new_status
        order.save()
        
        serializer = self.get_serializer(order)
        return Response(serializer.data)

class AnalyticsViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        if request.user.role != 'baker':
            return Response({'error': 'Only bakers can view analytics'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        orders = Order.objects.all()
        
        # Key Metrics
        total_revenue = orders.filter(payment_status='paid').aggregate(
            total=models.Sum('final_amount'))['total'] or 0
        
        total_orders = orders.count()
        
        avg_order_value = 0
        if total_orders > 0:
            avg_order_value = total_revenue / total_orders
            
        # Sales Trend (Last 7 days)
        from django.utils import timezone
        from datetime import timedelta
        from django.db.models.functions import TruncDate
        
        last_7_days = timezone.now() - timedelta(days=7)
        sales_trend = orders.filter(
            created_at__gte=last_7_days, 
            payment_status='paid'
        ).annotate(
            date=TruncDate('created_at')
        ).values('date').annotate(
            daily_revenue=models.Sum('final_amount'),
            order_count=models.Count('id')
        ).order_by('date')
        
        # Top Products
        top_products = OrderItem.objects.filter(
            order__payment_status='paid'
        ).values(
            'product__name'
        ).annotate(
            total_sold=models.Sum('quantity'),
            revenue=models.Sum('subtotal')
        ).order_by('-total_sold')[:5]
        
        # Frequent Buyers
        top_customers = orders.filter(
            payment_status='paid'
        ).values(
            'user__name', 'user__email'
        ).annotate(
            orders_placed=models.Count('id'),
            total_spent=models.Sum('final_amount')
        ).order_by('-total_spent')[:5]
        
        return Response({
            'total_revenue': total_revenue,
            'total_orders': total_orders,
            'avg_order_value': avg_order_value,
            'sales_trend': sales_trend,
            'top_products': top_products,
            'top_customers': top_customers
        })

from django.contrib import admin
from .models import Order, OrderItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('subtotal',)

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'status', 'total_amount', 'created_at')
    list_filter = ('status', 'payment_status', 'delivery_type', 'created_at')
    search_fields = ('id', 'user__email', 'user__name')
    inlines = [OrderItemInline]
    readonly_fields = ('created_at', 'updated_at')

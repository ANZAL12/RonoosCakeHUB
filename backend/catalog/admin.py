from django.contrib import admin
from .models import Category, Product, ProductVariant, ProductImage, CakeBase, CakeFlavour, CakeShape, CakeWeight

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active')
    prepopulated_fields = {'slug': ('name',)}

class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'is_active', 'is_customizable')
    list_filter = ('category', 'is_active')
    search_fields = ('name', 'description')
    inlines = [ProductVariantInline, ProductImageInline]

admin.site.register(CakeBase)
admin.site.register(CakeFlavour)
admin.site.register(CakeShape)
admin.site.register(CakeWeight)

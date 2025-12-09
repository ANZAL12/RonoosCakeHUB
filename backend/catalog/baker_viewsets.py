from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Category, Product, ProductVariant, ProductImage
from .serializers import (CategorySerializer, ProductSerializer, BakerProductSerializer,
                         ProductVariantSerializer, ProductImageSerializer)

class IsBaker(IsAuthenticated):
    """Permission class to check if user is a baker"""
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role == 'baker'

class BakerProductViewSet(viewsets.ModelViewSet):
    """Baker-only product management"""
    permission_classes = [IsBaker]
    queryset = Product.objects.all().prefetch_related('variants', 'images')
    serializer_class = BakerProductSerializer
    ordering = ['-id']
    
    @action(detail=True, methods=['post'], url_path='variants')
    def add_variant(self, request, pk=None):
        """Add a variant to a product"""
        product = self.get_object()
        serializer = ProductVariantSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(product=product)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], url_path='images')
    def add_image(self, request, pk=None):
        """Add an image to a product"""
        product = self.get_object()
        serializer = ProductImageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(product=product)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class BakerVariantViewSet(viewsets.ModelViewSet):
    """Baker-only variant management"""
    permission_classes = [IsBaker]
    queryset = ProductVariant.objects.all()
    serializer_class = ProductVariantSerializer

class BakerImageViewSet(viewsets.ModelViewSet):
    """Baker-only image management"""
    permission_classes = [IsBaker]
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer
    
    def perform_create(self, serializer):
        """Ensure the product is set when creating an image"""
        serializer.save()


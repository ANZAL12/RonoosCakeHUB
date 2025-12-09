from rest_framework import viewsets, permissions
from .models import Category, Product, ProductVariant, ProductImage, CakeBase, CakeFlavour, CakeShape, CakeWeight
from .serializers import (
    CategorySerializer, ProductSerializer, ProductVariantSerializer, ProductImageSerializer,
    CakeBaseSerializer, CakeFlavourSerializer, CakeShapeSerializer, CakeWeightSerializer
)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    authentication_classes = []

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    authentication_classes = []

class ProductVariantViewSet(viewsets.ModelViewSet):
    queryset = ProductVariant.objects.all()
    serializer_class = ProductVariantSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    authentication_classes = []

class ProductImageViewSet(viewsets.ModelViewSet):
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    authentication_classes = []

class CakeBaseViewSet(viewsets.ModelViewSet):
    queryset = CakeBase.objects.filter(is_active=True)
    serializer_class = CakeBaseSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    authentication_classes = []

class CakeFlavourViewSet(viewsets.ModelViewSet):
    queryset = CakeFlavour.objects.filter(is_active=True)
    serializer_class = CakeFlavourSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    authentication_classes = []

class CakeShapeViewSet(viewsets.ModelViewSet):
    queryset = CakeShape.objects.filter(is_active=True)
    serializer_class = CakeShapeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    authentication_classes = []

class CakeWeightViewSet(viewsets.ModelViewSet):
    queryset = CakeWeight.objects.filter(is_active=True)
    serializer_class = CakeWeightSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    authentication_classes = []

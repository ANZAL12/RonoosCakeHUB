from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .viewsets import CategoryViewSet, ProductViewSet, ProductVariantViewSet, ProductImageViewSet, CakeBaseViewSet, CakeFlavourViewSet, CakeShapeViewSet, CakeWeightViewSet
from .baker_viewsets import BakerProductViewSet, BakerVariantViewSet, BakerImageViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet)
router.register(r'variants', ProductVariantViewSet)
router.register(r'images', ProductImageViewSet)
router.register(r'cake-bases', CakeBaseViewSet)
router.register(r'cake-flavours', CakeFlavourViewSet)
router.register(r'cake-shapes', CakeShapeViewSet)
router.register(r'cake-weights', CakeWeightViewSet)
router.register(r'baker/products', BakerProductViewSet, basename='baker-product')
router.register(r'baker/variants', BakerVariantViewSet, basename='baker-variant')
router.register(r'baker/images', BakerImageViewSet, basename='baker-image')

urlpatterns = [
    path('', include(router.urls)),
]

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .viewsets import OrderViewSet, AnalyticsViewSet

router = DefaultRouter()
router.register(r'analytics', AnalyticsViewSet, basename='analytics')
router.register(r'', OrderViewSet, basename='order')

urlpatterns = [
    path('', include(router.urls)),
]

from django.urls import path
from .views import CustomCakeOptionsView, CustomCakePriceView

urlpatterns = [
    path('custom-cake/options/', CustomCakeOptionsView.as_view(), name='custom-cake-options'),
    path('custom-cake/price/', CustomCakePriceView.as_view(), name='custom-cake-price'),
]

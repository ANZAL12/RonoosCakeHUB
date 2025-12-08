from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import CustomCakeOption
from decimal import Decimal

class CustomCakeOptionsView(APIView):
    """Get all custom cake options grouped by type"""
    def get(self, request):
        options = CustomCakeOption.objects.all()
        grouped = {}
        
        for option in options:
            if option.type not in grouped:
                grouped[option.type] = []
            grouped[option.type].append({
                'id': option.id,
                'label': option.label,
                'extra_price': str(option.extra_price)
            })
        
        return Response(grouped)

class CustomCakePriceView(APIView):
    """Calculate custom cake price based on selected options"""
    def post(self, request):
        option_ids = request.data.get('options', [])
        base_price = Decimal('500.00')  # Base price for custom cake
        
        total_price = base_price
        for option_id in option_ids:
            try:
                option = CustomCakeOption.objects.get(id=option_id)
                total_price += option.extra_price
            except CustomCakeOption.DoesNotExist:
                pass
        
        return Response({
            'base_price': str(base_price),
            'total_price': str(total_price),
            'options_count': len(option_ids)
        })

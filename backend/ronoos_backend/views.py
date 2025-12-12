from django.http import JsonResponse

def health_check(request):
    """
    Simple health check endpoint to keep the service alive or verify status.
    """
    return JsonResponse({'status': 'ok'})

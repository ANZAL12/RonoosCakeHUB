"""
URL configuration for ronoos_backend project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/catalog/', include('catalog.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/coupons/', include('coupons.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Force media serving on Render (for demo purposes)
from django.urls import re_path
from django.views.static import serve
if not settings.DEBUG:
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    ]

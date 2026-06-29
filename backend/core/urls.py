"""
URL configuration for core project.
...
"""
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/v1/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/v1/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    path('api/v1/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/v1/accounts/', include('apps.accounts.urls')),
    path('api/v1/farms/', include('apps.farms.urls')),
    path('api/v1/locations/', include('apps.locations.urls')),
    path('api/v1/animals/', include('apps.animals.urls')),
    path('api/v1/lots/', include('apps.lots.urls')),
    path('api/v1/health/', include('apps.health.urls')),
    path('api/v1/rfid/', include('apps.rfid.urls')),
    path('api/v1/dashboard/', include('apps.dashboard.urls')),
    path('api/v1/movements/', include('apps.movements.urls')),
    path('api/v1/finance/', include('apps.finance.urls')),
    path('api/v1/weights/', include('apps.weights.urls')),
]
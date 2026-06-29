from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LotViewSet

router = DefaultRouter()
router.register(r'', LotViewSet, basename='lot')

urlpatterns = [
    path('', include(router.urls)),
]

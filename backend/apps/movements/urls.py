from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MovementViewSet

router = DefaultRouter()
router.register(r'', MovementViewSet, basename='movement')

urlpatterns = [
    path('', include(router.urls)),
]

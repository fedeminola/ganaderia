from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WeightMeasurementViewSet

router = DefaultRouter()
router.register(r'measurements', WeightMeasurementViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

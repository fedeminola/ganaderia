from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    VaccineViewSet,
    TreatmentViewSet,
    HealthProtocolViewSet,
    ScheduledHealthEventViewSet,
    ApplyTreatmentView,
)

router = DefaultRouter()
router.register(r'vaccines', VaccineViewSet, basename='vaccine')
router.register(r'treatments', TreatmentViewSet, basename='treatment')
router.register(r'protocols', HealthProtocolViewSet, basename='healthprotocol')
router.register(r'scheduled-events', ScheduledHealthEventViewSet, basename='scheduledhealthevent')

urlpatterns = [
    path('', include(router.urls)),
    path('apply-treatment/', ApplyTreatmentView.as_view(), name='apply-treatment'),
]

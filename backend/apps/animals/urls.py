from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AnimalViewSet, SpeciesViewSet, CategoryViewSet, MissingAlertViewSet, AnimalEventViewSet

router = DefaultRouter()
router.register(r'species', SpeciesViewSet, basename='species')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'alerts', MissingAlertViewSet, basename='missing-alert')
router.register(r'events', AnimalEventViewSet, basename='animal-event')
router.register(r'', AnimalViewSet, basename='animal')

urlpatterns = [
    path('', include(router.urls)),
]

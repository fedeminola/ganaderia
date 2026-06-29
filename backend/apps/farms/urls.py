from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FarmViewSet, MembershipViewSet

router = DefaultRouter()
router.register(r'farms', FarmViewSet)
router.register(r'memberships', MembershipViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

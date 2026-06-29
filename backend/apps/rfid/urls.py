from django.urls import path
from .views import RfidSyncView

urlpatterns = [
    path('sync/', RfidSyncView.as_view(), name='rfid-sync'),
]

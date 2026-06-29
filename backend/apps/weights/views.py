from rest_framework import viewsets, permissions
from .models import WeightMeasurement
from .serializers import WeightMeasurementSerializer

class WeightMeasurementViewSet(viewsets.ModelViewSet):
    queryset = WeightMeasurement.objects.all()
    serializer_class = WeightMeasurementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return WeightMeasurement.objects.filter(animal__farm__in=user.farms.all())

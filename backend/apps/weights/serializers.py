from rest_framework import serializers
from .models import WeightMeasurement
from ..animals.models import Animal, AnimalEvent
from django.utils import timezone

class WeightMeasurementSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeightMeasurement
        fields = '__all__'

    def create(self, validated_data):
        measurement = super().create(validated_data)
        
        # Automatically create an AnimalEvent of type WEIGHING
        AnimalEvent.objects.create(
            animal=measurement.animal,
            type=AnimalEvent.EventType.WEIGHING,
            timestamp=measurement.measurement_date or timezone.now(),
            metadata={
                "weight": float(measurement.weight),
                "measurement_id": str(measurement.id)
            }
        )
        return measurement

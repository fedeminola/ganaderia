from rest_framework import serializers
from .models import Vaccine, Treatment, HealthProtocol, ScheduledHealthEvent

class VaccineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vaccine
        fields = "__all__"

class TreatmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Treatment
        fields = "__all__"

class HealthProtocolSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthProtocol
        fields = "__all__"

class ScheduledHealthEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScheduledHealthEvent
        fields = "__all__"

class ApplyTreatmentSerializer(serializers.Serializer):
    animal_ids = serializers.ListField(
        child=serializers.UUIDField(), required=True
    )
    treatment_id = serializers.UUIDField(required=False, allow_null=True)
    vaccine_id = serializers.UUIDField(required=False, allow_null=True)
    date = serializers.DateField()
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate(self, data):
        if not data.get('treatment_id') and not data.get('vaccine_id'):
            raise serializers.ValidationError("Either 'treatment_id' or 'vaccine_id' must be provided.")
        if data.get('treatment_id') and data.get('vaccine_id'):
            raise serializers.ValidationError("Provide either 'treatment_id' or 'vaccine_id', not both.")
        return data

from rest_framework_gis.fields import GeometryField
from rest_framework import serializers
from .models import Location

class LocationSerializer(serializers.ModelSerializer):
    polygon = GeometryField(required=False, allow_null=True)
    animal_count = serializers.SerializerMethodField()

    class Meta:
        model = Location
        fields = [
            "id",
            "farm",
            "name",
            "type",
            "polygon",
            "manual_area_hectares",
            "calculated_area_hectares",
            "active",
            "animal_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ("id", "calculated_area_hectares", "created_at", "updated_at", "animal_count")

    def get_animal_count(self, obj):
        from apps.animals.models import Animal
        return Animal.objects.filter(current_location=obj, status='active').count()

    def validate(self, data):
        """
        Check that either polygon or manual_area_hectares is provided, but not both.
        """
        if not data.get("polygon") and not data.get("manual_area_hectares"):
            raise serializers.ValidationError("Either 'polygon' or 'manual_area_hectares' must be provided.")
        return data

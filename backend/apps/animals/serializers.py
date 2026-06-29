from rest_framework import serializers
from .models import Animal, AnimalEvent, Species, Category, MissingAlert

class MissingAlertSerializer(serializers.ModelSerializer):
    animal_rfid = serializers.ReadOnlyField(source='animal.rfid')
    location_name = serializers.ReadOnlyField(source='location.name')

    class Meta:
        model = MissingAlert
        fields = "__all__"

class SpeciesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Species
        fields = ["id", "farm", "name"]
        read_only_fields = ("id",)

class CategorySerializer(serializers.ModelSerializer):
    species_name = serializers.ReadOnlyField(source='species.name')

    class Meta:
        model = Category
        fields = ["id", "farm", "species", "species_name", "name"]
        read_only_fields = ("id",)

class AnimalEventSerializer(serializers.ModelSerializer):
    animal_rfid = serializers.ReadOnlyField(source='animal.rfid')
    animal_internal_number = serializers.ReadOnlyField(source='animal.internal_number')
    user_name = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = AnimalEvent
        fields = "__all__"

class AnimalSerializer(serializers.ModelSerializer):
    animal_events = AnimalEventSerializer(many=True, read_only=True)

    class Meta:
        model = Animal
        fields = [
            "id",
            "farm",
            "rfid",
            "visual_tag",
            "internal_number",
            "species",
            "category",
            "sex",
            "birth_date",
            "status",
            "current_location",
            "current_lot",
            "mother",
            "notes",
            "created_by",
            "updated_by",
            "created_at",
            "updated_at",
            "animal_events",
        ]
        read_only_fields = (
            "id",
            "created_by",
            "updated_by",
            "created_at",
            "updated_at",
            "animal_events",
        )

    def validate(self, data):
        farm = data.get('farm')
        rfid = data.get('rfid')
        internal_number = data.get('internal_number')

        if not self.instance:
            # Create
            if Animal.objects.filter(farm=farm, rfid=rfid).exists():
                raise serializers.ValidationError({"rfid": "An animal with this RFID already exists in this farm."})
            if internal_number and Animal.objects.filter(farm=farm, internal_number=internal_number).exists():
                raise serializers.ValidationError({"internal_number": "An animal with this internal number already exists in this farm."})
        else:
            # Update
            if rfid and rfid != self.instance.rfid:
                if Animal.objects.filter(farm=self.instance.farm, rfid=rfid).exists():
                    raise serializers.ValidationError({"rfid": "An animal with this RFID already exists in this farm."})
            if internal_number and internal_number != self.instance.internal_number:
                if Animal.objects.filter(farm=self.instance.farm, internal_number=internal_number).exists():
                    raise serializers.ValidationError({"internal_number": "An animal with this internal number already exists in this farm."})
        
        return data

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data['updated_by'] = self.context['request'].user
        return super().update(instance, validated_data)

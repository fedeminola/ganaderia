from rest_framework import serializers
from .models import Movement, MovementAnimal
from ..animals.serializers import AnimalSerializer

class MovementAnimalSerializer(serializers.ModelSerializer):
    animal = AnimalSerializer(read_only=True)

    class Meta:
        model = MovementAnimal
        fields = ["animal"]

class MovementSerializer(serializers.ModelSerializer):
    animals_involved = MovementAnimalSerializer(many=True, read_only=True)
    animal_ids = serializers.ListField(
        child=serializers.UUIDField(), write_only=True
    )

    class Meta:
        model = Movement
        fields = [
            "id",
            "farm",
            "user",
            "origin",
            "destination",
            "timestamp",
            "notes",
            "created_at",
            "animals_involved",
            "animal_ids",
        ]
        read_only_fields = ("id", "user", "created_at", "animals_involved")

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

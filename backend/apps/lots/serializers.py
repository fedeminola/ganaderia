from rest_framework import serializers
from .models import Lot, LotMembership
from ..animals.serializers import AnimalSerializer

class LotMembershipSerializer(serializers.ModelSerializer):
    animal = AnimalSerializer(read_only=True)
    animal_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = LotMembership
        fields = ["id", "lot", "animal", "animal_id", "date_joined"]
        read_only_fields = ("id", "lot", "date_joined")

class LotSerializer(serializers.ModelSerializer):
    memberships = LotMembershipSerializer(many=True, read_only=True)
    
    class Meta:
        model = Lot
        fields = [
            "id",
            "farm",
            "name",
            "description",
            "created_at",
            "updated_at",
            "memberships",
        ]
        read_only_fields = ("id", "created_at", "updated_at", "memberships")

from rest_framework import serializers
from .models import Farm, Membership

class FarmSerializer(serializers.ModelSerializer):
    class Meta:
        model = Farm
        fields = (
            'id', 
            'name', 
            'owner',
            'rfid_service_uuid',
            'rfid_characteristic_uuid'
        )

class MembershipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Membership
        fields = ('id', 'user', 'farm', 'role')
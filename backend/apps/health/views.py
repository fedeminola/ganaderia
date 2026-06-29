from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import transaction
from .models import Vaccine, Treatment, HealthProtocol, ScheduledHealthEvent
from ..animals.models import Animal, AnimalEvent
from .serializers import (
    VaccineSerializer,
    TreatmentSerializer,
    HealthProtocolSerializer,
    ScheduledHealthEventSerializer,
    ApplyTreatmentSerializer,
)

class IsFarmMember(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.farms.filter(pk=obj.farm.pk).exists()

class VaccineViewSet(viewsets.ModelViewSet):
    queryset = Vaccine.objects.all()
    serializer_class = VaccineSerializer
    permission_classes = [permissions.IsAuthenticated, IsFarmMember]

    def get_queryset(self):
        user = self.request.user
        return Vaccine.objects.filter(farm__in=user.farms.all())

class TreatmentViewSet(viewsets.ModelViewSet):
    queryset = Treatment.objects.all()
    serializer_class = TreatmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsFarmMember]

    def get_queryset(self):
        user = self.request.user
        return Treatment.objects.filter(farm__in=user.farms.all())

class HealthProtocolViewSet(viewsets.ModelViewSet):
    queryset = HealthProtocol.objects.all()
    serializer_class = HealthProtocolSerializer
    permission_classes = [permissions.IsAuthenticated, IsFarmMember]

    def get_queryset(self):
        user = self.request.user
        return HealthProtocol.objects.filter(farm__in=user.farms.all())

class ScheduledHealthEventViewSet(viewsets.ModelViewSet):
    queryset = ScheduledHealthEvent.objects.all()
    serializer_class = ScheduledHealthEventSerializer
    permission_classes = [permissions.IsAuthenticated] # Permissions checked via animal

    def get_queryset(self):
        user = self.request.user
        return ScheduledHealthEvent.objects.filter(animal__farm__in=user.farms.all())

class ApplyTreatmentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = ApplyTreatmentSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            animal_ids = data['animal_ids']
            
            with transaction.atomic():
                animals = Animal.objects.filter(id__in=animal_ids)
                # Basic permission check: ensure all animals belong to user's farms
                user_farms = request.user.farms.all()
                for animal in animals:
                    if animal.farm not in user_farms:
                        return Response({"error": f"You do not have permission for animal {animal.id}"}, status=status.HTTP_403_FORBIDDEN)

                event_type = None
                event_metadata = {}

                if data.get('vaccine_id'):
                    event_type = AnimalEvent.EventType.VACCINATION
                    vaccine = Vaccine.objects.get(id=data['vaccine_id'])
                    event_metadata = {"vaccine_id": str(vaccine.id), "vaccine_name": vaccine.name}
                
                elif data.get('treatment_id'):
                    event_type = AnimalEvent.EventType.TREATMENT
                    treatment = Treatment.objects.get(id=data['treatment_id'])
                    event_metadata = {"treatment_id": str(treatment.id), "treatment_name": treatment.name}
                
                event_metadata["notes"] = data.get("notes", "")

                for animal in animals:
                    AnimalEvent.objects.create(
                        animal=animal,
                        type=event_type,
                        timestamp=data['date'],
                        user=request.user,
                        metadata=event_metadata
                    )

            return Response({"status": "Treatment applied successfully"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

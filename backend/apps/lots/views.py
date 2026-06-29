from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Lot, LotMembership
from ..animals.models import Animal
from .serializers import LotSerializer, LotMembershipSerializer

class IsFarmMember(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.farms.filter(pk=obj.farm.pk).exists()

class LotViewSet(viewsets.ModelViewSet):
    queryset = Lot.objects.all().prefetch_related('memberships__animal')
    serializer_class = LotSerializer
    permission_classes = [permissions.IsAuthenticated, IsFarmMember]

    def get_queryset(self):
        user = self.request.user
        queryset = Lot.objects.filter(farm__in=user.farms.all())
        farm_id = self.request.query_params.get('farm')
        if farm_id:
            queryset = queryset.filter(farm_id=farm_id)
        return queryset

    def perform_create(self, serializer):
        farm = serializer.validated_data['farm']
        if not self.request.user.farms.filter(pk=farm.pk).exists():
            raise permissions.PermissionDenied("You are not a member of this farm.")
        serializer.save()

    @action(detail=True, methods=['post'], url_path='add-animals')
    def add_animals(self, request, pk=None):
        lot = self.get_object()
        animal_ids = request.data.get('animal_ids', [])

        if not animal_ids:
            return Response({"error": "animal_ids must be provided"}, status=status.HTTP_400_BAD_REQUEST)

        animals_to_add = Animal.objects.filter(id__in=animal_ids, farm=lot.farm)
        
        if animals_to_add.count() != len(animal_ids):
             return Response({"error": "One or more animals not found or do not belong to this farm."}, status=status.HTTP_400_BAD_REQUEST)

        for animal in animals_to_add:
            LotMembership.objects.get_or_create(lot=lot, animal=animal)
            animal.current_lot = lot
            animal.save()

            # Register event
            from ..animals.models import AnimalEvent
            from django.utils import timezone
            AnimalEvent.objects.create(
                animal=animal,
                type=AnimalEvent.EventType.MOVEMENT,
                timestamp=timezone.now(),
                user=self.request.user,
                metadata={
                    "info": f"Added to lot: {lot.name}",
                    "lot_id": str(lot.id)
                }
            )

        return Response({"status": "animals added"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='remove-animals')
    def remove_animals(self, request, pk=None):
        lot = self.get_object()
        animal_ids = request.data.get('animal_ids', [])

        if not animal_ids:
            return Response({"error": "animal_ids must be provided"}, status=status.HTTP_400_BAD_REQUEST)

        memberships = LotMembership.objects.filter(lot=lot, animal_id__in=animal_ids)
        
        for membership in memberships:
            animal = membership.animal
            animal.current_lot = None
            animal.save()

            # Register event
            from ..animals.models import AnimalEvent
            from django.utils import timezone
            AnimalEvent.objects.create(
                animal=animal,
                type=AnimalEvent.EventType.MOVEMENT,
                timestamp=timezone.now(),
                user=self.request.user,
                metadata={
                    "info": f"Removed from lot: {lot.name}",
                    "lot_id": str(lot.id)
                }
            )

        memberships.delete()

        return Response({"status": "animals removed"}, status=status.HTTP_200_OK)

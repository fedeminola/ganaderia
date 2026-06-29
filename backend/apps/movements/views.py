from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django.db import transaction
from .models import Movement, MovementAnimal
from ..animals.models import Animal, AnimalEvent
from .serializers import MovementSerializer

class IsFarmMember(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.farms.filter(pk=obj.farm.pk).exists()

class MovementViewSet(viewsets.ModelViewSet):
    queryset = Movement.objects.all().prefetch_related('animals_involved__animal')
    serializer_class = MovementSerializer
    permission_classes = [permissions.IsAuthenticated, IsFarmMember]

    def get_queryset(self):
        user = self.request.user
        queryset = Movement.objects.filter(farm__in=user.farms.all())
        farm_id = self.request.query_params.get('farm')
        if farm_id:
            queryset = queryset.filter(farm_id=farm_id)
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        farm = serializer.validated_data['farm']
        if not self.request.user.farms.filter(pk=farm.pk).exists():
            raise permissions.PermissionDenied("You are not a member of this farm.")

        animal_ids = serializer.validated_data.pop('animal_ids')
        
        with transaction.atomic():
            movement = serializer.save(user=self.request.user)
            
            animals_to_move = Animal.objects.filter(id__in=animal_ids, farm=farm)

            if animals_to_move.count() != len(animal_ids):
                raise serializers.ValidationError("One or more animals not found or do not belong to this farm.")

            for animal in animals_to_move:
                # Create the link between movement and animal
                MovementAnimal.objects.create(movement=movement, animal=animal)
                
                # Update animal's current location
                animal.current_location = movement.destination
                animal.save()

                # Create an event for the animal's history
                AnimalEvent.objects.create(
                    animal=animal,
                    type=AnimalEvent.EventType.MOVEMENT,
                    timestamp=movement.timestamp,
                    user=self.request.user,
                    metadata={
                        "from_location_id": str(movement.origin.id) if movement.origin else None,
                        "to_location_id": str(movement.destination.id),
                        "movement_id": str(movement.id)
                    }
                )
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        # This method is overridden by create, so we just need to save the instance
        serializer.save()
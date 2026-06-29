from rest_framework import viewsets, permissions
from .models import Animal, Species, Category, MissingAlert, AnimalEvent
from .serializers import AnimalSerializer, SpeciesSerializer, CategorySerializer, MissingAlertSerializer, AnimalEventSerializer

class IsFarmMember(permissions.BasePermission):
    """
    Custom permission to only allow members of a farm to see its animals.
    """
    def has_object_permission(self, request, view, obj):
        # Handle cases where object has 'farm' or 'animal.farm'
        farm = getattr(obj, 'farm', None)
        if not farm and hasattr(obj, 'animal'):
            farm = obj.animal.farm
            
        if not farm:
            return False
            
        return request.user.farms.filter(pk=farm.pk).exists()

class MissingAlertViewSet(viewsets.ModelViewSet):
    queryset = MissingAlert.objects.all()
    serializer_class = MissingAlertSerializer
    permission_classes = [permissions.IsAuthenticated, IsFarmMember]

    def get_queryset(self):
        return MissingAlert.objects.filter(animal__farm__in=self.request.user.farms.all())

class AnimalEventViewSet(viewsets.ModelViewSet):
    queryset = AnimalEvent.objects.all()
    serializer_class = AnimalEventSerializer
    permission_classes = [permissions.IsAuthenticated, IsFarmMember]

    def get_queryset(self):
        user = self.request.user
        queryset = AnimalEvent.objects.filter(animal__farm__in=user.farms.all())
        farm_id = self.request.query_params.get('farm')
        if farm_id:
            queryset = queryset.filter(animal__farm_id=farm_id)
        return queryset

class AnimalViewSet(viewsets.ModelViewSet):
    queryset = Animal.objects.all().order_by('internal_number')
    serializer_class = AnimalSerializer
    permission_classes = [permissions.IsAuthenticated, IsFarmMember]

    def get_queryset(self):
        user = self.request.user
        queryset = Animal.objects.filter(farm__in=user.farms.all())
        farm_id = self.request.query_params.get('farm')
        if farm_id:
            queryset = queryset.filter(farm_id=farm_id)
        
        search = self.request.query_params.get('search')
        if search:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(rfid__icontains=search) | 
                Q(visual_tag__icontains=search) | 
                Q(internal_number__icontains=search)
            )
            
        return queryset

    def perform_create(self, serializer):
        farm = serializer.validated_data['farm']
        if not self.request.user.farms.filter(pk=farm.pk).exists():
            raise permissions.PermissionDenied("You are not a member of this farm.")
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        self.check_object_permissions(self.request, serializer.instance)
        serializer.save(updated_by=self.request.user)

class SpeciesViewSet(viewsets.ModelViewSet):
    queryset = Species.objects.all()
    serializer_class = SpeciesSerializer
    permission_classes = [permissions.IsAuthenticated, IsFarmMember]

    def get_queryset(self):
        return Species.objects.filter(farm__in=self.request.user.farms.all())

    def perform_create(self, serializer):
        farm = serializer.validated_data['farm']
        if not self.request.user.farms.filter(pk=farm.pk).exists():
            raise permissions.PermissionDenied("You are not a member of this farm.")
        serializer.save()

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated, IsFarmMember]

    def get_queryset(self):
        return Category.objects.filter(farm__in=self.request.user.farms.all())

    def perform_create(self, serializer):
        farm = serializer.validated_data['farm']
        if not self.request.user.farms.filter(pk=farm.pk).exists():
            raise permissions.PermissionDenied("You are not a member of this farm.")
        serializer.save()

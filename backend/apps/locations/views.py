from rest_framework import viewsets, permissions
from .models import Location
from .serializers import LocationSerializer

class IsFarmMember(permissions.BasePermission):
    """
    Custom permission to only allow members of a farm to see its locations.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return request.user.farms.filter(pk=obj.farm.pk).exists()
        # Write permissions are only allowed to the owner of the snippet.
        return request.user.farms.filter(pk=obj.farm.pk).exists()

class LocationViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows locations to be viewed or edited.
    """
    queryset = Location.objects.all().order_by('name')
    serializer_class = LocationSerializer
    permission_classes = [permissions.IsAuthenticated, IsFarmMember]

    def get_queryset(self):
        """
        This view should return a list of all the locations
        for the currently authenticated user's farm.
        """
        user = self.request.user
        queryset = Location.objects.filter(farm__in=user.farms.all())
        farm_id = self.request.query_params.get('farm')
        if farm_id:
            queryset = queryset.filter(farm_id=farm_id)
        return queryset

    def perform_create(self, serializer):
        # Get the farm from the request data
        farm = serializer.validated_data['farm']
        # Check if the user is a member of the farm
        if not self.request.user.farms.filter(pk=farm.pk).exists():
            raise permissions.PermissionDenied("You are not a member of this farm.")
        serializer.save()

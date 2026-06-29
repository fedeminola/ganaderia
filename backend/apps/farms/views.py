from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Farm, Membership
from .serializers import FarmSerializer, MembershipSerializer

class FarmViewSet(viewsets.ModelViewSet):
    queryset = Farm.objects.all()
    serializer_class = FarmSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        This view should return a list of all the farms
        for the currently authenticated user. This includes farms they own
        and farms they are a member of.
        """
        user = self.request.user
        # Use a Q object to combine two queries with an OR operator
        return Farm.objects.filter(Q(owner=user) | Q(members=user)).distinct()

    def perform_create(self, serializer):
        farm = serializer.save(owner=self.request.user)
        Membership.objects.create(user=self.request.user, farm=farm, role=Membership.Role.ADMIN)

class MembershipViewSet(viewsets.ModelViewSet):
    queryset = Membership.objects.all()
    serializer_class = MembershipSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        This view should return a list of all memberships for farms
        the user has access to.
        """
        user = self.request.user
        return Membership.objects.filter(farm__in=user.farms.all())
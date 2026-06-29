from rest_framework import viewsets, permissions
from .models import Transaction
from .serializers import TransactionSerializer

class IsFarmMember(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.farms.filter(pk=obj.farm.pk).exists()

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated, IsFarmMember]

    def get_queryset(self):
        user = self.request.user
        return Transaction.objects.filter(farm__in=user.farms.all())

    def perform_create(self, serializer):
        farm = serializer.validated_data['farm']
        if not self.request.user.farms.filter(pk=farm.pk).exists():
            raise permissions.PermissionDenied("You are not a member of this farm.")
        serializer.save()

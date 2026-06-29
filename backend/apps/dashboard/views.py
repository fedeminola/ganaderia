from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.farms.models import Farm
from apps.animals.models import Animal, MissingAlert, Category
from apps.locations.models import Location
from apps.movements.models import Movement
from django.utils import timezone
from django.db.models import Count
import datetime

class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        farm_id = request.query_params.get('farm_id')
        if not farm_id:
            return Response({"error": "farm_id parameter is required"}, status=400)

        # Validate that the user has access to this farm
        try:
            farm = request.user.farms.get(id=farm_id)
        except Farm.DoesNotExist:
            return Response({"error": "Farm not found or permission denied"}, status=404)

        total_animals = Animal.objects.filter(farm=farm, status=Animal.AnimalStatus.ACTIVE).count()
        missing_alerts = MissingAlert.objects.filter(animal__farm=farm, resolved=False).count()
        
        # Recent movements in the last 7 days
        one_week_ago = timezone.now() - datetime.timedelta(days=7)
        recent_movements = Movement.objects.filter(farm=farm, timestamp__gte=one_week_ago).count()

        # Animals per location
        animals_per_location = Location.objects.filter(farm=farm).annotate(
            animal_count=Count('animals')
        ).values('name', 'animal_count')

        # Animals per category
        animals_per_category = Category.objects.filter(farm=farm).annotate(
            animal_count=Count('animals')
        ).values('name', 'animal_count')

        stats = {
            "total_animals": total_animals,
            "missing_alerts": missing_alerts,
            "recent_movements": recent_movements,
            "animals_per_location": list(animals_per_location),
            "animals_per_category": list(animals_per_category),
        }
        
        return Response(stats)
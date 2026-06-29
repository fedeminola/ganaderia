from django.test import TestCase
from .models import Location
from apps.farms.models import Farm
from apps.accounts.models import User

class LocationsModelsTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password')
        self.farm = Farm.objects.create(name='Test Farm', owner=self.user)
        self.location = Location.objects.create(
            farm=self.farm,
            name='Paddock 1',
            type=Location.LocationType.PADDOCK
        )

    def test_location_creation(self):
        self.assertEqual(self.location.name, 'Paddock 1')
        self.assertEqual(self.location.farm, self.farm)
        self.assertEqual(self.location.type, Location.LocationType.PADDOCK)
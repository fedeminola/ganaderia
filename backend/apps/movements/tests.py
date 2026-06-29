from django.test import TestCase
from .models import Movement
from apps.animals.models import Animal, Species, Category
from apps.locations.models import Location
from apps.farms.models import Farm
from apps.accounts.models import User
from django.utils import timezone

class MovementsModelsTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password')
        self.farm = Farm.objects.create(name='Test Farm', owner=self.user)
        self.species = Species.objects.create(name='Bovine')
        self.category = Category.objects.create(name='Cow', farm=self.farm)
        self.origin = Location.objects.create(farm=self.farm, name='Paddock 1', type=Location.LocationType.PADDOCK)
        self.destination = Location.objects.create(farm=self.farm, name='Paddock 2', type=Location.LocationType.PADDOCK)
        self.animal = Animal.objects.create(
            farm=self.farm,
            rfid='1234567890',
            species=self.species,
            category=self.category,
            current_location=self.origin,
            status=Animal.AnimalStatus.ACTIVE
        )
        self.movement = Movement.objects.create(
            farm=self.farm,
            user=self.user,
            origin=self.origin,
            destination=self.destination,
            timestamp=timezone.now()
        )

    def test_movement_creation(self):
        self.assertEqual(self.movement.origin, self.origin)
        self.assertEqual(self.movement.destination, self.destination)
        self.assertEqual(self.movement.farm, self.farm)
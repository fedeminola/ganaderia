from django.test import TestCase
from .models import Animal, Species, Category
from apps.farms.models import Farm
from apps.accounts.models import User

class AnimalsModelsTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password')
        self.farm = Farm.objects.create(name='Test Farm', owner=self.user)
        self.species = Species.objects.create(name='Bovine')
        self.category = Category.objects.create(name='Cow', farm=self.farm)
        self.animal = Animal.objects.create(
            farm=self.farm,
            rfid='1234567890',
            species=self.species,
            category=self.category,
            status=Animal.AnimalStatus.ACTIVE
        )

    def test_animal_creation(self):
        self.assertEqual(self.animal.rfid, '1234567890')
        self.assertEqual(self.animal.farm, self.farm)
        self.assertEqual(self.animal.species, self.species)
        self.assertEqual(self.animal.category, self.category)
        self.assertEqual(self.animal.status, Animal.AnimalStatus.ACTIVE)
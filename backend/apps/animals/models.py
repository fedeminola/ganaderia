import uuid
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.utils import timezone

from ..farms.models import Farm
from ..locations.models import Location
from ..lots.models import Lot

class Species(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name="species")
    name = models.CharField(max_length=100)

    class Meta:
        verbose_name = "Especie"
        verbose_name_plural = "Especies"
        unique_together = ("farm", "name")
        ordering = ["name"]

    def __str__(self):
        return self.name

class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name="categories")
    species = models.ForeignKey(Species, on_delete=models.CASCADE, related_name="categories")
    name = models.CharField(max_length=100)

    class Meta:
        verbose_name = "Categoria"
        verbose_name_plural = "Categorias"
        unique_together = ("farm", "species", "name")
        ordering = ["name"]

    def __str__(self):
        return f"{self.species.name} - {self.name}"

class Animal(models.Model):
    class AnimalStatus(models.TextChoices):
        ACTIVE = "active", _("Active")
        SOLD = "sold", _("Sold")
        DEAD = "dead", _("Dead")
        MISSING = "missing", _("Missing")

    class AnimalSex(models.TextChoices):
        MALE = "male", _("Male")
        FEMALE = "female", _("Female")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name="animals")
    rfid = models.CharField(max_length=100, db_index=True)
    visual_tag = models.CharField(max_length=50, null=True, blank=True)
    internal_number = models.CharField(max_length=50, null=True, blank=True)
    
    species = models.ForeignKey(Species, on_delete=models.SET_NULL, null=True, related_name="animals")
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name="animals")
    sex = models.CharField(max_length=10, choices=AnimalSex.choices)
    
    birth_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=AnimalStatus.choices, default=AnimalStatus.ACTIVE)
    
    current_location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True, blank=True, related_name="animals")
    current_lot = models.ForeignKey(Lot, on_delete=models.SET_NULL, null=True, blank=True, related_name="animals")
    
    mother = models.ForeignKey("self", on_delete=models.SET_NULL, null=True, blank=True, related_name="offspring")
    
    notes = models.TextField(null=True, blank=True)

    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="created_animals")
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="updated_animals")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Animal"
        verbose_name_plural = "Animales"
        unique_together = (("farm", "internal_number"), ("farm", "rfid"))

    def __str__(self):
        return self.rfid

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        old_status = None
        if not is_new:
            try:
                old_status = Animal.objects.get(pk=self.pk).status
            except Animal.DoesNotExist:
                pass
        
        super().save(*args, **kwargs)
        
        if is_new:
            AnimalEvent.objects.create(
                animal=self,
                type=AnimalEvent.EventType.BIRTH,
                timestamp=timezone.now(),
                user=self.created_by,
                metadata={"info": "Initial registration"}
            )
        elif old_status and old_status != self.status:
            event_type = AnimalEvent.EventType.COUNT
            if self.status == Animal.AnimalStatus.DEAD:
                event_type = AnimalEvent.EventType.DEATH
            elif self.status == Animal.AnimalStatus.SOLD:
                event_type = AnimalEvent.EventType.SALE
            elif self.status == Animal.AnimalStatus.MISSING:
                event_type = AnimalEvent.EventType.MISSING
                
            AnimalEvent.objects.create(
                animal=self,
                type=event_type,
                timestamp=timezone.now(),
                user=self.updated_by,
                metadata={"old_status": old_status, "new_status": self.status}
            )


class AnimalEvent(models.Model):
    class EventType(models.TextChoices):
        BIRTH = "birth", _("Birth")
        MOVEMENT = "movement", _("Movement")
        VACCINATION = "vaccination", _("Vaccination")
        TREATMENT = "treatment", _("Treatment")
        SERVICE = "service", _("Service")
        CALVING = "calving", _("Calving")
        WEANING = "weaning", _("Weaning")
        WEIGHING = "weighing", _("Weighing")
        DEATH = "death", _("Death")
        SALE = "sale", _("Sale")
        COUNT = "count", _("Count")
        MISSING = "missing", _("Missing")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    animal = models.ForeignKey(Animal, on_delete=models.CASCADE, related_name="animal_events")
    type = models.CharField(max_length=20, choices=EventType.choices)
    timestamp = models.DateTimeField()
    metadata = models.JSONField(default=dict)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="animal_events")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Evento de animal"
        verbose_name_plural = "Eventos de animales"
        ordering = ["-timestamp"]

    def __str__(self):
        return f"{self.animal} - {self.get_type_display()} at {self.timestamp}"


class MissingAlert(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    animal = models.ForeignKey(Animal, on_delete=models.CASCADE, related_name="missing_alerts")
    location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True)
    detected_at = models.DateTimeField()
    resolved = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-detected_at"]
        verbose_name = "Alerta de animal faltante"
        verbose_name_plural = "Alertas de animales faltantes"

    def __str__(self):
        return f"Missing: {self.animal.rfid} at {self.location}"

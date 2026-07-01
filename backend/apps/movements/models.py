import uuid
from django.db import models
from django.conf import settings

from ..farms.models import Farm
from ..locations.models import Location

class Movement(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name="movements")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    
    origin = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True, related_name="movements_from")
    destination = models.ForeignKey(Location, on_delete=models.CASCADE, related_name="movements_to")
    
    timestamp = models.DateTimeField()
    
    notes = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Movimiento"
        verbose_name_plural = "Movimientos"
        ordering = ["-timestamp"]

    def __str__(self):
        return f"Movement from {self.origin} to {self.destination} at {self.timestamp}"

class MovementAnimal(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    movement = models.ForeignKey(Movement, on_delete=models.CASCADE, related_name="animals_involved")
    animal = models.ForeignKey("animals.Animal", on_delete=models.CASCADE, related_name="movements_history")

    class Meta:
        verbose_name = "Animal en movimiento"
        verbose_name_plural = "Animales en movimiento"
        unique_together = ("movement", "animal")

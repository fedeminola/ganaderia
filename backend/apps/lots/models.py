import uuid
from django.db import models

from ..farms.models import Farm

class Lot(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name="lots")
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Lote"
        verbose_name_plural = "Lotes"
        unique_together = ("farm", "name")

    def __str__(self):
        return self.name

class LotMembership(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lot = models.ForeignKey(Lot, on_delete=models.CASCADE, related_name="memberships")
    animal = models.ForeignKey("animals.Animal", on_delete=models.CASCADE, related_name="lot_memberships")
    date_joined = models.DateField(auto_now_add=True)

    class Meta:
        verbose_name = "Membresia de lote"
        verbose_name_plural = "Membresias de lote"
        unique_together = ("lot", "animal")

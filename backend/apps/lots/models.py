import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _

from ..farms.models import Farm

class Lot(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name="lots")
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Lot")
        verbose_name_plural = _("Lots")
        unique_together = ("farm", "name")

    def __str__(self):
        return self.name

class LotMembership(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lot = models.ForeignKey(Lot, on_delete=models.CASCADE, related_name="memberships")
    animal = models.ForeignKey("animals.Animal", on_delete=models.CASCADE, related_name="lot_memberships")
    date_joined = models.DateField(auto_now_add=True)

    class Meta:
        verbose_name = _("Lot Membership")
        verbose_name_plural = _("Lot Memberships")
        unique_together = ("lot", "animal")

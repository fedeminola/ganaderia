import uuid
from django.contrib.gis.db import models
from django.db.models.signals import pre_save
from django.dispatch import receiver
from django.utils.translation import gettext_lazy as _

from ..farms.models import Farm

class Location(models.Model):
    class LocationType(models.TextChoices):
        PADDOCK = "paddock", _("Paddock")
        CORRAL = "corral", _("Corral")
        PEN = "pen", _("Pen")
        TEMPORARY_PLOT = "temporary_plot", _("Temporary Plot")
        CUSTOM = "custom", _("Custom")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name="locations")
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=20, choices=LocationType.choices, default=LocationType.PADDOCK)
    polygon = models.PolygonField(srid=4326, null=True, blank=True)
    manual_area_hectares = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    calculated_area_hectares = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, editable=False)
    active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Ubicacion"
        verbose_name_plural = "Ubicaciones"
        unique_together = ("farm", "name")

    def __str__(self):
        return self.name

@receiver(pre_save, sender=Location)
def set_calculated_area(sender, instance, **kwargs):
    if instance.polygon:
        # Transform polygon to a suitable CRS for area calculation (e.g., a UTM zone)
        # This is a simplified example. For accuracy, you might need to choose a specific UTM zone
        # based on the location's longitude.
        polygon_transformed = instance.polygon.transform(32721, clone=True)  # Example: UTM zone 21S
        # Area in square meters, converted to hectares
        instance.calculated_area_hectares = polygon_transformed.area / 10000
    else:
        instance.calculated_area_hectares = None

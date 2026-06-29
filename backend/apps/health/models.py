import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _

from ..farms.models import Farm

class Vaccine(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name="vaccines")
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class Treatment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name="treatments")
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class HealthProtocol(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name="health_protocols")
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    vaccines = models.ManyToManyField(Vaccine, blank=True)
    treatments = models.ManyToManyField(Treatment, blank=True)

    def __str__(self):
        return self.name

class ScheduledHealthEvent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    protocol = models.ForeignKey(HealthProtocol, on_delete=models.CASCADE, related_name="scheduled_events")
    animal = models.ForeignKey("animals.Animal", on_delete=models.CASCADE, related_name="scheduled_health_events")
    due_date = models.DateField()
    completed = models.BooleanField(default=False)
    completed_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.protocol.name} for {self.animal} on {self.due_date}"

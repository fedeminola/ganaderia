import uuid
from django.db import models
from django.conf import settings
from apps.animals.models import Animal

class AnimalEvent(models.Model):
    class EventType(models.TextChoices):
        BIRTH = 'BIRTH', 'Birth'
        MOVEMENT = 'MOVEMENT', 'Movement'
        VACCINATION = 'VACCINATION', 'Vaccination'
        TREATMENT = 'TREATMENT', 'Treatment'
        SERVICE = 'SERVICE', 'Service'
        CALVING = 'CALVING', 'Calving'
        WEANING = 'WEANING', 'Weaning'
        WEIGHING = 'WEIGHING', 'Weighing'
        DEATH = 'DEATH', 'Death'
        SALE = 'SALE', 'Sale'
        COUNT = 'COUNT', 'Count'
        MISSING = 'MISSING', 'Missing'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    animal = models.ForeignKey(Animal, on_delete=models.CASCADE, related_name='audit_events')
    event_type = models.CharField(max_length=20, choices=EventType.choices)
    timestamp = models.DateTimeField()
    metadata = models.JSONField(null=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='audit_events')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Evento de auditoria'
        verbose_name_plural = 'Eventos de auditoria'

    def __str__(self):
        return f'{self.event_type} for {self.animal} at {self.timestamp}'

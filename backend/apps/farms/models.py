import uuid
from django.db import models
from django.conf import settings

class Farm(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='owned_farms')
    members = models.ManyToManyField(settings.AUTH_USER_MODEL, through='Membership', related_name='farms')

    # RFID Reader Configuration
    rfid_service_uuid = models.CharField(
        max_length=36,
        blank=True,
        null=True,
        help_text="The Bluetooth Service UUID of the RFID reader."
    )
    rfid_characteristic_uuid = models.CharField(
        max_length=36,
        blank=True,
        null=True,
        help_text="The Bluetooth Characteristic UUID for RFID notifications."
    )

    class Meta:
        verbose_name = 'Establecimiento'
        verbose_name_plural = 'Establecimientos'
        ordering = ['name']

    def __str__(self):
        return self.name

class Membership(models.Model):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        OPERATOR = 'OPERATOR', 'Operator'
        READONLY = 'READONLY', 'Readonly'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.OPERATOR)

    class Meta:
        verbose_name = 'Membresia'
        verbose_name_plural = 'Membresias'
        unique_together = ('user', 'farm')
        ordering = ['farm__name', 'user__username']

    def __str__(self):
        return f'{self.user} in {self.farm} as {self.role}'

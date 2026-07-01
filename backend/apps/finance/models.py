import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _

from ..farms.models import Farm

class Transaction(models.Model):
    class TransactionType(models.TextChoices):
        INCOME = "income", _("Income")
        EXPENSE = "expense", _("Expense")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name="transactions")
    type = models.CharField(max_length=10, choices=TransactionType.choices)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=255)
    date = models.DateField()
    
    # Optional links to other models
    animal = models.ForeignKey("animals.Animal", on_delete=models.SET_NULL, null=True, blank=True, related_name="transactions")
    lot = models.ForeignKey("lots.Lot", on_delete=models.SET_NULL, null=True, blank=True, related_name="transactions")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Transaccion"
        verbose_name_plural = "Transacciones"
        ordering = ["-date"]

    def __str__(self):
        return f"{self.get_type_display()} of {self.amount} on {self.date}"

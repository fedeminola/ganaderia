import uuid
from django.db import models

class WeightMeasurement(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    animal = models.ForeignKey("animals.Animal", on_delete=models.CASCADE, related_name="weights")
    weight = models.DecimalField(max_digits=10, decimal_places=2)
    measurement_date = models.DateTimeField()
    
    # Metadata for scale integration later
    scale_id = models.CharField(max_length=100, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-measurement_date"]
        verbose_name = "Medicion de peso"
        verbose_name_plural = "Mediciones de peso"

    def __str__(self):
        return f"{self.animal} - {self.weight} kg"

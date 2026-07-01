from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('weights', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='weightmeasurement',
            options={'ordering': ['-measurement_date'], 'verbose_name': 'Medicion de peso', 'verbose_name_plural': 'Mediciones de peso'},
        ),
    ]

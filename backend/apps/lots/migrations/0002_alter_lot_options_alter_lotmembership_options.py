from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('lots', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='lot',
            options={'verbose_name': 'Lote', 'verbose_name_plural': 'Lotes'},
        ),
        migrations.AlterModelOptions(
            name='lotmembership',
            options={'verbose_name': 'Membresia de lote', 'verbose_name_plural': 'Membresias de lote'},
        ),
    ]

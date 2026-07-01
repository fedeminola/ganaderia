from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('movements', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='movement',
            options={'ordering': ['-timestamp'], 'verbose_name': 'Movimiento', 'verbose_name_plural': 'Movimientos'},
        ),
        migrations.AlterModelOptions(
            name='movementanimal',
            options={'verbose_name': 'Animal en movimiento', 'verbose_name_plural': 'Animales en movimiento'},
        ),
    ]

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('health', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='healthprotocol',
            options={'verbose_name': 'Protocolo sanitario', 'verbose_name_plural': 'Protocolos sanitarios'},
        ),
        migrations.AlterModelOptions(
            name='scheduledhealthevent',
            options={'verbose_name': 'Evento sanitario programado', 'verbose_name_plural': 'Eventos sanitarios programados'},
        ),
        migrations.AlterModelOptions(
            name='treatment',
            options={'verbose_name': 'Tratamiento', 'verbose_name_plural': 'Tratamientos'},
        ),
        migrations.AlterModelOptions(
            name='vaccine',
            options={'verbose_name': 'Vacuna', 'verbose_name_plural': 'Vacunas'},
        ),
    ]

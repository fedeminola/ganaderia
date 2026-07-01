from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('audit', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='animalevent',
            options={'verbose_name': 'Evento de auditoria', 'verbose_name_plural': 'Eventos de auditoria'},
        ),
    ]

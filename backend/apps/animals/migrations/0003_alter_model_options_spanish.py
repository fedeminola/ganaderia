from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('animals', '0002_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='animal',
            options={'verbose_name': 'Animal', 'verbose_name_plural': 'Animales'},
        ),
        migrations.AlterModelOptions(
            name='animalevent',
            options={'ordering': ['-timestamp'], 'verbose_name': 'Evento de animal', 'verbose_name_plural': 'Eventos de animales'},
        ),
        migrations.AlterModelOptions(
            name='category',
            options={'ordering': ['name'], 'verbose_name': 'Categoria', 'verbose_name_plural': 'Categorias'},
        ),
        migrations.AlterModelOptions(
            name='missingalert',
            options={'ordering': ['-detected_at'], 'verbose_name': 'Alerta de animal faltante', 'verbose_name_plural': 'Alertas de animales faltantes'},
        ),
        migrations.AlterModelOptions(
            name='species',
            options={'ordering': ['name'], 'verbose_name': 'Especie', 'verbose_name_plural': 'Especies'},
        ),
    ]

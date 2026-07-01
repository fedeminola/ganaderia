from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('farms', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='farm',
            options={'ordering': ['name'], 'verbose_name': 'Establecimiento', 'verbose_name_plural': 'Establecimientos'},
        ),
        migrations.AlterModelOptions(
            name='membership',
            options={'ordering': ['farm__name', 'user__username'], 'verbose_name': 'Membresia', 'verbose_name_plural': 'Membresias'},
        ),
    ]

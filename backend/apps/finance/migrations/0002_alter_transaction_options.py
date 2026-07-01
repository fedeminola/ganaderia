from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('finance', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='transaction',
            options={'ordering': ['-date'], 'verbose_name': 'Transaccion', 'verbose_name_plural': 'Transacciones'},
        ),
    ]

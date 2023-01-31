# Generated by Django 4.1.5 on 2023-01-27 18:35

import api.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0002_rename_created_at_room_createdtime_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="room",
            name="code",
            field=models.CharField(
                default=api.models.genUniqueCode, max_length=8, unique=True
            ),
        ),
    ]

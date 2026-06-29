from django.contrib.gis import admin
from .models import Location

@admin.register(Location)
class LocationAdmin(admin.GISModelAdmin):
    list_display = ('name', 'farm', 'type', 'active')
    list_filter = ('farm', 'type', 'active')
    search_fields = ('name',)

from django.contrib import admin
from .models import Animal, Species, Category, MissingAlert, AnimalEvent

@admin.register(Animal)
class AnimalAdmin(admin.ModelAdmin):
    list_display = ('rfid', 'farm', 'species', 'category', 'status', 'current_location')
    list_filter = ('farm', 'species', 'category', 'status')
    search_fields = ('rfid', 'internal_number', 'visual_tag')

@admin.register(Species)
class SpeciesAdmin(admin.ModelAdmin):
    list_display = ('name', 'farm')
    list_filter = ('farm',)

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'species', 'farm')
    list_filter = ('farm', 'species')

@admin.register(MissingAlert)
class MissingAlertAdmin(admin.ModelAdmin):
    list_display = ('animal', 'location', 'detected_at', 'resolved')
    list_filter = ('resolved', 'detected_at')
    search_fields = ('animal__rfid',)

@admin.register(AnimalEvent)
class AnimalEventAdmin(admin.ModelAdmin):
    list_display = ('animal', 'type', 'timestamp', 'user')
    list_filter = ('type', 'timestamp')
    search_fields = ('animal__rfid',)

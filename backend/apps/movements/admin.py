from django.contrib import admin
from .models import Movement, MovementAnimal

class MovementAnimalInline(admin.TabularInline):
    model = MovementAnimal
    extra = 0

@admin.register(Movement)
class MovementAdmin(admin.ModelAdmin):
    list_display = ('id', 'farm', 'origin', 'destination', 'timestamp', 'user')
    list_filter = ('farm', 'timestamp', 'user')
    search_fields = ('notes',)
    inlines = [MovementAnimalInline]

@admin.register(MovementAnimal)
class MovementAnimalAdmin(admin.ModelAdmin):
    list_display = ('movement', 'animal')
    list_filter = ('movement__farm',)

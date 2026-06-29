from django.contrib import admin
from .models import Lot, LotMembership

class LotMembershipInline(admin.TabularInline):
    model = LotMembership
    extra = 1

@admin.register(Lot)
class LotAdmin(admin.ModelAdmin):
    list_display = ('name', 'farm', 'created_at')
    list_filter = ('farm',)
    search_fields = ('name',)
    inlines = [LotMembershipInline]

@admin.register(LotMembership)
class LotMembershipAdmin(admin.ModelAdmin):
    list_display = ('lot', 'animal', 'date_joined')
    list_filter = ('lot__farm', 'lot')

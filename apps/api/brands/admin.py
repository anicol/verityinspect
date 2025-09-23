from django.contrib import admin
from .models import Brand, Store


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Store)
class StoreAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'brand', 'city', 'state', 'is_active')
    list_filter = ('brand', 'state', 'is_active', 'created_at')
    search_fields = ('name', 'code', 'address', 'city')
    readonly_fields = ('created_at', 'updated_at')
    list_select_related = ('brand',)
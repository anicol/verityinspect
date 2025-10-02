from django.contrib import admin
from .models import Inspection, Finding, ActionItem


@admin.register(Inspection)
class InspectionAdmin(admin.ModelAdmin):
    list_display = ('title', 'mode', 'status', 'overall_score', 'created_at', 'store')
    list_filter = ('mode', 'status', 'store__brand', 'created_at')
    search_fields = ('title', 'store__name')
    readonly_fields = ('ai_analysis', 'created_at', 'updated_at')
    list_select_related = ('store', 'created_by')


@admin.register(Finding)
class FindingAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'severity', 'confidence', 'is_resolved', 'created_at')
    list_filter = ('category', 'severity', 'is_resolved', 'created_at')
    search_fields = ('title', 'description', 'inspection__title')
    readonly_fields = ('confidence', 'bounding_box', 'created_at')
    list_select_related = ('inspection', 'frame')


@admin.register(ActionItem)
class ActionItemAdmin(admin.ModelAdmin):
    list_display = ('title', 'priority', 'status', 'assigned_to', 'due_date', 'created_at')
    list_filter = ('priority', 'status', 'created_at')
    search_fields = ('title', 'description', 'inspection__title')
    readonly_fields = ('completed_at', 'created_at', 'updated_at')
    list_select_related = ('assigned_to', 'completed_by', 'inspection')
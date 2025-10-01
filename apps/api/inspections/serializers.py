from rest_framework import serializers
from .models import Inspection, Finding, ActionItem


class FindingSerializer(serializers.ModelSerializer):
    frame_image = serializers.SerializerMethodField()
    frame_timestamp = serializers.SerializerMethodField()

    class Meta:
        model = Finding
        fields = '__all__'

    def get_frame_image(self, obj):
        """Safely get frame image URL"""
        if obj.frame and obj.frame.image:
            return obj.frame.image.url
        return None

    def get_frame_timestamp(self, obj):
        """Safely get frame timestamp"""
        if obj.frame:
            return obj.frame.timestamp
        return None


class ActionItemSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source='assigned_to.full_name', read_only=True)
    completed_by_name = serializers.CharField(source='completed_by.full_name', read_only=True)

    class Meta:
        model = ActionItem
        fields = '__all__'


class InspectionSerializer(serializers.ModelSerializer):
    findings = FindingSerializer(many=True, read_only=True)
    action_items = ActionItemSerializer(many=True, read_only=True)
    video_title = serializers.CharField(source='video.title', read_only=True)
    store_name = serializers.CharField(source='video.store.name', read_only=True)
    findings_count = serializers.SerializerMethodField()
    critical_findings_count = serializers.SerializerMethodField()
    open_actions_count = serializers.SerializerMethodField()

    class Meta:
        model = Inspection
        fields = '__all__'

    def get_findings_count(self, obj):
        return obj.findings.count()

    def get_critical_findings_count(self, obj):
        return obj.findings.filter(severity='CRITICAL').count()

    def get_open_actions_count(self, obj):
        return obj.action_items.filter(status='OPEN').count()


class InspectionListSerializer(serializers.ModelSerializer):
    video_title = serializers.CharField(source='video.title', read_only=True)
    store_name = serializers.CharField(source='video.store.name', read_only=True)
    findings_count = serializers.SerializerMethodField()
    critical_findings_count = serializers.SerializerMethodField()

    class Meta:
        model = Inspection
        fields = ('id', 'mode', 'status', 'overall_score', 'video_title', 'store_name',
                 'findings_count', 'critical_findings_count', 'expires_at', 'created_at')

    def get_findings_count(self, obj):
        return obj.findings.count()

    def get_critical_findings_count(self, obj):
        return obj.findings.filter(severity='CRITICAL').count()


class ActionItemUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActionItem
        fields = ('status', 'assigned_to', 'due_date', 'notes')

    def update(self, instance, validated_data):
        if validated_data.get('status') == ActionItem.Status.COMPLETED:
            from django.utils import timezone
            validated_data['completed_at'] = timezone.now()
            validated_data['completed_by'] = self.context['request'].user
        
        return super().update(instance, validated_data)
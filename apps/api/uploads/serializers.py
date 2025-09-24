from rest_framework import serializers
from .models import Upload


class UploadSerializer(serializers.ModelSerializer):
    """Serializer for Upload model"""
    
    class Meta:
        model = Upload
        fields = [
            'id', 'store', 'mode', 's3_key', 'status', 
            'duration_s', 'original_filename', 'file_type',
            'created_at', 'updated_at', 'created_by'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']
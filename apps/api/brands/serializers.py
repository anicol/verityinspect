from rest_framework import serializers
from .models import Brand, Store


class BrandSerializer(serializers.ModelSerializer):
    stores_count = serializers.SerializerMethodField()

    class Meta:
        model = Brand
        fields = '__all__'

    def get_stores_count(self, obj):
        return obj.stores.filter(is_active=True).count()


class StoreSerializer(serializers.ModelSerializer):
    brand_name = serializers.CharField(source='brand.name', read_only=True)

    class Meta:
        model = Store
        fields = '__all__'


class StoreListSerializer(serializers.ModelSerializer):
    brand_name = serializers.CharField(source='brand.name', read_only=True)

    class Meta:
        model = Store
        fields = ('id', 'name', 'code', 'brand', 'brand_name', 'city', 'state', 'is_active', 'created_at', 'phone', 'manager_email', 'address', 'zip_code', 'timezone', 'updated_at')
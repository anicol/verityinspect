from django.db import models


class Brand(models.Model):
    name = models.CharField(max_length=100, unique=True)
    logo = models.ImageField(upload_to='brands/logos/', blank=True, null=True)
    description = models.TextField(blank=True)
    retention_days_inspection = models.IntegerField(default=365, help_text="Retention period for inspection mode in days")
    retention_days_coaching = models.IntegerField(default=7, help_text="Retention period for coaching mode in days")
    webhook_url = models.URLField(blank=True, null=True, help_text="URL for webhook notifications")
    inspection_config = models.JSONField(default=dict, help_text="Configuration for inspection criteria")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'brands'
        ordering = ['name']

    def __str__(self):
        return self.name


class Store(models.Model):
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, related_name='stores')
    name = models.CharField(max_length=100)
    region = models.CharField(max_length=100, blank=True, help_text="Geographic region or district")
    code = models.CharField(max_length=20, unique=True)
    address = models.TextField()
    city = models.CharField(max_length=50)
    state = models.CharField(max_length=50)
    zip_code = models.CharField(max_length=10)
    phone = models.CharField(max_length=20, blank=True)
    manager_email = models.EmailField(blank=True)
    timezone = models.CharField(max_length=50, default='UTC')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'stores'
        ordering = ['brand__name', 'name']

    def __str__(self):
        return f"{self.brand.name} - {self.name} ({self.code})"
from django.db import models
from django.conf import settings


class Upload(models.Model):
    class Mode(models.TextChoices):
        INSPECTION = 'inspection', 'Inspection Mode'
        COACHING = 'coaching', 'Coaching Mode'

    class Status(models.TextChoices):
        UPLOADED = 'uploaded', 'Uploaded'
        PROCESSING = 'processing', 'Processing'
        COMPLETE = 'complete', 'Complete'
        FAILED = 'failed', 'Failed'

    store = models.ForeignKey('brands.Store', on_delete=models.CASCADE, related_name='uploads')
    mode = models.CharField(max_length=20, choices=Mode.choices)
    s3_key = models.CharField(max_length=500, help_text="S3 object key for the video file")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.UPLOADED)
    duration_s = models.IntegerField(null=True, blank=True, help_text="Video duration in seconds")
    original_filename = models.CharField(max_length=255, help_text="Original uploaded filename")
    file_type = models.CharField(max_length=100, default='video/mp4', help_text="MIME type of the file")
    upload_url = models.URLField(max_length=2000, blank=True, help_text="Presigned upload URL")
    file_size = models.BigIntegerField(null=True, blank=True, help_text="File size in bytes")
    metadata = models.JSONField(default=dict, help_text="Video metadata from FFmpeg")
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    expires_at = models.DateTimeField(null=True, blank=True, help_text="When this upload expires (coaching mode)")

    class Meta:
        db_table = 'uploads'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['store', 'mode']),
            models.Index(fields=['status']),
            models.Index(fields=['expires_at']),
        ]

    def __str__(self):
        return f"{self.store.name} - {self.mode} ({self.status})"


class Detection(models.Model):
    upload = models.ForeignKey(Upload, on_delete=models.CASCADE, related_name='detections')
    type = models.CharField(max_length=100, help_text="Type of detection (PPE, safety, etc.)")
    label = models.CharField(max_length=200, help_text="Specific label for the detected object")
    confidence = models.FloatField(help_text="Confidence score 0-1")
    frame_ts_ms = models.IntegerField(help_text="Frame timestamp in milliseconds")
    bbox_json = models.JSONField(null=True, blank=True, help_text="Bounding box coordinates")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'detections'
        ordering = ['frame_ts_ms', 'type']
        indexes = [
            models.Index(fields=['upload', 'type']),
            models.Index(fields=['frame_ts_ms']),
        ]

    def __str__(self):
        return f"{self.type}: {self.label} ({self.confidence:.2f})"


class Rule(models.Model):
    brand = models.ForeignKey('brands.Brand', on_delete=models.CASCADE, related_name='rules')
    code = models.CharField(max_length=50, help_text="Unique code within brand")
    name = models.CharField(max_length=200)
    description = models.TextField()
    config_json = models.JSONField(default=dict, help_text="Rule configuration parameters")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'rules'
        unique_together = ['brand', 'code']
        ordering = ['brand', 'code']

    def __str__(self):
        return f"{self.brand.name} - {self.name}"


class Violation(models.Model):
    class Severity(models.TextChoices):
        LOW = 'low', 'Low'
        MED = 'med', 'Medium'
        HIGH = 'high', 'High'

    class Status(models.TextChoices):
        OPEN = 'open', 'Open'
        DISMISSED = 'dismissed', 'Dismissed'
        APPROVED = 'approved', 'Approved'

    upload = models.ForeignKey(Upload, on_delete=models.CASCADE, related_name='violations')
    rule = models.ForeignKey(Rule, on_delete=models.CASCADE, related_name='violations')
    severity = models.CharField(max_length=10, choices=Severity.choices)
    evidence_frame_ts_ms = models.IntegerField(help_text="Frame timestamp with evidence")
    evidence_s3_key = models.CharField(max_length=500, help_text="S3 key for evidence image")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    notes = models.TextField(blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='reviewed_violations'
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'violations'
        ordering = ['-severity', '-created_at']
        indexes = [
            models.Index(fields=['upload', 'status']),
            models.Index(fields=['severity']),
        ]

    def __str__(self):
        return f"{self.rule.name} - {self.severity}"


class Scorecard(models.Model):
    upload = models.OneToOneField(Upload, on_delete=models.CASCADE, related_name='scorecard')
    scores_json = models.JSONField(default=dict, help_text="Detailed scores breakdown")
    total_score = models.FloatField(help_text="Overall score 0-100")
    ppe_score = models.FloatField(null=True, blank=True)
    safety_score = models.FloatField(null=True, blank=True)
    cleanliness_score = models.FloatField(null=True, blank=True)
    uniform_score = models.FloatField(null=True, blank=True)
    menu_board_score = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'scorecards'

    def __str__(self):
        return f"Scorecard for {self.upload} - {self.total_score:.1f}%"


class Task(models.Model):
    class Status(models.TextChoices):
        OPEN = 'open', 'Open'
        DONE = 'done', 'Done'

    class Priority(models.TextChoices):
        LOW = 'low', 'Low'
        MEDIUM = 'medium', 'Medium'
        HIGH = 'high', 'High'
        URGENT = 'urgent', 'Urgent'

    store = models.ForeignKey('brands.Store', on_delete=models.CASCADE, related_name='tasks')
    upload = models.ForeignKey(Upload, on_delete=models.CASCADE, null=True, blank=True, related_name='tasks')
    violation = models.ForeignKey(Violation, on_delete=models.CASCADE, null=True, blank=True, related_name='tasks')
    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.OPEN)
    priority = models.CharField(max_length=10, choices=Priority.choices, default=Priority.MEDIUM)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_tasks'
    )
    due_date = models.DateField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tasks'
        ordering = ['-priority', 'due_date', '-created_at']
        indexes = [
            models.Index(fields=['store', 'status']),
            models.Index(fields=['assigned_to', 'status']),
            models.Index(fields=['due_date']),
        ]

    def __str__(self):
        return f"{self.title} ({self.priority})"


class AuditLog(models.Model):
    actor_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='audit_logs')
    action = models.CharField(max_length=100, help_text="Action performed (create, update, delete, etc.)")
    entity = models.CharField(max_length=100, help_text="Entity type (Upload, Violation, etc.)")
    entity_id = models.PositiveIntegerField(help_text="ID of the affected entity")
    meta_json = models.JSONField(default=dict, help_text="Additional metadata about the action")
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'audit_logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['actor_user', 'created_at']),
            models.Index(fields=['entity', 'entity_id']),
            models.Index(fields=['action']),
        ]

    def __str__(self):
        return f"{self.actor_user.username} {self.action} {self.entity}#{self.entity_id}"
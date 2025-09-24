from django.db import models
from django.conf import settings


class Inspection(models.Model):
    class Mode(models.TextChoices):
        INSPECTION = 'INSPECTION', 'Inspection Mode'
        COACHING = 'COACHING', 'Coaching Mode'

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        PROCESSING = 'PROCESSING', 'Processing'
        COMPLETED = 'COMPLETED', 'Completed'
        FAILED = 'FAILED', 'Failed'

    video = models.OneToOneField('videos.Video', on_delete=models.CASCADE, related_name='inspection')
    mode = models.CharField(max_length=20, choices=Mode.choices)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    overall_score = models.FloatField(null=True, blank=True, help_text="Overall score 0-100")
    ppe_score = models.FloatField(null=True, blank=True)
    safety_score = models.FloatField(null=True, blank=True)
    cleanliness_score = models.FloatField(null=True, blank=True)
    uniform_score = models.FloatField(null=True, blank=True)
    menu_board_score = models.FloatField(null=True, blank=True)
    ai_analysis = models.JSONField(default=dict, help_text="Raw AI analysis results")
    error_message = models.TextField(blank=True)
    expires_at = models.DateTimeField(null=True, blank=True, help_text="When this inspection expires")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'inspections'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.video.title} - {self.mode} ({self.status})"


class Finding(models.Model):
    class Category(models.TextChoices):
        PPE = 'PPE', 'Personal Protective Equipment'
        SAFETY = 'SAFETY', 'Safety'
        CLEANLINESS = 'CLEANLINESS', 'Cleanliness'
        UNIFORM = 'UNIFORM', 'Uniform Compliance'
        MENU_BOARD = 'MENU_BOARD', 'Menu Board'
        OTHER = 'OTHER', 'Other'

    class Severity(models.TextChoices):
        LOW = 'LOW', 'Low'
        MEDIUM = 'MEDIUM', 'Medium'
        HIGH = 'HIGH', 'High'
        CRITICAL = 'CRITICAL', 'Critical'

    inspection = models.ForeignKey(Inspection, on_delete=models.CASCADE, related_name='findings')
    frame = models.ForeignKey('videos.VideoFrame', on_delete=models.CASCADE, null=True, blank=True)
    category = models.CharField(max_length=20, choices=Category.choices)
    severity = models.CharField(max_length=20, choices=Severity.choices)
    title = models.CharField(max_length=200)
    description = models.TextField()
    confidence = models.FloatField(help_text="AI confidence score 0-1")
    bounding_box = models.JSONField(null=True, blank=True, help_text="Object detection coordinates")
    recommended_action = models.TextField(blank=True)
    is_resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'findings'
        ordering = ['-severity', '-confidence', 'created_at']

    def __str__(self):
        return f"{self.category} - {self.title}"


class ActionItem(models.Model):
    class Priority(models.TextChoices):
        LOW = 'LOW', 'Low'
        MEDIUM = 'MEDIUM', 'Medium'
        HIGH = 'HIGH', 'High'
        URGENT = 'URGENT', 'Urgent'

    class Status(models.TextChoices):
        OPEN = 'OPEN', 'Open'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        COMPLETED = 'COMPLETED', 'Completed'
        DISMISSED = 'DISMISSED', 'Dismissed'

    inspection = models.ForeignKey(Inspection, on_delete=models.CASCADE, related_name='action_items')
    finding = models.ForeignKey(Finding, on_delete=models.CASCADE, null=True, blank=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    priority = models.CharField(max_length=20, choices=Priority.choices, default=Priority.MEDIUM)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    due_date = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    completed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='completed_actions'
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'action_items'
        ordering = ['-priority', 'due_date', 'created_at']

    def __str__(self):
        return f"{self.title} ({self.priority})"


# Placeholder models for rule engine (to be fully implemented later)
class Rule(models.Model):
    class RuleType(models.TextChoices):
        PPE = 'PPE', 'Personal Protective Equipment'
        SAFETY = 'SAFETY', 'Safety'
        CLEANLINESS = 'CLEANLINESS', 'Cleanliness'
        TRAINING = 'TRAINING', 'Training'
        PROCESS = 'PROCESS', 'Process'

    brand = models.ForeignKey('brands.Brand', on_delete=models.CASCADE, related_name='rules')
    name = models.CharField(max_length=200)
    rule_type = models.CharField(max_length=20, choices=RuleType.choices)
    description = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'rules'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.rule_type})"


class Detection(models.Model):
    inspection = models.ForeignKey(Inspection, on_delete=models.CASCADE, related_name='detections')
    frame = models.ForeignKey('videos.VideoFrame', on_delete=models.CASCADE)
    rule = models.ForeignKey(Rule, on_delete=models.CASCADE)
    confidence = models.FloatField(help_text="Detection confidence score 0-1")
    bbox_x = models.IntegerField(default=0)
    bbox_y = models.IntegerField(default=0)
    bbox_width = models.IntegerField(default=0)
    bbox_height = models.IntegerField(default=0)
    metadata = models.JSONField(default=dict)
    suggestions = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'detections'
        ordering = ['-confidence', 'created_at']

    def __str__(self):
        return f"{self.rule.name} - {self.confidence:.2f}"
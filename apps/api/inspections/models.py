from django.db import models
from django.conf import settings


class Inspection(models.Model):
    class Mode(models.TextChoices):
        ENTERPRISE = 'ENTERPRISE', 'Enterprise Mode'
        COACHING = 'COACHING', 'Coaching Mode'

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        PROCESSING = 'PROCESSING', 'Processing'
        COMPLETED = 'COMPLETED', 'Completed'
        FAILED = 'FAILED', 'Failed'

    # Core inspection metadata (no longer tied to single video)
    title = models.CharField(max_length=200, help_text="Inspection title", default="")
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_inspections', null=True)
    store = models.ForeignKey('brands.Store', on_delete=models.CASCADE, related_name='inspections', null=True)
    inspection_date = models.DateTimeField(null=True, blank=True, help_text="When inspection was initiated")

    mode = models.CharField(max_length=20, choices=Mode.choices)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)

    # Enterprise mode fields
    assigned_inspector = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_inspections',
        help_text="Inspector assigned to review (enterprise mode only)"
    )
    inspector_notes = models.TextField(blank=True, help_text="Detailed inspector notes and observations (enterprise mode)")
    report_url = models.CharField(max_length=500, blank=True, help_text="URL to generated PDF report (enterprise mode)")
    report_generated_at = models.DateTimeField(null=True, blank=True, help_text="When report was generated")

    # Scores
    overall_score = models.FloatField(null=True, blank=True, help_text="Overall score 0-100")
    ppe_score = models.FloatField(null=True, blank=True)
    safety_score = models.FloatField(null=True, blank=True)
    cleanliness_score = models.FloatField(null=True, blank=True)
    food_safety_score = models.FloatField(null=True, blank=True)
    equipment_score = models.FloatField(null=True, blank=True)
    operational_score = models.FloatField(null=True, blank=True)
    food_quality_score = models.FloatField(null=True, blank=True)
    staff_behavior_score = models.FloatField(null=True, blank=True)
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
        return f"{self.title} - {self.mode} ({self.status})"

    @property
    def video(self):
        """Backward compatibility property - returns first video"""
        return self.videos.first() if self.videos.exists() else None


class Finding(models.Model):
    class Category(models.TextChoices):
        PPE = 'PPE', 'Personal Protective Equipment'
        SAFETY = 'SAFETY', 'Safety'
        CLEANLINESS = 'CLEANLINESS', 'Cleanliness'
        UNIFORM = 'UNIFORM', 'Uniform Compliance'
        MENU_BOARD = 'MENU_BOARD', 'Menu Board'
        FOOD_SAFETY = 'FOOD_SAFETY', 'Food Safety & Hygiene'
        EQUIPMENT = 'EQUIPMENT', 'Equipment & Maintenance'
        OPERATIONAL = 'OPERATIONAL', 'Operational Compliance'
        FOOD_QUALITY = 'FOOD_QUALITY', 'Food Quality & Presentation'
        STAFF_BEHAVIOR = 'STAFF_BEHAVIOR', 'Staff Behavior'
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
    confidence = models.FloatField(help_text="AI confidence score 0-1 (max when consolidated)")
    bounding_box = models.JSONField(null=True, blank=True, help_text="Object detection coordinates")
    recommended_action = models.TextField(blank=True)
    is_resolved = models.BooleanField(default=False)

    # Consolidation fields - track findings across multiple frames
    affected_frame_count = models.IntegerField(default=1, help_text="Number of frames where this issue was detected")
    first_timestamp = models.FloatField(null=True, blank=True, help_text="Timestamp (seconds) when issue first appeared")
    last_timestamp = models.FloatField(null=True, blank=True, help_text="Timestamp (seconds) when issue last appeared")
    average_confidence = models.FloatField(null=True, blank=True, help_text="Average AI confidence across all occurrences")

    # AI-generated action metadata
    estimated_minutes = models.IntegerField(null=True, blank=True, help_text="AI-estimated time in minutes to address this issue")

    # Manager review fields (for coaching mode self-review)
    is_manual = models.BooleanField(default=False, help_text="True if manually added by manager, not AI-detected")
    is_approved = models.BooleanField(default=False, help_text="Manager confirmed this finding is correct")
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_findings'
    )
    approved_at = models.DateTimeField(null=True, blank=True)

    is_rejected = models.BooleanField(default=False, help_text="Manager dismissed this as false positive")
    rejection_reason = models.TextField(blank=True, help_text="Why this finding was rejected")
    rejected_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='rejected_findings'
    )
    rejected_at = models.DateTimeField(null=True, blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="User who created this finding (for manual findings)"
    )

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


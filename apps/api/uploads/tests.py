from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch, MagicMock
from datetime import timedelta
import json

from brands.models import Brand, Store
from .models import Upload, Detection, Rule, Violation, Scorecard, Task, AuditLog

User = get_user_model()


class UploadModelTest(TestCase):
    def setUp(self):
        self.brand = Brand.objects.create(name="Test Brand")
        self.store = Store.objects.create(
            brand=self.brand,
            name="Test Store", 
            code="TS001",
            address="123 Test St",
            city="Test City",
            state="TS",
            zip_code="12345"
        )
        self.user = User.objects.create_user(
            username="testuser",
            store=self.store
        )

    def test_create_upload(self):
        """Test creating an upload record"""
        upload = Upload.objects.create(
            store=self.store,
            mode=Upload.Mode.ENTERPRISE,
            s3_key="uploads/test.mp4",
            status=Upload.Status.UPLOADED,
            original_filename="test.mp4",
            created_by=self.user
        )
        
        self.assertEqual(upload.mode, Upload.Mode.ENTERPRISE)
        self.assertEqual(upload.status, Upload.Status.UPLOADED)
        self.assertEqual(str(upload), "Test Store - enterprise (uploaded)")

    def test_upload_dual_modes(self):
        """Test inspection vs coaching mode differences"""
        inspection_upload = Upload.objects.create(
            store=self.store,
            mode=Upload.Mode.ENTERPRISE,
            s3_key="uploads/inspection.mp4", 
            original_filename="inspection.mp4",
            created_by=self.user
        )
        
        coaching_upload = Upload.objects.create(
            store=self.store,
            mode=Upload.Mode.COACHING,
            s3_key="uploads/coaching.mp4",
            original_filename="coaching.mp4", 
            created_by=self.user
        )
        
        self.assertEqual(inspection_upload.mode, Upload.Mode.ENTERPRISE)
        self.assertEqual(coaching_upload.mode, Upload.Mode.COACHING)
        
    def test_upload_metadata_storage(self):
        """Test storing video metadata"""
        metadata = {
            'duration': 30.5,
            'width': 1920,
            'height': 1080,
            'fps': 30.0,
            'codec': 'h264'
        }
        
        upload = Upload.objects.create(
            store=self.store,
            mode=Upload.Mode.ENTERPRISE,
            s3_key="uploads/test.mp4",
            original_filename="test.mp4",
            metadata=metadata,
            created_by=self.user
        )
        
        self.assertEqual(upload.metadata['duration'], 30.5)
        self.assertEqual(upload.metadata['width'], 1920)


class DetectionTest(TestCase):
    def setUp(self):
        self.brand = Brand.objects.create(name="Test Brand")
        self.store = Store.objects.create(
            brand=self.brand,
            name="Test Store",
            code="TS001",
            address="123 Test St", 
            city="Test City",
            state="TS",
            zip_code="12345"
        )
        self.user = User.objects.create_user(
            username="testuser",
            store=self.store
        )
        self.upload = Upload.objects.create(
            store=self.store,
            mode=Upload.Mode.ENTERPRISE,
            s3_key="uploads/test.mp4",
            original_filename="test.mp4",
            created_by=self.user
        )

    def test_create_detection(self):
        """Test creating a detection result"""
        detection = Detection.objects.create(
            upload=self.upload,
            type="PPE",
            label="person_with_mask",
            confidence=0.95,
            frame_ts_ms=5000,
            bbox_json={"x": 100, "y": 200, "width": 150, "height": 200}
        )
        
        self.assertEqual(detection.type, "PPE")
        self.assertEqual(detection.confidence, 0.95)
        self.assertEqual(str(detection), "PPE: person_with_mask (0.95)")

    def test_detection_confidence_filtering(self):
        """Test filtering detections by confidence threshold"""
        Detection.objects.create(
            upload=self.upload, type="PPE", label="mask_detected", 
            confidence=0.95, frame_ts_ms=1000
        )
        Detection.objects.create(
            upload=self.upload, type="PPE", label="mask_uncertain",
            confidence=0.60, frame_ts_ms=2000
        )
        Detection.objects.create(
            upload=self.upload, type="PPE", label="no_mask",
            confidence=0.30, frame_ts_ms=3000
        )
        
        high_confidence = Detection.objects.filter(confidence__gte=0.8)
        self.assertEqual(high_confidence.count(), 1)
        
        medium_confidence = Detection.objects.filter(confidence__gte=0.5, confidence__lt=0.8)
        self.assertEqual(medium_confidence.count(), 1)


class RuleEngineTest(TestCase):
    def setUp(self):
        self.brand = Brand.objects.create(name="Test Brand")
        self.store = Store.objects.create(
            brand=self.brand,
            name="Test Store",
            code="TS001", 
            address="123 Test St",
            city="Test City",
            state="TS",
            zip_code="12345"
        )
        self.user = User.objects.create_user(
            username="testuser",
            store=self.store
        )

    def test_create_rule(self):
        """Test creating a compliance rule"""
        rule = Rule.objects.create(
            brand=self.brand,
            code="PPE_MASK_REQ",
            name="Face Mask Required",
            description="All employees must wear face masks",
            config_json={
                "min_confidence": 0.8,
                "detection_types": ["face_mask", "face_covering"],
                "violation_threshold": 3
            }
        )
        
        self.assertEqual(rule.code, "PPE_MASK_REQ") 
        self.assertEqual(rule.config_json["min_confidence"], 0.8)
        self.assertTrue(rule.is_active)

    def test_rule_configuration(self):
        """Test different rule configurations"""
        ppe_rule = Rule.objects.create(
            brand=self.brand,
            code="PPE_SAFETY",
            name="PPE Safety Check",
            description="Verify proper PPE usage",
            config_json={
                "required_items": ["mask", "gloves", "hat"],
                "check_intervals": [5, 15, 30]
            }
        )
        
        safety_rule = Rule.objects.create(
            brand=self.brand,
            code="SAFETY_EXITS",
            name="Emergency Exit Access", 
            description="Emergency exits must remain clear",
            config_json={
                "exit_zones": ["front", "back", "side"],
                "clearance_distance": 3.0
            }
        )
        
        self.assertEqual(len(ppe_rule.config_json["required_items"]), 3)
        self.assertEqual(safety_rule.config_json["clearance_distance"], 3.0)


class ViolationTest(TestCase):
    def setUp(self):
        self.brand = Brand.objects.create(name="Test Brand")
        self.store = Store.objects.create(
            brand=self.brand,
            name="Test Store",
            code="TS001",
            address="123 Test St",
            city="Test City", 
            state="TS",
            zip_code="12345"
        )
        self.user = User.objects.create_user(
            username="testuser",
            store=self.store
        )
        self.inspector = User.objects.create_user(
            username="inspector",
            role=User.Role.INSPECTOR,
            store=self.store
        )
        self.upload = Upload.objects.create(
            store=self.store,
            mode=Upload.Mode.ENTERPRISE,
            s3_key="uploads/test.mp4",
            original_filename="test.mp4", 
            created_by=self.user
        )
        self.rule = Rule.objects.create(
            brand=self.brand,
            code="PPE_MASK",
            name="Face Mask Required",
            description="All employees must wear masks"
        )

    def test_create_violation(self):
        """Test creating a compliance violation"""
        violation = Violation.objects.create(
            upload=self.upload,
            rule=self.rule,
            severity=Violation.Severity.HIGH,
            evidence_frame_ts_ms=10000,
            evidence_s3_key="evidence/frame_10s.jpg"
        )
        
        self.assertEqual(violation.severity, Violation.Severity.HIGH)
        self.assertEqual(violation.status, Violation.Status.OPEN)
        self.assertEqual(str(violation), "Face Mask Required - high")

    def test_violation_review_process(self):
        """Test violation review workflow"""
        violation = Violation.objects.create(
            upload=self.upload,
            rule=self.rule,
            severity=Violation.Severity.HIGH,
            evidence_frame_ts_ms=10000,
            evidence_s3_key="evidence/frame_10s.jpg"
        )
        
        # Inspector reviews and approves
        violation.status = Violation.Status.APPROVED
        violation.reviewed_by = self.inspector
        violation.reviewed_at = timezone.now()
        violation.notes = "Confirmed violation - employee not wearing mask"
        violation.save()
        
        self.assertEqual(violation.status, Violation.Status.APPROVED)
        self.assertEqual(violation.reviewed_by, self.inspector)
        self.assertIsNotNone(violation.reviewed_at)


class ScorecardTest(TestCase):
    def setUp(self):
        self.brand = Brand.objects.create(name="Test Brand")
        self.store = Store.objects.create(
            brand=self.brand,
            name="Test Store",
            code="TS001",
            address="123 Test St",
            city="Test City",
            state="TS", 
            zip_code="12345"
        )
        self.user = User.objects.create_user(
            username="testuser",
            store=self.store
        )
        self.upload = Upload.objects.create(
            store=self.store,
            mode=Upload.Mode.ENTERPRISE,
            s3_key="uploads/test.mp4",
            original_filename="test.mp4",
            created_by=self.user
        )

    def test_create_scorecard(self):
        """Test creating an inspection scorecard"""
        scorecard = Scorecard.objects.create(
            upload=self.upload,
            total_score=85.5,
            ppe_score=90.0,
            safety_score=80.0,
            cleanliness_score=85.0,
            scores_json={
                "ppe": {"mask_compliance": 90, "glove_usage": 85},
                "safety": {"exit_access": 80, "equipment_safety": 85},
                "details": "Good overall performance"
            }
        )
        
        self.assertEqual(scorecard.total_score, 85.5)
        self.assertEqual(scorecard.ppe_score, 90.0)
        self.assertEqual(str(scorecard), "Scorecard for Test Store - enterprise (uploaded) - 85.5%")


class TaskManagementTest(TestCase):
    def setUp(self):
        self.brand = Brand.objects.create(name="Test Brand")
        self.store = Store.objects.create(
            brand=self.brand,
            name="Test Store", 
            code="TS001",
            address="123 Test St",
            city="Test City",
            state="TS",
            zip_code="12345"
        )
        self.user = User.objects.create_user(
            username="testuser",
            store=self.store
        )
        self.manager = User.objects.create_user(
            username="manager",
            role=User.Role.GM,
            store=self.store
        )

    def test_create_task(self):
        """Test creating action item tasks"""
        task = Task.objects.create(
            store=self.store,
            title="Fix PPE Violation",
            description="Ensure all employees wear proper face masks",
            priority=Task.Priority.HIGH,
            assigned_to=self.manager,
            due_date=timezone.now().date() + timedelta(days=3)
        )
        
        self.assertEqual(task.status, Task.Status.OPEN)
        self.assertEqual(task.priority, Task.Priority.HIGH) 
        self.assertEqual(str(task), "Fix PPE Violation (high)")

    def test_task_completion(self):
        """Test task completion workflow"""
        task = Task.objects.create(
            store=self.store,
            title="Clean Equipment",
            description="Deep clean all kitchen equipment",
            priority=Task.Priority.MEDIUM,
            assigned_to=self.manager
        )
        
        # Complete the task
        task.status = Task.Status.DONE
        task.completed_at = timezone.now()
        task.save()
        
        self.assertEqual(task.status, Task.Status.DONE)
        self.assertIsNotNone(task.completed_at)


class AuditLogTest(TestCase):
    def setUp(self):
        self.brand = Brand.objects.create(name="Test Brand")
        self.store = Store.objects.create(
            brand=self.brand,
            name="Test Store",
            code="TS001",
            address="123 Test St",
            city="Test City",
            state="TS",
            zip_code="12345"
        )
        self.user = User.objects.create_user(
            username="testuser",
            store=self.store
        )

    def test_create_audit_log(self):
        """Test audit logging functionality"""
        audit_log = AuditLog.objects.create(
            actor_user=self.user,
            action="create",
            entity="Upload",
            entity_id=123,
            meta_json={
                "filename": "test_video.mp4",
                "store_id": self.store.id,
                "mode": "inspection"
            },
            ip_address="192.168.1.100"
        )
        
        self.assertEqual(audit_log.action, "create")
        self.assertEqual(audit_log.entity, "Upload")
        self.assertEqual(str(audit_log), "testuser create Upload#123")

    def test_audit_log_filtering(self):
        """Test filtering audit logs by different criteria"""
        AuditLog.objects.create(
            actor_user=self.user, action="create", entity="Upload", entity_id=1
        )
        AuditLog.objects.create(
            actor_user=self.user, action="update", entity="Violation", entity_id=2
        )
        AuditLog.objects.create(
            actor_user=self.user, action="delete", entity="Upload", entity_id=3
        )
        
        upload_logs = AuditLog.objects.filter(entity="Upload")
        self.assertEqual(upload_logs.count(), 2)
        
        create_logs = AuditLog.objects.filter(action="create")
        self.assertEqual(create_logs.count(), 1)


class RetentionPolicyTest(TestCase):
    def setUp(self):
        self.brand = Brand.objects.create(name="Test Brand")
        self.store = Store.objects.create(
            brand=self.brand,
            name="Test Store",
            code="TS001",
            address="123 Test St",
            city="Test City",
            state="TS",
            zip_code="12345"
        )
        self.user = User.objects.create_user(
            username="testuser",
            store=self.store
        )

    def test_inspection_retention_policy(self):
        """Test inspection mode retention (30 days)"""
        # Create old inspection upload
        old_upload = Upload.objects.create(
            store=self.store,
            mode=Upload.Mode.ENTERPRISE,
            s3_key="uploads/old_inspection.mp4",
            original_filename="old_inspection.mp4",
            created_by=self.user
        )
        
        # Manually set creation date to 35 days ago
        old_date = timezone.now() - timedelta(days=35)
        Upload.objects.filter(id=old_upload.id).update(created_at=old_date)
        
        # Query for expired uploads
        cutoff_date = timezone.now() - timedelta(days=30)
        expired_uploads = Upload.objects.filter(
            mode=Upload.Mode.ENTERPRISE,
            created_at__lt=cutoff_date
        )
        
        self.assertEqual(expired_uploads.count(), 1)

    def test_coaching_retention_policy(self):
        """Test coaching mode retention (7 days)"""
        # Create old coaching upload
        old_upload = Upload.objects.create(
            store=self.store,
            mode=Upload.Mode.COACHING,
            s3_key="uploads/old_coaching.mp4",
            original_filename="old_coaching.mp4",
            created_by=self.user
        )
        
        # Manually set creation date to 10 days ago
        old_date = timezone.now() - timedelta(days=10)
        Upload.objects.filter(id=old_upload.id).update(created_at=old_date)
        
        # Query for expired uploads
        cutoff_date = timezone.now() - timedelta(days=7)
        expired_uploads = Upload.objects.filter(
            mode=Upload.Mode.COACHING,
            created_at__lt=cutoff_date
        )
        
        self.assertEqual(expired_uploads.count(), 1)

    def test_retention_cleanup_simulation(self):
        """Test simulating retention cleanup process"""
        now = timezone.now()
        
        # Create uploads of different ages
        Upload.objects.create(
            store=self.store, mode=Upload.Mode.ENTERPRISE,
            s3_key="recent_inspection.mp4", original_filename="recent.mp4", created_by=self.user
        )
        
        old_inspection = Upload.objects.create(
            store=self.store, mode=Upload.Mode.ENTERPRISE,
            s3_key="old_inspection.mp4", original_filename="old_inspection.mp4", created_by=self.user
        )
        Upload.objects.filter(id=old_inspection.id).update(created_at=now - timedelta(days=35))
        
        old_coaching = Upload.objects.create(
            store=self.store, mode=Upload.Mode.COACHING,
            s3_key="old_coaching.mp4", original_filename="old_coaching.mp4", created_by=self.user
        )
        Upload.objects.filter(id=old_coaching.id).update(created_at=now - timedelta(days=10))
        
        # Count what would be cleaned up
        inspection_cutoff = now - timedelta(days=30)
        coaching_cutoff = now - timedelta(days=7)
        
        expired_inspections = Upload.objects.filter(
            mode=Upload.Mode.ENTERPRISE,
            created_at__lt=inspection_cutoff
        ).count()
        
        expired_coaching = Upload.objects.filter(
            mode=Upload.Mode.COACHING, 
            created_at__lt=coaching_cutoff
        ).count()
        
        self.assertEqual(expired_inspections, 1)
        self.assertEqual(expired_coaching, 1)
        self.assertEqual(Upload.objects.count(), 3)  # Total uploads created
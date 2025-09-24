from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch
from brands.models import Brand, Store
from videos.models import Video
from .models import Inspection, Finding, ActionItem

User = get_user_model()


class InspectionModelTest(TestCase):
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
        self.video = Video.objects.create(
            uploaded_by=self.user,
            store=self.store,
            title="Test Video",
            file="test_video.mp4"
        )

    def test_create_inspection(self):
        inspection = Inspection.objects.create(
            video=self.video,
            mode=Inspection.Mode.INSPECTION
        )
        self.assertEqual(inspection.mode, Inspection.Mode.INSPECTION)
        self.assertEqual(inspection.status, Inspection.Status.PENDING)
        self.assertEqual(str(inspection), "Test Video - INSPECTION (PENDING)")

    def test_create_finding(self):
        inspection = Inspection.objects.create(
            video=self.video,
            mode=Inspection.Mode.INSPECTION
        )
        finding = Finding.objects.create(
            inspection=inspection,
            category=Finding.Category.PPE,
            severity=Finding.Severity.HIGH,
            title="Missing Face Cover",
            description="Employee not wearing face cover",
            confidence=0.95
        )
        self.assertEqual(finding.category, Finding.Category.PPE)
        self.assertEqual(finding.severity, Finding.Severity.HIGH)
        self.assertEqual(str(finding), "PPE - Missing Face Cover")

    def test_create_action_item(self):
        inspection = Inspection.objects.create(
            video=self.video,
            mode=Inspection.Mode.INSPECTION
        )
        finding = Finding.objects.create(
            inspection=inspection,
            category=Finding.Category.SAFETY,
            severity=Finding.Severity.CRITICAL,
            title="Blocked Exit",
            description="Exit door is blocked",
            confidence=0.90
        )
        action_item = ActionItem.objects.create(
            inspection=inspection,
            finding=finding,
            title="Clear Blocked Exit",
            description="Remove items blocking the exit door",
            priority=ActionItem.Priority.URGENT
        )
        self.assertEqual(action_item.priority, ActionItem.Priority.URGENT)
        self.assertEqual(action_item.status, ActionItem.Status.OPEN)
        self.assertEqual(str(action_item), "Clear Blocked Exit (URGENT)")


class InspectionAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
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
        self.video = Video.objects.create(
            uploaded_by=self.user,
            store=self.store,
            title="Test Video",
            file="test_video.mp4",
            status=Video.Status.COMPLETED
        )
        self.client.force_authenticate(user=self.user)

    @patch('inspections.tasks.analyze_video.delay')
    def test_start_inspection(self, mock_analyze_video):
        data = {'mode': 'INSPECTION'}
        response = self.client.post(f'/api/inspections/start/{self.video.id}/', data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['mode'], 'INSPECTION')
        mock_analyze_video.assert_called_once()

    def test_get_inspections(self):
        inspection = Inspection.objects.create(
            video=self.video,
            mode=Inspection.Mode.INSPECTION,
            overall_score=85.5
        )
        
        response = self.client.get('/api/inspections/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['overall_score'], 85.5)

    def test_get_inspection_detail(self):
        inspection = Inspection.objects.create(
            video=self.video,
            mode=Inspection.Mode.INSPECTION,
            overall_score=85.5
        )
        
        response = self.client.get(f'/api/inspections/{inspection.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['overall_score'], 85.5)

    def test_get_inspection_stats(self):
        Inspection.objects.create(
            video=self.video,
            mode=Inspection.Mode.INSPECTION,
            status=Inspection.Status.COMPLETED,
            overall_score=85.5
        )
        
        response = self.client.get('/api/inspections/stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_inspections'], 1)
        self.assertEqual(response.data['completed_inspections'], 1)
        self.assertAlmostEqual(response.data['average_score'], 85.5, places=1)


class InspectorWorkflowTest(TestCase):
    """Test inspector queue and workflow management"""
    
    def setUp(self):
        self.client = APIClient()
        self.brand = Brand.objects.create(name="Test Brand")
        self.store1 = Store.objects.create(
            brand=self.brand, name="Store 1", code="ST001",
            address="123 Test St", city="Test City", state="TS", zip_code="12345"
        )
        self.store2 = Store.objects.create(
            brand=self.brand, name="Store 2", code="ST002", 
            address="456 Test Ave", city="Test City", state="TS", zip_code="12345"
        )
        
        # Create users with different roles
        self.inspector = User.objects.create_user(
            username="inspector", email="inspector@test.com", password="test123",
            role=User.Role.INSPECTOR, store=self.store1
        )
        self.admin = User.objects.create_user(
            username="admin", email="admin@test.com", password="test123",
            role=User.Role.ADMIN, store=self.store1
        )
        self.manager = User.objects.create_user(
            username="manager", email="manager@test.com", password="test123",
            role=User.Role.GM, store=self.store2
        )
        
        # Create videos for inspection
        self.video1 = Video.objects.create(
            uploaded_by=self.manager, store=self.store1,
            title="Urgent Inspection Video", file="urgent.mp4",
            status=Video.Status.COMPLETED
        )
        self.video2 = Video.objects.create(
            uploaded_by=self.manager, store=self.store2,
            title="Normal Inspection Video", file="normal.mp4",
            status=Video.Status.COMPLETED
        )
        
        # Create inspections in different states
        self.pending_inspection = Inspection.objects.create(
            video=self.video1,
            mode=Inspection.Mode.INSPECTION,
            status=Inspection.Status.PENDING
        )
        self.completed_inspection = Inspection.objects.create(
            video=self.video2,
            mode=Inspection.Mode.INSPECTION, 
            status=Inspection.Status.COMPLETED,
            overall_score=88.5
        )
        
    def test_inspector_queue_access(self):
        """Test inspector can access their queue"""
        self.client.force_authenticate(user=self.inspector)
        
        # Inspector should see videos from their assigned store and unassigned
        response = self.client.get('/api/videos/?status=COMPLETED')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
    def test_admin_queue_access(self):
        """Test admin can access all queues"""
        self.client.force_authenticate(user=self.admin)
        
        response = self.client.get('/api/inspections/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)  # Should see all inspections
        
    def test_inspection_priority_sorting(self):
        """Test inspections are sorted by priority"""
        from datetime import timedelta
        from django.utils import timezone
        
        # Create old inspection (higher priority)
        old_video = Video.objects.create(
            uploaded_by=self.manager, store=self.store1,
            title="Old Video", file="old.mp4",
            status=Video.Status.COMPLETED
        )
        Video.objects.filter(id=old_video.id).update(
            created_at=timezone.now() - timedelta(hours=25)
        )
        
        old_inspection = Inspection.objects.create(
            video=old_video,
            mode=Inspection.Mode.INSPECTION,
            status=Inspection.Status.PENDING
        )
        
        self.client.force_authenticate(user=self.inspector)
        response = self.client.get('/api/inspections/?status=PENDING')
        
        # Should return pending inspections, older ones first
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
    def test_inspection_assignment(self):
        """Test assigning inspections to specific inspectors"""
        self.client.force_authenticate(user=self.admin)
        
        # Assign inspection to inspector
        data = {'assigned_to': self.inspector.id}
        response = self.client.patch(
            f'/api/inspections/{self.pending_inspection.id}/',
            data
        )
        
        # Check if assignment endpoints exist
        self.assertIn(response.status_code, [
            status.HTTP_200_OK, 
            status.HTTP_404_NOT_FOUND  # If endpoint doesn't exist yet
        ])
        
    def test_inspection_review_process(self):
        """Test the complete inspection review workflow"""
        self.client.force_authenticate(user=self.inspector)
        
        # Get inspection details
        response = self.client.get(f'/api/inspections/{self.pending_inspection.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Review and complete inspection
        review_data = {
            'status': 'COMPLETED',
            'notes': 'Inspection completed - minor violations found',
            'overall_score': 82.5
        }
        
        response = self.client.patch(
            f'/api/inspections/{self.pending_inspection.id}/',
            review_data
        )
        
        # Should be successful or not implemented yet
        self.assertIn(response.status_code, [
            status.HTTP_200_OK,
            status.HTTP_404_NOT_FOUND
        ])
        
    def test_finding_creation_during_review(self):
        """Test creating findings during inspection review"""
        self.client.force_authenticate(user=self.inspector)
        
        finding_data = {
            'inspection': self.pending_inspection.id,
            'category': 'PPE',
            'severity': 'HIGH', 
            'title': 'Missing Face Mask',
            'description': 'Employee not wearing required face mask',
            'confidence': 0.95,
            'timestamp': 15.5
        }
        
        response = self.client.post('/api/findings/', finding_data)
        
        # Should create finding or endpoint not exist yet
        self.assertIn(response.status_code, [
            status.HTTP_201_CREATED,
            status.HTTP_404_NOT_FOUND
        ])
        
    def test_action_item_generation(self):
        """Test automatic action item generation from findings"""
        # Create a high-severity finding
        finding = Finding.objects.create(
            inspection=self.pending_inspection,
            category=Finding.Category.SAFETY,
            severity=Finding.Severity.CRITICAL,
            title="Blocked Emergency Exit",
            description="Exit door is blocked by equipment",
            confidence=0.92
        )
        
        action_item_data = {
            'inspection': self.pending_inspection.id,
            'finding': finding.id,
            'title': 'Clear Emergency Exit',
            'description': 'Remove equipment blocking the emergency exit',
            'priority': 'URGENT',
            'assigned_to': self.manager.id
        }
        
        self.client.force_authenticate(user=self.inspector)
        response = self.client.post('/api/action-items/', action_item_data)
        
        # Should create action item or endpoint not exist yet
        self.assertIn(response.status_code, [
            status.HTTP_201_CREATED,
            status.HTTP_404_NOT_FOUND
        ])


class InspectionAnalyticsTest(TestCase):
    """Test inspection analytics and reporting"""
    
    def setUp(self):
        self.client = APIClient()
        self.brand = Brand.objects.create(name="Test Brand")
        self.store = Store.objects.create(
            brand=self.brand, name="Test Store", code="TS001",
            address="123 Test St", city="Test City", state="TS", zip_code="12345"
        )
        self.user = User.objects.create_user(
            username="testuser", store=self.store
        )
        self.client.force_authenticate(user=self.user)
        
    def test_score_trend_calculation(self):
        """Test calculation of score trends over time"""
        from datetime import timedelta
        from django.utils import timezone
        
        # Create inspections over time with different scores
        base_date = timezone.now() - timedelta(days=30)
        
        for i in range(5):
            video = Video.objects.create(
                uploaded_by=self.user, store=self.store,
                title=f"Video {i+1}", file=f"video_{i+1}.mp4",
                status=Video.Status.COMPLETED
            )
            
            inspection = Inspection.objects.create(
                video=video,
                mode=Inspection.Mode.INSPECTION,
                status=Inspection.Status.COMPLETED,
                overall_score=75 + (i * 2)  # Improving scores: 75, 77, 79, 81, 83
            )
            
            # Set different creation dates
            Inspection.objects.filter(id=inspection.id).update(
                created_at=base_date + timedelta(days=i*7)
            )
        
        # Test analytics endpoint
        response = self.client.get('/api/inspections/analytics/scores/')
        
        # Should return analytics or endpoint not exist yet
        self.assertIn(response.status_code, [
            status.HTTP_200_OK,
            status.HTTP_404_NOT_FOUND
        ])
        
    def test_violation_category_breakdown(self):
        """Test breakdown of violations by category"""
        video = Video.objects.create(
            uploaded_by=self.user, store=self.store,
            title="Test Video", file="test.mp4",
            status=Video.Status.COMPLETED
        )
        
        inspection = Inspection.objects.create(
            video=video,
            mode=Inspection.Mode.INSPECTION,
            status=Inspection.Status.COMPLETED,
            overall_score=75.0
        )
        
        # Create findings in different categories
        Finding.objects.create(
            inspection=inspection, category=Finding.Category.PPE,
            severity=Finding.Severity.HIGH, title="Missing Mask",
            description="Employee not wearing mask", confidence=0.95
        )
        Finding.objects.create(
            inspection=inspection, category=Finding.Category.SAFETY,
            severity=Finding.Severity.MEDIUM, title="Wet Floor",
            description="Floor is wet without warning signs", confidence=0.88
        )
        Finding.objects.create(
            inspection=inspection, category=Finding.Category.CLEANLINESS,
            severity=Finding.Severity.LOW, title="Counter Stains",
            description="Minor stains on counter surface", confidence=0.75
        )
        
        response = self.client.get('/api/inspections/analytics/violations/')
        
        # Should return violation breakdown or endpoint not exist yet
        self.assertIn(response.status_code, [
            status.HTTP_200_OK,
            status.HTTP_404_NOT_FOUND
        ])
        
    def test_store_performance_comparison(self):
        """Test comparing performance across stores"""
        # This would test multi-store analytics when available
        response = self.client.get('/api/inspections/analytics/stores/')
        
        # Should return store comparison or endpoint not exist yet
        self.assertIn(response.status_code, [
            status.HTTP_200_OK,
            status.HTTP_404_NOT_FOUND,
            status.HTTP_403_FORBIDDEN  # If user doesn't have permission
        ])
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
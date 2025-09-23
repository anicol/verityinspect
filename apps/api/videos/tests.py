from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch, MagicMock
from brands.models import Brand, Store
from .models import Video, VideoFrame
from .tasks import extract_video_metadata, generate_thumbnail

User = get_user_model()


class VideoModelTest(TestCase):
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

    def test_create_video(self):
        video = Video.objects.create(
            uploaded_by=self.user,
            store=self.store,
            title="Test Video",
            description="Test description",
            file="test_video.mp4"
        )
        self.assertEqual(video.title, "Test Video")
        self.assertEqual(video.status, Video.Status.UPLOADED)
        self.assertEqual(str(video), "Test Video - Test Store")

    def test_video_frame_creation(self):
        video = Video.objects.create(
            uploaded_by=self.user,
            store=self.store,
            title="Test Video",
            file="test_video.mp4"
        )
        frame = VideoFrame.objects.create(
            video=video,
            timestamp=5.0,
            frame_number=1,
            image="frames/test_frame.jpg",
            width=1920,
            height=1080
        )
        self.assertEqual(frame.timestamp, 5.0)
        self.assertEqual(str(frame), "Test Video - Frame 1")


class VideoTasksTest(TestCase):
    @patch('videos.tasks.subprocess.run')
    def test_extract_video_metadata(self, mock_subprocess):
        mock_subprocess.return_value = MagicMock(
            stdout='{"format": {"duration": "30.5", "size": "1024000", "bit_rate": "2000"}, "streams": [{"codec_type": "video", "width": 1920, "height": 1080, "r_frame_rate": "30/1", "codec_name": "h264"}]}',
            returncode=0
        )
        
        metadata = extract_video_metadata("/fake/path/video.mp4")
        
        self.assertEqual(metadata['duration'], 30.5)
        self.assertEqual(metadata['width'], 1920)
        self.assertEqual(metadata['height'], 1080)

    @patch('videos.tasks.subprocess.run')
    @patch('videos.tasks.os.makedirs')
    def test_generate_thumbnail(self, mock_makedirs, mock_subprocess):
        mock_subprocess.return_value = MagicMock(returncode=0)
        
        result = generate_thumbnail("/fake/path/video.mp4", 1)
        
        self.assertEqual(result, "thumbnails/video_1_thumb.jpg")
        mock_subprocess.assert_called_once()


class VideoAPITest(TestCase):
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
        self.client.force_authenticate(user=self.user)

    def test_get_videos(self):
        Video.objects.create(
            uploaded_by=self.user,
            store=self.store,
            title="Test Video",
            file="test_video.mp4"
        )
        
        response = self.client.get('/api/videos/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    @patch('videos.serializers.process_video.delay')
    def test_upload_video(self, mock_process_video):
        video_file = SimpleUploadedFile(
            "test_video.mp4",
            b"fake video content",
            content_type="video/mp4"
        )
        
        data = {
            'title': 'Test Upload',
            'description': 'Test description',
            'store': self.store.id,
            'file': video_file
        }
        
        response = self.client.post('/api/videos/', data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Test Upload')
        mock_process_video.assert_called_once()

    def test_get_video_detail(self):
        video = Video.objects.create(
            uploaded_by=self.user,
            store=self.store,
            title="Test Video",
            file="test_video.mp4"
        )
        
        response = self.client.get(f'/api/videos/{video.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Test Video')
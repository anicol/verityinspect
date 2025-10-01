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

    @patch('videos.tasks.default_storage.save')
    @patch('videos.tasks.subprocess.run')
    @patch('videos.tasks.os.makedirs')
    @patch('videos.tasks.os.path.exists')
    @patch('builtins.open', new_callable=MagicMock)
    def test_generate_thumbnail(self, mock_open, mock_exists, mock_makedirs, mock_subprocess, mock_storage_save):
        mock_subprocess.return_value = MagicMock(returncode=0)
        mock_exists.return_value = True  # Pretend temp file exists after ffmpeg
        mock_open.return_value.__enter__.return_value.read.return_value = b'fake_thumbnail_data'
        mock_storage_save.return_value = "thumbnails/video_1_thumb.jpg"

        result = generate_thumbnail("/fake/path/video.mp4", 1)

        self.assertEqual(result, "thumbnails/video_1_thumb.jpg")
        mock_subprocess.assert_called_once()
        mock_storage_save.assert_called_once()


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
        self.assertEqual(len(response.data['results']), 1)

    @patch('django.core.files.storage.default_storage.save')
    @patch('django.core.files.storage.default_storage.size')
    def test_upload_video(self, mock_storage_size, mock_storage_save):
        mock_storage_save.return_value = 'videos/test_video.mp4'
        mock_storage_size.return_value = 1024  # Mock file size in bytes

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
        # NOTE: process_video task is no longer triggered by this endpoint
        # Use Upload API (/api/uploads/) for actual video processing

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
        
    def test_video_status_filtering(self):
        """Test filtering videos by status"""
        Video.objects.create(
            uploaded_by=self.user, store=self.store,
            title="Processing Video", file="processing.mp4",
            status=Video.Status.PROCESSING
        )
        Video.objects.create(
            uploaded_by=self.user, store=self.store, 
            title="Complete Video", file="complete.mp4",
            status=Video.Status.COMPLETED
        )
        
        response = self.client.get('/api/videos/?status=PROCESSING')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['title'], 'Processing Video')

    def test_upload_video_invalid_file(self):
        """Test upload with invalid file type"""
        invalid_file = SimpleUploadedFile(
            "test.txt",
            b"not a video file",
            content_type="text/plain"
        )
        
        data = {
            'title': 'Invalid Upload',
            'store': self.store.id,
            'file': invalid_file
        }
        
        response = self.client.post('/api/videos/', data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
    def test_upload_video_missing_title(self):
        """Test upload without required title field"""
        video_file = SimpleUploadedFile(
            "test_video.mp4",
            b"fake video content",
            content_type="video/mp4"
        )
        
        data = {
            'store': self.store.id,
            'file': video_file
        }
        
        response = self.client.post('/api/videos/', data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('title', str(response.data))
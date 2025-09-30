from django.test import TestCase, override_settings
from unittest.mock import patch, Mock, MagicMock
from botocore.exceptions import ClientError, BotoCoreError
from .rekognition import RekognitionService
from .analyzer import VideoAnalyzer
import logging

# Disable logging during tests
logging.disable(logging.CRITICAL)


class RekognitionServiceTest(TestCase):
    """Test AWS Rekognition service integration"""

    def setUp(self):
        """Set up test fixtures"""
        self.sample_image_bytes = b'fake_image_data'

    @override_settings(ENABLE_AWS_REKOGNITION=True, AWS_ACCESS_KEY_ID='test_key')
    @patch('ai_services.rekognition.boto3.client')
    def test_ppe_detection_success(self, mock_boto3):
        """Test successful PPE detection with mocked AWS response"""
        # Mock boto3 client
        mock_client = Mock()
        mock_boto3.return_value = mock_client

        # Mock AWS Rekognition response
        mock_client.detect_protective_equipment.return_value = {
            'Persons': [
                {
                    'Confidence': 95.5,
                    'BoundingBox': {'Width': 0.3, 'Height': 0.8, 'Left': 0.2, 'Top': 0.1},
                    'BodyParts': [
                        {
                            'Name': 'FACE',
                            'Confidence': 98.2,
                            'BoundingBox': {'Width': 0.1, 'Height': 0.15, 'Left': 0.25, 'Top': 0.15},
                            'EquipmentDetections': [
                                {
                                    'Type': 'FACE_COVER',
                                    'Confidence': 85.0,
                                    'CoversBodyPart': {'Value': True, 'Confidence': 90.0},
                                    'BoundingBox': {'Width': 0.08, 'Height': 0.1, 'Left': 0.26, 'Top': 0.18}
                                }
                            ]
                        },
                        {
                            'Name': 'LEFT_HAND',
                            'Confidence': 96.3,
                            'BoundingBox': {'Width': 0.05, 'Height': 0.08, 'Left': 0.15, 'Top': 0.5},
                            'EquipmentDetections': [
                                {
                                    'Type': 'HAND_COVER',
                                    'Confidence': 88.5,
                                    'CoversBodyPart': {'Value': True, 'Confidence': 92.0},
                                    'BoundingBox': {'Width': 0.04, 'Height': 0.06, 'Left': 0.16, 'Top': 0.51}
                                }
                            ]
                        }
                    ]
                }
            ]
        }

        # Initialize service and test
        service = RekognitionService()
        result = service.detect_ppe(self.sample_image_bytes)

        # Assertions
        self.assertEqual(result['summary']['total_persons'], 1)
        self.assertEqual(result['summary']['persons_with_face_cover'], 1)
        self.assertEqual(result['summary']['persons_with_hand_cover'], 1)
        self.assertEqual(len(result['persons']), 1)
        self.assertEqual(len(result['persons'][0]['body_parts']), 2)

        # Verify boto3 was called correctly
        mock_client.detect_protective_equipment.assert_called_once()
        call_args = mock_client.detect_protective_equipment.call_args
        self.assertEqual(call_args[1]['Image']['Bytes'], self.sample_image_bytes)
        self.assertEqual(call_args[1]['SummarizationAttributes']['MinConfidence'], 80)

    @override_settings(ENABLE_AWS_REKOGNITION=True, AWS_ACCESS_KEY_ID='test_key')
    @patch('ai_services.rekognition.boto3.client')
    def test_ppe_detection_no_equipment(self, mock_boto3):
        """Test PPE detection when no equipment is detected"""
        mock_client = Mock()
        mock_boto3.return_value = mock_client

        mock_client.detect_protective_equipment.return_value = {
            'Persons': [
                {
                    'Confidence': 94.2,
                    'BoundingBox': {'Width': 0.3, 'Height': 0.8, 'Left': 0.2, 'Top': 0.1},
                    'BodyParts': [
                        {
                            'Name': 'FACE',
                            'Confidence': 97.5,
                            'BoundingBox': {'Width': 0.1, 'Height': 0.15, 'Left': 0.25, 'Top': 0.15},
                            'EquipmentDetections': []  # No equipment
                        }
                    ]
                }
            ]
        }

        service = RekognitionService()
        result = service.detect_ppe(self.sample_image_bytes)

        self.assertEqual(result['summary']['total_persons'], 1)
        self.assertEqual(result['summary']['persons_with_face_cover'], 0)
        self.assertEqual(result['summary']['persons_with_hand_cover'], 0)

    @override_settings(ENABLE_AWS_REKOGNITION=True, AWS_ACCESS_KEY_ID='test_key')
    @patch('ai_services.rekognition.boto3.client')
    def test_ppe_detection_person_counting_bug_fix(self, mock_boto3):
        """Test that person counting doesn't duplicate count when same person has multiple equipment"""
        mock_client = Mock()
        mock_boto3.return_value = mock_client

        # One person with face cover on both FACE and HEAD body parts
        mock_client.detect_protective_equipment.return_value = {
            'Persons': [
                {
                    'Confidence': 95.0,
                    'BoundingBox': {'Width': 0.3, 'Height': 0.8, 'Left': 0.2, 'Top': 0.1},
                    'BodyParts': [
                        {
                            'Name': 'FACE',
                            'Confidence': 98.0,
                            'BoundingBox': {'Width': 0.1, 'Height': 0.15, 'Left': 0.25, 'Top': 0.15},
                            'EquipmentDetections': [
                                {
                                    'Type': 'FACE_COVER',
                                    'Confidence': 85.0,
                                    'CoversBodyPart': {'Value': True},
                                    'BoundingBox': {}
                                }
                            ]
                        },
                        {
                            'Name': 'HEAD',
                            'Confidence': 97.0,
                            'BoundingBox': {'Width': 0.12, 'Height': 0.18, 'Left': 0.24, 'Top': 0.12},
                            'EquipmentDetections': [
                                {
                                    'Type': 'HEAD_COVER',
                                    'Confidence': 90.0,
                                    'CoversBodyPart': {'Value': True},
                                    'BoundingBox': {}
                                }
                            ]
                        }
                    ]
                }
            ]
        }

        service = RekognitionService()
        result = service.detect_ppe(self.sample_image_bytes)

        # Should count as 1 person, not multiple
        self.assertEqual(result['summary']['total_persons'], 1)
        # This person should be counted once for face cover, once for head cover
        self.assertEqual(result['summary']['persons_with_face_cover'], 1)
        self.assertEqual(result['summary']['persons_with_head_cover'], 1)

    @override_settings(ENABLE_AWS_REKOGNITION=True, AWS_ACCESS_KEY_ID='test_key')
    @patch('ai_services.rekognition.boto3.client')
    def test_object_detection_success(self, mock_boto3):
        """Test successful object detection with mocked AWS response"""
        mock_client = Mock()
        mock_boto3.return_value = mock_client

        mock_client.detect_labels.return_value = {
            'Labels': [
                {
                    'Name': 'Fire Extinguisher',
                    'Confidence': 92.3,
                    'Instances': [
                        {
                            'Confidence': 92.3,
                            'BoundingBox': {'Width': 0.1, 'Height': 0.3, 'Left': 0.05, 'Top': 0.4}
                        }
                    ]
                },
                {
                    'Name': 'Exit Sign',
                    'Confidence': 95.8,
                    'Instances': [
                        {
                            'Confidence': 95.8,
                            'BoundingBox': {'Width': 0.15, 'Height': 0.1, 'Left': 0.8, 'Top': 0.05}
                        }
                    ]
                },
                {
                    'Name': 'Floor',
                    'Confidence': 88.5,
                    'Instances': []
                },
                {
                    'Name': 'Spill',
                    'Confidence': 76.2,
                    'Instances': [
                        {
                            'Confidence': 76.2,
                            'BoundingBox': {'Width': 0.2, 'Height': 0.15, 'Left': 0.4, 'Top': 0.7}
                        }
                    ]
                }
            ]
        }

        service = RekognitionService()
        result = service.detect_objects(self.sample_image_bytes)

        # Check categorization
        self.assertEqual(len(result['safety_objects']), 2)  # Fire extinguisher and exit sign
        self.assertEqual(len(result['cleanliness_objects']), 2)  # Floor and spill
        self.assertEqual(len(result['all_labels']), 4)

        # Verify boto3 was called correctly
        mock_client.detect_labels.assert_called_once()
        call_args = mock_client.detect_labels.call_args
        self.assertEqual(call_args[1]['MaxLabels'], 50)
        self.assertEqual(call_args[1]['MinConfidence'], 70)

    @override_settings(ENABLE_AWS_REKOGNITION=True, AWS_ACCESS_KEY_ID='test_key')
    @patch('ai_services.rekognition.boto3.client')
    def test_ppe_detection_client_error(self, mock_boto3):
        """Test that ClientError raises exception instead of silent fallback"""
        mock_client = Mock()
        mock_boto3.return_value = mock_client

        # Simulate AWS API error
        mock_client.detect_protective_equipment.side_effect = ClientError(
            {'Error': {'Code': 'InvalidParameterException', 'Message': 'Invalid image'}},
            'DetectProtectiveEquipment'
        )

        service = RekognitionService()

        # Should raise exception, not return mock data
        with self.assertRaises(ClientError):
            service.detect_ppe(self.sample_image_bytes)

    @override_settings(ENABLE_AWS_REKOGNITION=True, AWS_ACCESS_KEY_ID='test_key')
    @patch('ai_services.rekognition.boto3.client')
    def test_object_detection_client_error(self, mock_boto3):
        """Test that ClientError raises exception for object detection"""
        mock_client = Mock()
        mock_boto3.return_value = mock_client

        mock_client.detect_labels.side_effect = BotoCoreError()

        service = RekognitionService()

        with self.assertRaises(BotoCoreError):
            service.detect_objects(self.sample_image_bytes)

    @override_settings(ENABLE_AWS_REKOGNITION=False)
    def test_rekognition_disabled_raises_error(self):
        """Test that disabled Rekognition raises clear error"""
        service = RekognitionService()

        with self.assertRaises(RuntimeError) as context:
            service.detect_ppe(self.sample_image_bytes)

        self.assertIn('not enabled', str(context.exception).lower())

    @override_settings(ENABLE_AWS_REKOGNITION=True, AWS_ACCESS_KEY_ID='')
    def test_missing_credentials_raises_error(self):
        """Test that missing AWS credentials raises clear error"""
        service = RekognitionService()

        with self.assertRaises(RuntimeError) as context:
            service.detect_ppe(self.sample_image_bytes)

        self.assertIn('credentials', str(context.exception).lower())


class VideoAnalyzerTest(TestCase):
    """Test VideoAnalyzer integration with RekognitionService"""

    @override_settings(ENABLE_AWS_REKOGNITION=True, AWS_ACCESS_KEY_ID='test_key')
    @patch('ai_services.rekognition.boto3.client')
    @patch('ai_services.yolo_detector.YOLODetector.detect_objects')
    @patch('ai_services.yolo_detector.YOLODetector.detect_uniform_compliance')
    @patch('ai_services.ocr_service.OCRService.analyze_menu_board')
    def test_analyze_frame_with_rekognition_success(self, mock_ocr, mock_yolo_uniform,
                                                      mock_yolo_objects, mock_boto3):
        """Test frame analysis when Rekognition succeeds"""
        # Mock Rekognition
        mock_client = Mock()
        mock_boto3.return_value = mock_client
        mock_client.detect_protective_equipment.return_value = {
            'Persons': [{
                'Confidence': 95.0,
                'BoundingBox': {},
                'BodyParts': [{
                    'Name': 'FACE',
                    'Confidence': 98.0,
                    'BoundingBox': {},
                    'EquipmentDetections': [{
                        'Type': 'FACE_COVER',
                        'Confidence': 85.0,
                        'CoversBodyPart': {'Value': True},
                        'BoundingBox': {}
                    }]
                }]
            }]
        }
        mock_client.detect_labels.return_value = {'Labels': []}

        # Mock other services
        mock_yolo_objects.return_value = {'safety_objects': [], 'cleanliness_objects': []}
        mock_yolo_uniform.return_value = {'compliance_score': 95.0}
        mock_ocr.return_value = {'compliance_score': 90.0, 'compliance_issues': []}

        # Test
        analyzer = VideoAnalyzer()
        result = analyzer.analyze_frame('/fake/path.jpg', b'fake_bytes')

        # Verify Rekognition results are included
        self.assertIn('ppe_analysis', result)
        self.assertEqual(result['ppe_analysis']['summary']['total_persons'], 1)
        self.assertGreater(result['overall_score'], 0)

    @override_settings(ENABLE_AWS_REKOGNITION=True, AWS_ACCESS_KEY_ID='test_key')
    @patch('ai_services.rekognition.boto3.client')
    @patch('ai_services.yolo_detector.YOLODetector.detect_objects')
    @patch('ai_services.yolo_detector.YOLODetector.detect_uniform_compliance')
    @patch('ai_services.ocr_service.OCRService.analyze_menu_board')
    def test_analyze_frame_when_rekognition_fails(self, mock_ocr, mock_yolo_uniform,
                                                   mock_yolo_objects, mock_boto3):
        """Test frame analysis continues when Rekognition fails"""
        # Mock Rekognition to fail
        mock_client = Mock()
        mock_boto3.return_value = mock_client
        mock_client.detect_protective_equipment.side_effect = ClientError(
            {'Error': {'Code': 'ServiceUnavailable', 'Message': 'Service unavailable'}},
            'DetectProtectiveEquipment'
        )

        # Mock other services to succeed
        mock_yolo_objects.return_value = {'safety_objects': [], 'cleanliness_objects': []}
        mock_yolo_uniform.return_value = {'compliance_score': 95.0}
        mock_ocr.return_value = {'compliance_score': 90.0, 'compliance_issues': []}

        # Test - should not raise, should continue with other services
        analyzer = VideoAnalyzer()
        result = analyzer.analyze_frame('/fake/path.jpg', b'fake_bytes')

        # Should have partial results
        self.assertIn('error', result)
        self.assertIn('uniform_analysis', result)
        self.assertIn('menu_board_analysis', result)
        # Score should still be calculated from available services
        self.assertGreaterEqual(result['overall_score'], 0)


# Re-enable logging after tests
logging.disable(logging.NOTSET)

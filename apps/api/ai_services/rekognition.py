import boto3
from django.conf import settings
from botocore.exceptions import ClientError, BotoCoreError
import logging

logger = logging.getLogger(__name__)


class RekognitionService:
    def __init__(self):
        self.client = None
        if settings.ENABLE_AWS_REKOGNITION and settings.AWS_ACCESS_KEY_ID:
            try:
                self.client = boto3.client(
                    'rekognition',
                    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                    region_name=settings.AWS_S3_REGION_NAME
                )
            except Exception as e:
                logger.error(f"Failed to initialize Rekognition client: {e}")

    def detect_ppe(self, image_bytes):
        """Detect Personal Protective Equipment in image"""
        if not self.client:
            return self._mock_ppe_detection()

        try:
            response = self.client.detect_protective_equipment(
                Image={'Bytes': image_bytes},
                SummarizationAttributes={
                    'MinConfidence': 80,
                    'RequiredEquipmentTypes': ['FACE_COVER', 'HAND_COVER', 'HEAD_COVER']
                }
            )
            return self._process_ppe_response(response)
        except (ClientError, BotoCoreError) as e:
            logger.error(f"Rekognition PPE detection error: {e}")
            return self._mock_ppe_detection()

    def detect_objects(self, image_bytes):
        """Detect general objects in image"""
        if not self.client:
            return self._mock_object_detection()

        try:
            response = self.client.detect_labels(
                Image={'Bytes': image_bytes},
                MaxLabels=50,
                MinConfidence=70
            )
            return self._process_object_response(response)
        except (ClientError, BotoCoreError) as e:
            logger.error(f"Rekognition object detection error: {e}")
            return self._mock_object_detection()

    def _process_ppe_response(self, response):
        """Process AWS Rekognition PPE response"""
        results = {
            'persons': [],
            'summary': {
                'total_persons': 0,
                'persons_with_face_cover': 0,
                'persons_with_hand_cover': 0,
                'persons_with_head_cover': 0,
            }
        }

        persons = response.get('Persons', [])
        results['summary']['total_persons'] = len(persons)

        for person in persons:
            person_data = {
                'confidence': person.get('Confidence', 0),
                'bounding_box': person.get('BoundingBox', {}),
                'body_parts': []
            }

            body_parts = person.get('BodyParts', [])
            for body_part in body_parts:
                part_data = {
                    'name': body_part.get('Name'),
                    'confidence': body_part.get('Confidence', 0),
                    'bounding_box': body_part.get('BoundingBox', {}),
                    'equipment': []
                }

                equipment = body_part.get('EquipmentDetections', [])
                for equip in equipment:
                    equip_data = {
                        'type': equip.get('Type'),
                        'confidence': equip.get('Confidence', 0),
                        'covers_body_part': equip.get('CoversBodyPart', {}).get('Value', False),
                        'bounding_box': equip.get('BoundingBox', {})
                    }
                    part_data['equipment'].append(equip_data)

                    # Update summary counts
                    if equip_data['covers_body_part']:
                        if equip_data['type'] == 'FACE_COVER':
                            results['summary']['persons_with_face_cover'] += 1
                        elif equip_data['type'] == 'HAND_COVER':
                            results['summary']['persons_with_hand_cover'] += 1
                        elif equip_data['type'] == 'HEAD_COVER':
                            results['summary']['persons_with_head_cover'] += 1

                person_data['body_parts'].append(part_data)
            results['persons'].append(person_data)

        return results

    def _process_object_response(self, response):
        """Process AWS Rekognition object detection response"""
        labels = response.get('Labels', [])
        
        safety_objects = []
        cleanliness_objects = []
        
        safety_keywords = ['fire', 'exit', 'sign', 'door', 'emergency', 'extinguisher', 'blocked', 'obstruction']
        cleanliness_keywords = ['trash', 'garbage', 'spill', 'dirt', 'mess', 'clean', 'floor', 'surface']
        
        for label in labels:
            label_name = label.get('Name', '').lower()
            confidence = label.get('Confidence', 0)
            
            instances = []
            for instance in label.get('Instances', []):
                instances.append({
                    'confidence': instance.get('Confidence', 0),
                    'bounding_box': instance.get('BoundingBox', {})
                })
            
            label_data = {
                'name': label.get('Name'),
                'confidence': confidence,
                'instances': instances
            }
            
            if any(keyword in label_name for keyword in safety_keywords):
                safety_objects.append(label_data)
            elif any(keyword in label_name for keyword in cleanliness_keywords):
                cleanliness_objects.append(label_data)
        
        return {
            'safety_objects': safety_objects,
            'cleanliness_objects': cleanliness_objects,
            'all_labels': labels
        }

    def _mock_ppe_detection(self):
        """Mock PPE detection for development/testing"""
        return {
            'persons': [
                {
                    'confidence': 95.5,
                    'bounding_box': {'Width': 0.3, 'Height': 0.8, 'Left': 0.2, 'Top': 0.1},
                    'body_parts': [
                        {
                            'name': 'FACE',
                            'confidence': 98.2,
                            'bounding_box': {'Width': 0.1, 'Height': 0.15, 'Left': 0.25, 'Top': 0.15},
                            'equipment': [
                                {
                                    'type': 'FACE_COVER',
                                    'confidence': 85.0,
                                    'covers_body_part': True,
                                    'bounding_box': {'Width': 0.08, 'Height': 0.1, 'Left': 0.26, 'Top': 0.18}
                                }
                            ]
                        }
                    ]
                }
            ],
            'summary': {
                'total_persons': 1,
                'persons_with_face_cover': 1,
                'persons_with_hand_cover': 0,
                'persons_with_head_cover': 0,
            }
        }

    def _mock_object_detection(self):
        """Mock object detection for development/testing"""
        return {
            'safety_objects': [
                {
                    'name': 'Fire Extinguisher',
                    'confidence': 92.3,
                    'instances': [
                        {
                            'confidence': 92.3,
                            'bounding_box': {'Width': 0.1, 'Height': 0.3, 'Left': 0.05, 'Top': 0.4}
                        }
                    ]
                }
            ],
            'cleanliness_objects': [
                {
                    'name': 'Floor',
                    'confidence': 95.8,
                    'instances': [
                        {
                            'confidence': 95.8,
                            'bounding_box': {'Width': 1.0, 'Height': 0.3, 'Left': 0.0, 'Top': 0.7}
                        }
                    ]
                }
            ],
            'all_labels': []
        }
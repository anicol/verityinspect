import boto3
from django.conf import settings
from botocore.exceptions import ClientError, BotoCoreError
import logging

logger = logging.getLogger(__name__)


class RekognitionService:
    def __init__(self):
        self.client = None

        if not settings.ENABLE_AWS_REKOGNITION:
            logger.info("AWS Rekognition is disabled in settings")
            return

        if not settings.AWS_ACCESS_KEY_ID:
            logger.warning("AWS credentials not configured - Rekognition will not be available")
            return

        try:
            self.client = boto3.client(
                'rekognition',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_S3_REGION_NAME
            )
            logger.info("Rekognition client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Rekognition client: {e}")
            raise

    def detect_ppe(self, image_bytes):
        """Detect Personal Protective Equipment in image

        Args:
            image_bytes: Image data as bytes

        Returns:
            dict: PPE detection results with persons and summary

        Raises:
            RuntimeError: If Rekognition is not enabled or credentials missing
            ClientError: If AWS API returns an error
            BotoCoreError: If boto3 encounters an error
        """
        if not self.client:
            raise RuntimeError(
                "AWS Rekognition is not enabled or credentials are missing. "
                "Set ENABLE_AWS_REKOGNITION=True and configure AWS credentials."
            )

        try:
            min_confidence = getattr(settings, 'REKOGNITION_PPE_MIN_CONFIDENCE', 80)
            response = self.client.detect_protective_equipment(
                Image={'Bytes': image_bytes},
                SummarizationAttributes={
                    'MinConfidence': min_confidence,
                    'RequiredEquipmentTypes': ['FACE_COVER', 'HAND_COVER', 'HEAD_COVER']
                }
            )
            return self._process_ppe_response(response)
        except (ClientError, BotoCoreError) as e:
            logger.error(f"Rekognition PPE detection error: {e}")
            raise

    def detect_objects(self, image_bytes):
        """Detect general objects in image

        Args:
            image_bytes: Image data as bytes

        Returns:
            dict: Object detection results categorized by type

        Raises:
            RuntimeError: If Rekognition is not enabled or credentials missing
            ClientError: If AWS API returns an error
            BotoCoreError: If boto3 encounters an error
        """
        if not self.client:
            raise RuntimeError(
                "AWS Rekognition is not enabled or credentials are missing. "
                "Set ENABLE_AWS_REKOGNITION=True and configure AWS credentials."
            )

        try:
            max_labels = getattr(settings, 'REKOGNITION_MAX_LABELS', 50)
            min_confidence = getattr(settings, 'REKOGNITION_OBJECTS_MIN_CONFIDENCE', 70)
            response = self.client.detect_labels(
                Image={'Bytes': image_bytes},
                MaxLabels=max_labels,
                MinConfidence=min_confidence
            )
            return self._process_object_response(response)
        except (ClientError, BotoCoreError) as e:
            logger.error(f"Rekognition object detection error: {e}")
            raise

    def _process_ppe_response(self, response):
        """Process AWS Rekognition PPE response

        Fixed bug: Now correctly counts unique persons with equipment,
        not duplicate counts per body part.
        """
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

            # Track which equipment types this person has (avoid duplicate counting)
            person_equipment_types = set()

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

                    # Track equipment at person level (FIX: only count once per person)
                    if equip_data['covers_body_part']:
                        person_equipment_types.add(equip_data['type'])

                person_data['body_parts'].append(part_data)

            # Update summary counts based on unique equipment types per person
            if 'FACE_COVER' in person_equipment_types:
                results['summary']['persons_with_face_cover'] += 1
            if 'HAND_COVER' in person_equipment_types:
                results['summary']['persons_with_hand_cover'] += 1
            if 'HEAD_COVER' in person_equipment_types:
                results['summary']['persons_with_head_cover'] += 1

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

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

    def detect_text(self, image_bytes):
        """Detect text in image using AWS Rekognition Text Detection

        Args:
            image_bytes: Image data as bytes

        Returns:
            dict: Text detection results with detected text and locations

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
            response = self.client.detect_text(Image={'Bytes': image_bytes})
            return self._process_text_response(response)
        except (ClientError, BotoCoreError) as e:
            logger.error(f"Rekognition text detection error: {e}")
            raise

    def detect_people(self, image_bytes):
        """Detect and count people in image for occupancy monitoring

        Args:
            image_bytes: Image data as bytes

        Returns:
            dict: People detection results with count and locations

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
            # Use detect_labels to find people
            response = self.client.detect_labels(
                Image={'Bytes': image_bytes},
                MaxLabels=50,
                MinConfidence=70
            )
            return self._process_people_response(response)
        except (ClientError, BotoCoreError) as e:
            logger.error(f"Rekognition people detection error: {e}")
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
        food_safety_objects = []
        equipment_objects = []
        operational_objects = []
        food_quality_objects = []
        staff_behavior_objects = []

        # Expanded keyword lists for comprehensive detection
        safety_keywords = ['fire', 'exit', 'sign', 'door', 'emergency', 'extinguisher', 'blocked', 'obstruction']
        cleanliness_keywords = ['trash', 'garbage', 'spill', 'dirt', 'mess', 'clean', 'floor', 'surface']
        food_safety_keywords = ['thermometer', 'temperature', 'glove', 'cutting board', 'container', 'cover',
                                'raw', 'cooked', 'handwash', 'sink', 'soap', 'sanitizer']
        equipment_keywords = ['rust', 'damage', 'wear', 'grease', 'leak', 'water', 'moisture', 'drip',
                             'hood', 'filter', 'equipment', 'broken', 'crack']
        operational_keywords = ['crowd', 'queue', 'line', 'sign', 'label', 'warning', 'notice', 'poster']
        food_quality_keywords = ['plate', 'food', 'garnish', 'steam', 'presentation', 'plating']
        staff_behavior_keywords = ['jewelry', 'watch', 'ring', 'bracelet', 'phone', 'mobile', 'cell',
                                  'eating', 'drinking', 'beverage', 'cup', 'bottle']

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

            # Categorize into multiple categories (object can belong to multiple)
            if any(keyword in label_name for keyword in safety_keywords):
                safety_objects.append(label_data)
            if any(keyword in label_name for keyword in cleanliness_keywords):
                cleanliness_objects.append(label_data)
            if any(keyword in label_name for keyword in food_safety_keywords):
                food_safety_objects.append(label_data)
            if any(keyword in label_name for keyword in equipment_keywords):
                equipment_objects.append(label_data)
            if any(keyword in label_name for keyword in operational_keywords):
                operational_objects.append(label_data)
            if any(keyword in label_name for keyword in food_quality_keywords):
                food_quality_objects.append(label_data)
            if any(keyword in label_name for keyword in staff_behavior_keywords):
                staff_behavior_objects.append(label_data)

        return {
            'safety_objects': safety_objects,
            'cleanliness_objects': cleanliness_objects,
            'food_safety_objects': food_safety_objects,
            'equipment_objects': equipment_objects,
            'operational_objects': operational_objects,
            'food_quality_objects': food_quality_objects,
            'staff_behavior_objects': staff_behavior_objects,
            'all_labels': labels
        }

    def _process_text_response(self, response):
        """Process AWS Rekognition text detection response"""
        text_detections = response.get('TextDetections', [])

        lines = []
        words = []

        for detection in text_detections:
            detection_type = detection.get('Type')
            text = detection.get('DetectedText', '')
            confidence = detection.get('Confidence', 0)

            text_data = {
                'text': text,
                'confidence': confidence,
                'type': detection_type,
                'bounding_box': detection.get('Geometry', {}).get('BoundingBox', {}),
                'id': detection.get('Id')
            }

            if detection_type == 'LINE':
                lines.append(text_data)
            elif detection_type == 'WORD':
                words.append(text_data)

        return {
            'lines': lines,
            'words': words,
            'all_text': ' '.join([line['text'] for line in lines]),
            'total_detections': len(text_detections)
        }

    def _process_people_response(self, response):
        """Process people detection from label detection response"""
        labels = response.get('Labels', [])

        people_count = 0
        people_instances = []

        for label in labels:
            label_name = label.get('Name', '').lower()

            if label_name == 'person' or label_name == 'people' or label_name == 'human':
                instances = label.get('Instances', [])
                people_count = len(instances)

                for instance in instances:
                    people_instances.append({
                        'confidence': instance.get('Confidence', 0),
                        'bounding_box': instance.get('BoundingBox', {})
                    })
                break

        return {
            'people_count': people_count,
            'people_instances': people_instances,
            'detected': people_count > 0
        }

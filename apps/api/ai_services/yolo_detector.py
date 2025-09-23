from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class YOLODetector:
    def __init__(self):
        self.model = None
        if settings.ENABLE_YOLO_DETECTION:
            try:
                # Import ultralytics only if YOLO is enabled
                from ultralytics import YOLO
                self.model = YOLO('yolov8n.pt')  # Use nano model for speed
                logger.info("YOLO model loaded successfully")
            except ImportError:
                logger.warning("Ultralytics not available, using mock detection")
            except Exception as e:
                logger.error(f"Failed to load YOLO model: {e}")

    def detect_objects(self, image_path):
        """Detect objects using YOLOv8"""
        if not self.model:
            return self._mock_detection()

        try:
            results = self.model(image_path)
            return self._process_yolo_results(results)
        except Exception as e:
            logger.error(f"YOLO detection error: {e}")
            return self._mock_detection()

    def detect_uniform_compliance(self, image_path):
        """Detect uniform-related objects"""
        if not self.model:
            return self._mock_uniform_detection()

        try:
            results = self.model(image_path)
            return self._process_uniform_results(results)
        except Exception as e:
            logger.error(f"YOLO uniform detection error: {e}")
            return self._mock_uniform_detection()

    def _process_yolo_results(self, results):
        """Process YOLO detection results"""
        detections = []
        
        for result in results:
            boxes = result.boxes
            if boxes is not None:
                for box in boxes:
                    detection = {
                        'class': self.model.names[int(box.cls)],
                        'confidence': float(box.conf),
                        'bounding_box': {
                            'x1': float(box.xyxy[0][0]),
                            'y1': float(box.xyxy[0][1]),
                            'x2': float(box.xyxy[0][2]),
                            'y2': float(box.xyxy[0][3])
                        }
                    }
                    detections.append(detection)
        
        return self._categorize_detections(detections)

    def _process_uniform_results(self, results):
        """Process YOLO results specifically for uniform compliance"""
        uniform_objects = []
        
        for result in results:
            boxes = result.boxes
            if boxes is not None:
                for box in boxes:
                    class_name = self.model.names[int(box.cls)]
                    if self._is_uniform_related(class_name):
                        detection = {
                            'class': class_name,
                            'confidence': float(box.conf),
                            'bounding_box': {
                                'x1': float(box.xyxy[0][0]),
                                'y1': float(box.xyxy[0][1]),
                                'x2': float(box.xyxy[0][2]),
                                'y2': float(box.xyxy[0][3])
                            },
                            'compliance_status': self._check_uniform_compliance(class_name)
                        }
                        uniform_objects.append(detection)
        
        return {
            'uniform_objects': uniform_objects,
            'compliance_score': self._calculate_uniform_score(uniform_objects)
        }

    def _categorize_detections(self, detections):
        """Categorize detections into safety, cleanliness, etc."""
        safety_objects = []
        cleanliness_objects = []
        other_objects = []
        
        safety_classes = ['fire extinguisher', 'exit sign', 'door', 'stairs']
        cleanliness_classes = ['trash can', 'spill', 'dirt', 'bucket', 'mop']
        
        for detection in detections:
            class_name = detection['class'].lower()
            if any(sc in class_name for sc in safety_classes):
                safety_objects.append(detection)
            elif any(cc in class_name for cc in cleanliness_classes):
                cleanliness_objects.append(detection)
            else:
                other_objects.append(detection)
        
        return {
            'safety_objects': safety_objects,
            'cleanliness_objects': cleanliness_objects,
            'other_objects': other_objects,
            'total_detections': len(detections)
        }

    def _is_uniform_related(self, class_name):
        """Check if detected object is uniform-related"""
        uniform_classes = ['person', 'shirt', 'hat', 'apron', 'shoes', 'pants']
        return any(uc in class_name.lower() for uc in uniform_classes)

    def _check_uniform_compliance(self, class_name):
        """Mock uniform compliance check"""
        # This would contain actual business logic for uniform compliance
        compliance_map = {
            'person': 'needs_review',
            'shirt': 'compliant',
            'hat': 'compliant',
            'apron': 'compliant',
            'shoes': 'non_compliant'
        }
        return compliance_map.get(class_name.lower(), 'unknown')

    def _calculate_uniform_score(self, uniform_objects):
        """Calculate overall uniform compliance score"""
        if not uniform_objects:
            return 100.0
        
        compliant_count = sum(1 for obj in uniform_objects if obj.get('compliance_status') == 'compliant')
        total_count = len(uniform_objects)
        
        return (compliant_count / total_count) * 100.0

    def _mock_detection(self):
        """Mock object detection for development"""
        return {
            'safety_objects': [
                {
                    'class': 'fire_extinguisher',
                    'confidence': 0.92,
                    'bounding_box': {'x1': 50, 'y1': 100, 'x2': 120, 'y2': 300}
                }
            ],
            'cleanliness_objects': [
                {
                    'class': 'trash_can',
                    'confidence': 0.88,
                    'bounding_box': {'x1': 200, 'y1': 150, 'x2': 250, 'y2': 400}
                }
            ],
            'other_objects': [
                {
                    'class': 'person',
                    'confidence': 0.95,
                    'bounding_box': {'x1': 300, 'y1': 50, 'x2': 450, 'y2': 500}
                }
            ],
            'total_detections': 3
        }

    def _mock_uniform_detection(self):
        """Mock uniform detection for development"""
        return {
            'uniform_objects': [
                {
                    'class': 'person',
                    'confidence': 0.95,
                    'bounding_box': {'x1': 300, 'y1': 50, 'x2': 450, 'y2': 500},
                    'compliance_status': 'needs_review'
                },
                {
                    'class': 'hat',
                    'confidence': 0.87,
                    'bounding_box': {'x1': 350, 'y1': 60, 'x2': 400, 'y2': 120},
                    'compliance_status': 'compliant'
                }
            ],
            'compliance_score': 75.0
        }
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class OCRService:
    def __init__(self):
        self.reader = None
        if settings.ENABLE_OCR_DETECTION:
            try:
                import easyocr
                self.reader = easyocr.Reader(['en'])
                logger.info("EasyOCR reader initialized successfully")
            except ImportError:
                logger.warning("EasyOCR not available, using mock OCR")
            except Exception as e:
                logger.error(f"Failed to initialize OCR reader: {e}")

    def extract_text(self, image_path):
        """Extract text from image"""
        if not self.reader:
            return self._mock_text_extraction()

        try:
            results = self.reader.readtext(image_path)
            return self._process_ocr_results(results)
        except Exception as e:
            logger.error(f"OCR extraction error: {e}")
            return self._mock_text_extraction()

    def analyze_menu_board(self, image_path):
        """Analyze menu board compliance"""
        text_results = self.extract_text(image_path)
        return self._analyze_menu_compliance(text_results)

    def _process_ocr_results(self, results):
        """Process EasyOCR results"""
        text_detections = []
        
        for detection in results:
            bbox, text, confidence = detection
            
            # Convert bbox format
            x_coords = [point[0] for point in bbox]
            y_coords = [point[1] for point in bbox]
            
            text_detection = {
                'text': text,
                'confidence': confidence,
                'bounding_box': {
                    'x1': min(x_coords),
                    'y1': min(y_coords),
                    'x2': max(x_coords),
                    'y2': max(y_coords)
                }
            }
            text_detections.append(text_detection)
        
        return {
            'text_detections': text_detections,
            'total_text_blocks': len(text_detections),
            'all_text': ' '.join([det['text'] for det in text_detections])
        }

    def _analyze_menu_compliance(self, text_results):
        """Analyze menu board for compliance issues"""
        all_text = text_results.get('all_text', '').lower()
        text_detections = text_results.get('text_detections', [])
        
        compliance_issues = []
        compliance_score = 100.0
        
        # Check for required information
        required_elements = {
            'prices': ['$', 'price', 'cost'],
            'nutritional_info': ['calories', 'cal', 'nutrition'],
            'allergen_info': ['allergen', 'contains', 'may contain']
        }
        
        for element, keywords in required_elements.items():
            found = any(keyword in all_text for keyword in keywords)
            if not found:
                compliance_issues.append({
                    'type': 'missing_required_info',
                    'element': element,
                    'description': f'Missing {element.replace("_", " ")} information',
                    'severity': 'medium'
                })
                compliance_score -= 20
        
        # Check for readability issues
        readability_issues = self._check_readability(text_detections)
        compliance_issues.extend(readability_issues)
        compliance_score -= len(readability_issues) * 10
        
        # Check for completeness
        if len(text_detections) < 5:
            compliance_issues.append({
                'type': 'insufficient_content',
                'description': 'Menu board appears to have insufficient content',
                'severity': 'low'
            })
            compliance_score -= 10
        
        return {
            'compliance_score': max(0, compliance_score),
            'compliance_issues': compliance_issues,
            'detected_text': text_results,
            'analysis_summary': {
                'total_issues': len(compliance_issues),
                'critical_issues': len([i for i in compliance_issues if i.get('severity') == 'high']),
                'readable_text_blocks': len(text_detections)
            }
        }

    def _check_readability(self, text_detections):
        """Check for text readability issues"""
        issues = []
        
        for detection in text_detections:
            confidence = detection.get('confidence', 0)
            text = detection.get('text', '')
            
            # Low confidence text
            if confidence < 0.7:
                issues.append({
                    'type': 'low_confidence_text',
                    'text': text,
                    'confidence': confidence,
                    'description': f'Text "{text}" has low OCR confidence',
                    'severity': 'medium'
                })
            
            # Very short text (might be incomplete)
            if len(text.strip()) < 3 and text.strip().isalpha():
                issues.append({
                    'type': 'incomplete_text',
                    'text': text,
                    'description': f'Text "{text}" appears incomplete',
                    'severity': 'low'
                })
        
        return issues

    def _mock_text_extraction(self):
        """Mock text extraction for development"""
        return {
            'text_detections': [
                {
                    'text': 'MENU BOARD',
                    'confidence': 0.95,
                    'bounding_box': {'x1': 100, 'y1': 50, 'x2': 300, 'y2': 100}
                },
                {
                    'text': 'Burger - $12.99',
                    'confidence': 0.92,
                    'bounding_box': {'x1': 50, 'y1': 150, 'x2': 250, 'y2': 180}
                },
                {
                    'text': 'Contains: Gluten, Dairy',
                    'confidence': 0.88,
                    'bounding_box': {'x1': 50, 'y1': 200, 'x2': 300, 'y2': 230}
                },
                {
                    'text': '520 Calories',
                    'confidence': 0.85,
                    'bounding_box': {'x1': 50, 'y1': 250, 'x2': 180, 'y2': 280}
                }
            ],
            'total_text_blocks': 4,
            'all_text': 'MENU BOARD Burger - $12.99 Contains: Gluten, Dairy 520 Calories'
        }
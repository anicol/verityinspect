from .rekognition import RekognitionService
from .yolo_detector import YOLODetector
from .ocr_service import OCRService
import logging

logger = logging.getLogger(__name__)


class VideoAnalyzer:
    def __init__(self):
        self.rekognition = RekognitionService()
        self.yolo = YOLODetector()
        self.ocr = OCRService()

    def analyze_frame(self, frame_path, frame_image_bytes=None):
        """Analyze a single video frame for all compliance criteria"""
        results = {
            'ppe_analysis': {},
            'safety_analysis': {},
            'cleanliness_analysis': {},
            'uniform_analysis': {},
            'menu_board_analysis': {},
            'overall_score': 0.0
        }

        try:
            # PPE Detection using AWS Rekognition
            if frame_image_bytes:
                ppe_results = self.rekognition.detect_ppe(frame_image_bytes)
                results['ppe_analysis'] = ppe_results
                logger.info(f"PPE analysis completed for frame")

            # Object Detection using AWS Rekognition
            if frame_image_bytes:
                object_results = self.rekognition.detect_objects(frame_image_bytes)
                results['safety_analysis'] = object_results.get('safety_objects', [])
                results['cleanliness_analysis'] = object_results.get('cleanliness_objects', [])

            # Enhanced object detection using YOLO
            yolo_results = self.yolo.detect_objects(frame_path)
            self._merge_object_detections(results, yolo_results)

            # Uniform compliance using YOLO
            uniform_results = self.yolo.detect_uniform_compliance(frame_path)
            results['uniform_analysis'] = uniform_results

            # Menu board analysis using OCR
            menu_results = self.ocr.analyze_menu_board(frame_path)
            results['menu_board_analysis'] = menu_results

            # Calculate overall score
            results['overall_score'] = self._calculate_overall_score(results)

        except Exception as e:
            logger.error(f"Error analyzing frame {frame_path}: {e}")
            results['error'] = str(e)

        return results

    def _merge_object_detections(self, results, yolo_results):
        """Merge YOLO results with existing object detections"""
        # Add YOLO safety objects
        if 'safety_analysis' not in results:
            results['safety_analysis'] = []
        
        yolo_safety = yolo_results.get('safety_objects', [])
        for obj in yolo_safety:
            obj['source'] = 'yolo'
        results['safety_analysis'].extend(yolo_safety)

        # Add YOLO cleanliness objects
        if 'cleanliness_analysis' not in results:
            results['cleanliness_analysis'] = []
        
        yolo_cleanliness = yolo_results.get('cleanliness_objects', [])
        for obj in yolo_cleanliness:
            obj['source'] = 'yolo'
        results['cleanliness_analysis'].extend(yolo_cleanliness)

    def _calculate_overall_score(self, results):
        """Calculate overall compliance score based on all analyses"""
        scores = []
        weights = {
            'ppe': 0.25,
            'safety': 0.20,
            'cleanliness': 0.20,
            'uniform': 0.20,
            'menu_board': 0.15
        }

        # PPE Score
        ppe_score = self._calculate_ppe_score(results.get('ppe_analysis', {}))
        scores.append(ppe_score * weights['ppe'])

        # Safety Score
        safety_score = self._calculate_safety_score(results.get('safety_analysis', []))
        scores.append(safety_score * weights['safety'])

        # Cleanliness Score
        cleanliness_score = self._calculate_cleanliness_score(results.get('cleanliness_analysis', []))
        scores.append(cleanliness_score * weights['cleanliness'])

        # Uniform Score
        uniform_analysis = results.get('uniform_analysis', {})
        uniform_score = uniform_analysis.get('compliance_score', 100.0)
        scores.append(uniform_score * weights['uniform'])

        # Menu Board Score
        menu_analysis = results.get('menu_board_analysis', {})
        menu_score = menu_analysis.get('compliance_score', 100.0)
        scores.append(menu_score * weights['menu_board'])

        return sum(scores)

    def _calculate_ppe_score(self, ppe_analysis):
        """Calculate PPE compliance score"""
        if not ppe_analysis or 'summary' not in ppe_analysis:
            return 100.0

        summary = ppe_analysis['summary']
        total_persons = summary.get('total_persons', 0)
        
        if total_persons == 0:
            return 100.0

        # Calculate compliance percentage
        face_cover_compliance = summary.get('persons_with_face_cover', 0) / total_persons
        hand_cover_compliance = summary.get('persons_with_hand_cover', 0) / total_persons
        
        # Weight face covers more heavily
        ppe_score = (face_cover_compliance * 0.7 + hand_cover_compliance * 0.3) * 100
        return min(100.0, ppe_score)

    def _calculate_safety_score(self, safety_objects):
        """Calculate safety compliance score"""
        base_score = 100.0
        
        # Look for safety violations
        blocked_exits = self._count_objects_by_name(safety_objects, ['blocked', 'obstruction'])
        missing_equipment = self._check_required_safety_equipment(safety_objects)
        
        # Deduct points for violations
        base_score -= blocked_exits * 30  # Major violation
        base_score -= missing_equipment * 10  # Minor violation
        
        return max(0.0, base_score)

    def _calculate_cleanliness_score(self, cleanliness_objects):
        """Calculate cleanliness compliance score"""
        base_score = 100.0
        
        # Look for cleanliness issues
        spills = self._count_objects_by_name(cleanliness_objects, ['spill', 'mess'])
        overflowing_trash = self._count_objects_by_name(cleanliness_objects, ['trash', 'overflow'])
        
        # Deduct points for issues
        base_score -= spills * 20
        base_score -= overflowing_trash * 15
        
        return max(0.0, base_score)

    def _count_objects_by_name(self, objects, keywords):
        """Count objects that match given keywords"""
        count = 0
        for obj in objects:
            obj_name = obj.get('name', '').lower() if 'name' in obj else obj.get('class', '').lower()
            if any(keyword in obj_name for keyword in keywords):
                count += 1
        return count

    def _check_required_safety_equipment(self, safety_objects):
        """Check for required safety equipment"""
        required_equipment = ['fire extinguisher', 'exit sign']
        missing_count = 0
        
        for equipment in required_equipment:
            found = any(equipment in obj.get('name', '').lower() or 
                       equipment in obj.get('class', '').lower() 
                       for obj in safety_objects)
            if not found:
                missing_count += 1
        
        return missing_count

    def generate_findings(self, frame_analysis, frame_obj):
        """Generate compliance findings from analysis results"""
        findings = []
        
        # PPE Findings
        ppe_findings = self._generate_ppe_findings(frame_analysis.get('ppe_analysis', {}), frame_obj)
        findings.extend(ppe_findings)
        
        # Safety Findings
        safety_findings = self._generate_safety_findings(frame_analysis.get('safety_analysis', []), frame_obj)
        findings.extend(safety_findings)
        
        # Cleanliness Findings
        cleanliness_findings = self._generate_cleanliness_findings(frame_analysis.get('cleanliness_analysis', []), frame_obj)
        findings.extend(cleanliness_findings)
        
        # Uniform Findings
        uniform_findings = self._generate_uniform_findings(frame_analysis.get('uniform_analysis', {}), frame_obj)
        findings.extend(uniform_findings)
        
        # Menu Board Findings
        menu_findings = self._generate_menu_findings(frame_analysis.get('menu_board_analysis', {}), frame_obj)
        findings.extend(menu_findings)
        
        return findings

    def _generate_ppe_findings(self, ppe_analysis, frame_obj):
        """Generate PPE-related findings"""
        findings = []
        
        if not ppe_analysis or 'summary' not in ppe_analysis:
            return findings
        
        summary = ppe_analysis['summary']
        total_persons = summary.get('total_persons', 0)
        
        if total_persons > 0:
            persons_without_face_cover = total_persons - summary.get('persons_with_face_cover', 0)
            if persons_without_face_cover > 0:
                findings.append({
                    'category': 'PPE',
                    'severity': 'HIGH',
                    'title': 'Missing Face Covers',
                    'description': f'{persons_without_face_cover} person(s) not wearing proper face covers',
                    'confidence': 0.9,
                    'frame': frame_obj,
                    'recommended_action': 'Ensure all staff wear appropriate face covers per company policy'
                })
        
        return findings

    def _generate_safety_findings(self, safety_objects, frame_obj):
        """Generate safety-related findings"""
        findings = []
        
        for obj in safety_objects:
            obj_name = obj.get('name', obj.get('class', '')).lower()
            confidence = obj.get('confidence', 0) / 100.0 if obj.get('confidence', 0) > 1 else obj.get('confidence', 0)
            
            if 'blocked' in obj_name or 'obstruction' in obj_name:
                findings.append({
                    'category': 'SAFETY',
                    'severity': 'CRITICAL',
                    'title': 'Blocked Exit/Pathway',
                    'description': f'Detected blocked exit or pathway: {obj_name}',
                    'confidence': confidence,
                    'frame': frame_obj,
                    'bounding_box': obj.get('bounding_box'),
                    'recommended_action': 'Immediately clear blocked exits and pathways'
                })
        
        return findings

    def _generate_cleanliness_findings(self, cleanliness_objects, frame_obj):
        """Generate cleanliness-related findings"""
        findings = []
        
        for obj in cleanliness_objects:
            obj_name = obj.get('name', obj.get('class', '')).lower()
            confidence = obj.get('confidence', 0) / 100.0 if obj.get('confidence', 0) > 1 else obj.get('confidence', 0)
            
            if 'spill' in obj_name or 'mess' in obj_name:
                findings.append({
                    'category': 'CLEANLINESS',
                    'severity': 'MEDIUM',
                    'title': 'Spill or Mess Detected',
                    'description': f'Potential spill or mess detected: {obj_name}',
                    'confidence': confidence,
                    'frame': frame_obj,
                    'bounding_box': obj.get('bounding_box'),
                    'recommended_action': 'Clean up spill immediately and check for slip hazards'
                })
        
        return findings

    def _generate_uniform_findings(self, uniform_analysis, frame_obj):
        """Generate uniform-related findings"""
        findings = []
        
        compliance_score = uniform_analysis.get('compliance_score', 100.0)
        if compliance_score < 80:
            findings.append({
                'category': 'UNIFORM',
                'severity': 'MEDIUM',
                'title': 'Uniform Compliance Issue',
                'description': f'Uniform compliance score: {compliance_score:.1f}%',
                'confidence': 0.8,
                'frame': frame_obj,
                'recommended_action': 'Review staff uniform compliance with company standards'
            })
        
        return findings

    def _generate_menu_findings(self, menu_analysis, frame_obj):
        """Generate menu board-related findings"""
        findings = []
        
        compliance_issues = menu_analysis.get('compliance_issues', [])
        for issue in compliance_issues:
            severity_map = {'high': 'HIGH', 'medium': 'MEDIUM', 'low': 'LOW'}
            findings.append({
                'category': 'MENU_BOARD',
                'severity': severity_map.get(issue.get('severity', 'low'), 'LOW'),
                'title': f"Menu Board: {issue.get('type', 'Issue').replace('_', ' ').title()}",
                'description': issue.get('description', 'Menu board compliance issue detected'),
                'confidence': 0.8,
                'frame': frame_obj,
                'recommended_action': 'Update menu board to meet compliance requirements'
            })
        
        return findings
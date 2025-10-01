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
            'safety_analysis': [],  # List, not dict - for extend() compatibility
            'cleanliness_analysis': [],  # List, not dict - for extend() compatibility
            'food_safety_analysis': [],
            'equipment_analysis': [],
            'operational_analysis': [],
            'food_quality_analysis': [],
            'staff_behavior_analysis': [],
            'text_analysis': {},
            'people_analysis': {},
            'uniform_analysis': {},
            'menu_board_analysis': {},
            'overall_score': 0.0,
            'rekognition_available': True,
            'warnings': []
        }

        try:
            # PPE Detection using AWS Rekognition
            if frame_image_bytes:
                try:
                    ppe_results = self.rekognition.detect_ppe(frame_image_bytes)
                    results['ppe_analysis'] = ppe_results
                    logger.info(f"PPE analysis completed for frame")
                except (RuntimeError, Exception) as e:
                    logger.warning(f"Rekognition PPE detection unavailable: {e}")
                    results['rekognition_available'] = False
                    results['warnings'].append(f"PPE detection unavailable: {str(e)}")

            # Object Detection using AWS Rekognition (expanded categories)
            if frame_image_bytes and results['rekognition_available']:
                try:
                    object_results = self.rekognition.detect_objects(frame_image_bytes)
                    results['safety_analysis'] = object_results.get('safety_objects', [])
                    results['cleanliness_analysis'] = object_results.get('cleanliness_objects', [])
                    results['food_safety_analysis'] = object_results.get('food_safety_objects', [])
                    results['equipment_analysis'] = object_results.get('equipment_objects', [])
                    results['operational_analysis'] = object_results.get('operational_objects', [])
                    results['food_quality_analysis'] = object_results.get('food_quality_objects', [])
                    results['staff_behavior_analysis'] = object_results.get('staff_behavior_objects', [])
                except (RuntimeError, Exception) as e:
                    logger.warning(f"Rekognition object detection unavailable: {e}")
                    results['rekognition_available'] = False
                    results['warnings'].append(f"Object detection unavailable: {str(e)}")

            # Text Detection using AWS Rekognition
            if frame_image_bytes and results['rekognition_available']:
                try:
                    text_results = self.rekognition.detect_text(frame_image_bytes)
                    results['text_analysis'] = text_results
                    logger.info(f"Text detection completed for frame")
                except (RuntimeError, Exception) as e:
                    logger.warning(f"Rekognition text detection unavailable: {e}")
                    results['warnings'].append(f"Text detection unavailable: {str(e)}")

            # People Detection using AWS Rekognition
            if frame_image_bytes and results['rekognition_available']:
                try:
                    people_results = self.rekognition.detect_people(frame_image_bytes)
                    results['people_analysis'] = people_results
                    logger.info(f"People detection completed for frame")
                except (RuntimeError, Exception) as e:
                    logger.warning(f"Rekognition people detection unavailable: {e}")
                    results['warnings'].append(f"People detection unavailable: {str(e)}")

            # Enhanced object detection using YOLO
            yolo_results = self.yolo.detect_objects(frame_path)
            self._merge_object_detections(results, yolo_results)

            # Uniform compliance using YOLO
            uniform_results = self.yolo.detect_uniform_compliance(frame_path)
            results['uniform_analysis'] = uniform_results

            # Menu board analysis using OCR
            menu_results = self.ocr.analyze_menu_board(frame_path)
            results['menu_board_analysis'] = menu_results

            # Calculate overall score (adjusted for available services)
            results['overall_score'] = self._calculate_overall_score(results)

        except Exception as e:
            logger.error(f"Critical error analyzing frame {frame_path}: {e}")
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
        """Calculate overall compliance score based on all analyses

        If Rekognition is unavailable, redistributes weights to other services.
        """
        rekognition_available = results.get('rekognition_available', True)

        # Expanded weights for all categories
        weights = {
            'ppe': 0.15,
            'safety': 0.15,
            'cleanliness': 0.10,
            'food_safety': 0.15,
            'equipment': 0.10,
            'operational': 0.05,
            'food_quality': 0.05,
            'staff_behavior': 0.10,
            'uniform': 0.10,
            'menu_board': 0.05
        }

        # Adjust weights if Rekognition is unavailable
        if not rekognition_available:
            # Redistribute Rekognition weights to other services
            weights = {
                'ppe': 0.0,
                'safety': 0.0,
                'cleanliness': 0.0,
                'food_safety': 0.0,
                'equipment': 0.0,
                'operational': 0.0,
                'food_quality': 0.0,
                'staff_behavior': 0.0,
                'uniform': 0.50,
                'menu_board': 0.50
            }

        scores = []

        # PPE Score (Rekognition only)
        if rekognition_available and weights['ppe'] > 0:
            ppe_score = self._calculate_ppe_score(results.get('ppe_analysis', {}))
            scores.append(ppe_score * weights['ppe'])

        # Safety Score (Rekognition + YOLO)
        if weights['safety'] > 0:
            safety_score = self._calculate_safety_score(results.get('safety_analysis', []))
            scores.append(safety_score * weights['safety'])

        # Cleanliness Score (Rekognition + YOLO)
        if weights['cleanliness'] > 0:
            cleanliness_score = self._calculate_cleanliness_score(results.get('cleanliness_analysis', []))
            scores.append(cleanliness_score * weights['cleanliness'])

        # Food Safety Score (Rekognition)
        if weights['food_safety'] > 0:
            food_safety_score = self._calculate_food_safety_score(results.get('food_safety_analysis', []))
            scores.append(food_safety_score * weights['food_safety'])

        # Equipment Score (Rekognition)
        if weights['equipment'] > 0:
            equipment_score = self._calculate_equipment_score(results.get('equipment_analysis', []))
            scores.append(equipment_score * weights['equipment'])

        # Operational Score (Rekognition)
        if weights['operational'] > 0:
            operational_score = self._calculate_operational_score(
                results.get('operational_analysis', []),
                results.get('people_analysis', {})
            )
            scores.append(operational_score * weights['operational'])

        # Food Quality Score (Rekognition)
        if weights['food_quality'] > 0:
            food_quality_score = self._calculate_food_quality_score(results.get('food_quality_analysis', []))
            scores.append(food_quality_score * weights['food_quality'])

        # Staff Behavior Score (Rekognition)
        if weights['staff_behavior'] > 0:
            staff_behavior_score = self._calculate_staff_behavior_score(results.get('staff_behavior_analysis', []))
            scores.append(staff_behavior_score * weights['staff_behavior'])

        # Uniform Score (YOLO)
        if weights['uniform'] > 0:
            uniform_analysis = results.get('uniform_analysis', {})
            uniform_score = uniform_analysis.get('compliance_score', 100.0)
            scores.append(uniform_score * weights['uniform'])

        # Menu Board Score (OCR)
        if weights['menu_board'] > 0:
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

    def _calculate_food_safety_score(self, food_safety_objects):
        """Calculate food safety compliance score"""
        base_score = 100.0

        # Look for food safety violations
        uncovered_containers = self._count_objects_by_name(food_safety_objects, ['container'])
        # Deduct points for uncovered food
        base_score -= uncovered_containers * 15

        return max(0.0, base_score)

    def _calculate_equipment_score(self, equipment_objects):
        """Calculate equipment condition score"""
        base_score = 100.0

        # Look for equipment issues
        damage = self._count_objects_by_name(equipment_objects, ['rust', 'damage', 'broken', 'crack'])
        grease = self._count_objects_by_name(equipment_objects, ['grease'])
        leaks = self._count_objects_by_name(equipment_objects, ['leak', 'drip', 'moisture'])

        # Deduct points for issues
        base_score -= damage * 25  # High severity
        base_score -= grease * 15  # Medium severity
        base_score -= leaks * 15   # Medium severity

        return max(0.0, base_score)

    def _calculate_operational_score(self, operational_objects, people_analysis):
        """Calculate operational compliance score"""
        base_score = 100.0
        from django.conf import settings

        # Check occupancy
        people_count = people_analysis.get('people_count', 0)
        max_capacity = getattr(settings, 'MAX_PEOPLE_IN_KITCHEN', 10)

        if people_count > max_capacity:
            # Deduct points based on how much over capacity
            over_capacity = people_count - max_capacity
            base_score -= over_capacity * 5

        # Check for queue/crowd issues
        queues = self._count_objects_by_name(operational_objects, ['queue', 'line', 'crowd'])
        base_score -= queues * 10

        return max(0.0, base_score)

    def _calculate_food_quality_score(self, food_quality_objects):
        """Calculate food quality score"""
        # For now, return perfect score unless we detect specific issues
        # This can be expanded with more sophisticated checks
        base_score = 100.0

        # Placeholder for future enhancements
        # Could check for portion sizes, plating consistency, etc.

        return base_score

    def _calculate_staff_behavior_score(self, staff_behavior_objects):
        """Calculate staff behavior compliance score"""
        base_score = 100.0

        # Look for policy violations
        jewelry = self._count_objects_by_name(staff_behavior_objects, ['jewelry', 'watch', 'ring', 'bracelet'])
        phones = self._count_objects_by_name(staff_behavior_objects, ['phone', 'mobile', 'cell'])
        food_beverage = self._count_objects_by_name(staff_behavior_objects, ['eating', 'drinking', 'beverage', 'cup'])

        # Deduct points for violations
        base_score -= jewelry * 15
        base_score -= phones * 15
        base_score -= food_beverage * 10

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

        # Food Safety Findings
        food_safety_findings = self._generate_food_safety_findings(frame_analysis.get('food_safety_analysis', []), frame_obj)
        findings.extend(food_safety_findings)

        # Equipment Findings
        equipment_findings = self._generate_equipment_findings(frame_analysis.get('equipment_analysis', []), frame_obj)
        findings.extend(equipment_findings)

        # Operational Findings
        operational_findings = self._generate_operational_findings(
            frame_analysis.get('operational_analysis', []),
            frame_analysis.get('people_analysis', {}),
            frame_obj
        )
        findings.extend(operational_findings)

        # Food Quality Findings
        food_quality_findings = self._generate_food_quality_findings(frame_analysis.get('food_quality_analysis', []), frame_obj)
        findings.extend(food_quality_findings)

        # Staff Behavior Findings
        staff_behavior_findings = self._generate_staff_behavior_findings(frame_analysis.get('staff_behavior_analysis', []), frame_obj)
        findings.extend(staff_behavior_findings)

        # Text-based Findings
        text_findings = self._generate_text_findings(frame_analysis.get('text_analysis', {}), frame_obj)
        findings.extend(text_findings)

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

    def _generate_food_safety_findings(self, food_safety_objects, frame_obj):
        """Generate food safety and hygiene-related findings"""
        findings = []

        for obj in food_safety_objects:
            obj_name = obj.get('name', obj.get('class', '')).lower()
            confidence = obj.get('confidence', 0) / 100.0 if obj.get('confidence', 0) > 1 else obj.get('confidence', 0)

            # Detect uncovered food or containers
            if 'container' in obj_name and 'cover' not in obj_name:
                findings.append({
                    'category': 'FOOD_SAFETY',
                    'severity': 'MEDIUM',
                    'title': 'Uncovered Food Container',
                    'description': f'Detected uncovered food container: {obj_name}',
                    'confidence': confidence,
                    'frame': frame_obj,
                    'bounding_box': obj.get('bounding_box'),
                    'recommended_action': 'Ensure all food containers are properly covered to prevent contamination'
                })

            # Missing temperature monitoring equipment
            if 'thermometer' in obj_name or 'temperature' in obj_name:
                # This is actually good - thermometer present
                pass

            # Detect potential cross-contamination with cutting boards
            if 'cutting board' in obj_name:
                findings.append({
                    'category': 'FOOD_SAFETY',
                    'severity': 'LOW',
                    'title': 'Cutting Board Detected',
                    'description': f'Review cutting board usage for proper color-coding: {obj_name}',
                    'confidence': confidence,
                    'frame': frame_obj,
                    'bounding_box': obj.get('bounding_box'),
                    'recommended_action': 'Verify cutting boards are color-coded and used properly (raw vs. cooked)'
                })

        return findings

    def _generate_equipment_findings(self, equipment_objects, frame_obj):
        """Generate equipment and maintenance-related findings"""
        findings = []

        for obj in equipment_objects:
            obj_name = obj.get('name', obj.get('class', '')).lower()
            confidence = obj.get('confidence', 0) / 100.0 if obj.get('confidence', 0) > 1 else obj.get('confidence', 0)

            # Detect rust or damage
            if 'rust' in obj_name or 'damage' in obj_name or 'broken' in obj_name or 'crack' in obj_name:
                findings.append({
                    'category': 'EQUIPMENT',
                    'severity': 'HIGH',
                    'title': 'Equipment Damage Detected',
                    'description': f'Damaged equipment detected: {obj_name}',
                    'confidence': confidence,
                    'frame': frame_obj,
                    'bounding_box': obj.get('bounding_box'),
                    'recommended_action': 'Inspect and repair or replace damaged equipment immediately'
                })

            # Detect grease buildup
            if 'grease' in obj_name:
                findings.append({
                    'category': 'EQUIPMENT',
                    'severity': 'MEDIUM',
                    'title': 'Grease Buildup Detected',
                    'description': f'Grease accumulation detected: {obj_name}',
                    'confidence': confidence,
                    'frame': frame_obj,
                    'bounding_box': obj.get('bounding_box'),
                    'recommended_action': 'Clean grease from hoods, filters, and surfaces to prevent fire hazards'
                })

            # Detect leaks or moisture issues
            if 'leak' in obj_name or 'drip' in obj_name or 'moisture' in obj_name:
                findings.append({
                    'category': 'EQUIPMENT',
                    'severity': 'MEDIUM',
                    'title': 'Leak or Moisture Detected',
                    'description': f'Water or moisture issue detected: {obj_name}',
                    'confidence': confidence,
                    'frame': frame_obj,
                    'bounding_box': obj.get('bounding_box'),
                    'recommended_action': 'Identify source of leak and repair to prevent slip hazards and equipment damage'
                })

        return findings

    def _generate_operational_findings(self, operational_objects, people_analysis, frame_obj):
        """Generate operational compliance-related findings"""
        findings = []
        from django.conf import settings

        # Check occupancy levels
        people_count = people_analysis.get('people_count', 0)
        max_kitchen_capacity = getattr(settings, 'MAX_PEOPLE_IN_KITCHEN', 10)

        if people_count > max_kitchen_capacity:
            findings.append({
                'category': 'OPERATIONAL',
                'severity': 'MEDIUM',
                'title': 'Overcrowding Detected',
                'description': f'{people_count} people detected in frame (max recommended: {max_kitchen_capacity})',
                'confidence': 0.85,
                'frame': frame_obj,
                'recommended_action': 'Manage staff scheduling to reduce overcrowding and improve workflow'
            })

        # Check for queue/line formation issues
        for obj in operational_objects:
            obj_name = obj.get('name', obj.get('class', '')).lower()
            confidence = obj.get('confidence', 0) / 100.0 if obj.get('confidence', 0) > 1 else obj.get('confidence', 0)

            if 'queue' in obj_name or 'line' in obj_name or 'crowd' in obj_name:
                findings.append({
                    'category': 'OPERATIONAL',
                    'severity': 'LOW',
                    'title': 'Customer Queue Detected',
                    'description': f'Review queue management: {obj_name}',
                    'confidence': confidence,
                    'frame': frame_obj,
                    'bounding_box': obj.get('bounding_box'),
                    'recommended_action': 'Monitor queue length and adjust staffing as needed'
                })

        return findings

    def _generate_food_quality_findings(self, food_quality_objects, frame_obj):
        """Generate food quality and presentation-related findings"""
        findings = []

        for obj in food_quality_objects:
            obj_name = obj.get('name', obj.get('class', '')).lower()
            confidence = obj.get('confidence', 0) / 100.0 if obj.get('confidence', 0) > 1 else obj.get('confidence', 0)

            # Detect plated food for presentation review
            if 'plate' in obj_name or 'plating' in obj_name:
                # This could be expanded with more sophisticated checks
                # For now, we'll flag for manual review if confidence is high
                if confidence > 0.85:
                    findings.append({
                        'category': 'FOOD_QUALITY',
                        'severity': 'LOW',
                        'title': 'Review Food Presentation',
                        'description': f'Plated food detected - verify presentation meets standards: {obj_name}',
                        'confidence': confidence,
                        'frame': frame_obj,
                        'bounding_box': obj.get('bounding_box'),
                        'recommended_action': 'Review plate presentation for consistency with brand standards'
                    })

        return findings

    def _generate_staff_behavior_findings(self, staff_behavior_objects, frame_obj):
        """Generate staff behavior-related findings"""
        findings = []

        for obj in staff_behavior_objects:
            obj_name = obj.get('name', obj.get('class', '')).lower()
            confidence = obj.get('confidence', 0) / 100.0 if obj.get('confidence', 0) > 1 else obj.get('confidence', 0)

            # Detect jewelry
            if 'jewelry' in obj_name or 'watch' in obj_name or 'ring' in obj_name or 'bracelet' in obj_name:
                findings.append({
                    'category': 'STAFF_BEHAVIOR',
                    'severity': 'MEDIUM',
                    'title': 'Jewelry Compliance Issue',
                    'description': f'Jewelry or accessories detected: {obj_name}',
                    'confidence': confidence,
                    'frame': frame_obj,
                    'bounding_box': obj.get('bounding_box'),
                    'recommended_action': 'Ensure staff remove jewelry and accessories per food safety policy'
                })

            # Detect phone usage
            if 'phone' in obj_name or 'mobile' in obj_name or 'cell' in obj_name:
                findings.append({
                    'category': 'STAFF_BEHAVIOR',
                    'severity': 'MEDIUM',
                    'title': 'Phone in Food Prep Area',
                    'description': f'Phone detected in work area: {obj_name}',
                    'confidence': confidence,
                    'frame': frame_obj,
                    'bounding_box': obj.get('bounding_box'),
                    'recommended_action': 'Remove phones from food preparation areas to maintain hygiene'
                })

            # Detect eating/drinking in restricted areas
            if 'eating' in obj_name or 'drinking' in obj_name or 'beverage' in obj_name or 'cup' in obj_name:
                findings.append({
                    'category': 'STAFF_BEHAVIOR',
                    'severity': 'LOW',
                    'title': 'Food/Beverage in Work Area',
                    'description': f'Employee food/beverage detected: {obj_name}',
                    'confidence': confidence,
                    'frame': frame_obj,
                    'bounding_box': obj.get('bounding_box'),
                    'recommended_action': 'Ensure employees only eat/drink in designated areas'
                })

        return findings

    def _generate_text_findings(self, text_analysis, frame_obj):
        """Generate text-based compliance findings"""
        findings = []

        all_text = text_analysis.get('all_text', '').lower()
        lines = text_analysis.get('lines', [])

        # Check for expiration date patterns
        import re
        exp_patterns = [r'exp.*\d{1,2}[/-]\d{1,2}[/-]\d{2,4}', r'use by.*\d{1,2}[/-]\d{1,2}',
                       r'best before.*\d{1,2}[/-]\d{1,2}']

        for pattern in exp_patterns:
            if re.search(pattern, all_text):
                findings.append({
                    'category': 'FOOD_SAFETY',
                    'severity': 'LOW',
                    'title': 'Expiration Date Detected',
                    'description': 'Verify expiration date is current and product is properly rotated',
                    'confidence': 0.75,
                    'frame': frame_obj,
                    'recommended_action': 'Check expiration dates and ensure FIFO rotation'
                })
                break

        # Check for temperature log text
        if 'temperature' in all_text or 'temp' in all_text:
            if re.search(r'\d{2,3}[°\s]*[fc]', all_text):
                findings.append({
                    'category': 'FOOD_SAFETY',
                    'severity': 'LOW',
                    'title': 'Temperature Log Detected',
                    'description': 'Temperature monitoring detected - verify logs are current and complete',
                    'confidence': 0.8,
                    'frame': frame_obj,
                    'recommended_action': 'Review temperature logs for completeness and compliance'
                })

        # Check for chemical/cleaning labels
        chemical_keywords = ['bleach', 'cleaner', 'sanitizer', 'chemical', 'caution', 'warning', 'poison']
        if any(keyword in all_text for keyword in chemical_keywords):
            findings.append({
                'category': 'SAFETY',
                'severity': 'LOW',
                'title': 'Chemical Label Detected',
                'description': 'Verify chemicals are properly labeled and stored away from food',
                'confidence': 0.75,
                'frame': frame_obj,
                'recommended_action': 'Ensure all chemicals are labeled and stored in designated areas'
            })

        # Check for allergen information
        allergen_keywords = ['allergen', 'contains', 'may contain', 'peanut', 'tree nut', 'dairy', 'soy', 'wheat']
        if any(keyword in all_text for keyword in allergen_keywords):
            findings.append({
                'category': 'FOOD_SAFETY',
                'severity': 'LOW',
                'title': 'Allergen Information Detected',
                'description': 'Allergen labeling found - verify accuracy and visibility',
                'confidence': 0.7,
                'frame': frame_obj,
                'recommended_action': 'Verify allergen information is accurate and clearly posted'
            })

        return findings
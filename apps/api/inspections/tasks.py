import os
import tempfile
from celery import shared_task
from django.utils import timezone
from django.conf import settings
from django.core.files.storage import default_storage
from .models import Inspection, Finding, ActionItem
from ai_services.analyzer import VideoAnalyzer
from ai_services.bedrock_service import BedrockRecommendationService
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True)
def analyze_video(self, inspection_id):
    """Analyze video for AI inspection"""
    try:
        inspection = Inspection.objects.get(id=inspection_id)
        inspection.status = Inspection.Status.PROCESSING
        inspection.save()

        video = inspection.video
        analyzer = VideoAnalyzer()
        
        # Get video frames
        frames = video.frames.all().order_by('timestamp')
        if not frames.exists():
            raise Exception("No frames found for video analysis")

        all_analyses = []
        all_findings = []
        
        # Analyze each frame
        for frame in frames:
            temp_frame_path = None
            try:
                # Download frame from S3 to temp file
                with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp_file:
                    # Read from S3
                    with default_storage.open(frame.image.name, 'rb') as s3_file:
                        frame_bytes = s3_file.read()
                        tmp_file.write(frame_bytes)
                        temp_frame_path = tmp_file.name

                # Analyze frame
                frame_analysis = analyzer.analyze_frame(temp_frame_path, frame_bytes)
                all_analyses.append(frame_analysis)

                # Generate findings for this frame
                findings = analyzer.generate_findings(frame_analysis, frame)
                all_findings.extend(findings)

                logger.info(f"Analyzed frame {frame.frame_number} with score {frame_analysis.get('overall_score', 0)}")

            except Exception as e:
                logger.error(f"Error analyzing frame {frame.frame_number}: {e}")
                continue
            finally:
                # Clean up temp file
                if temp_frame_path and os.path.exists(temp_frame_path):
                    os.remove(temp_frame_path)

        # Calculate overall scores
        scores = calculate_inspection_scores(all_analyses)
        
        # Update inspection with results
        inspection.overall_score = scores['overall_score']
        inspection.ppe_score = scores['ppe_score']
        inspection.safety_score = scores['safety_score']
        inspection.cleanliness_score = scores['cleanliness_score']
        inspection.food_safety_score = scores['food_safety_score']
        inspection.equipment_score = scores['equipment_score']
        inspection.operational_score = scores['operational_score']
        inspection.food_quality_score = scores['food_quality_score']
        inspection.staff_behavior_score = scores['staff_behavior_score']
        inspection.uniform_score = scores['uniform_score']
        inspection.menu_board_score = scores['menu_board_score']
        inspection.ai_analysis = {
            'frame_analyses': all_analyses,
            'analysis_summary': {
                'total_frames_analyzed': len(all_analyses),
                'analysis_timestamp': timezone.now().isoformat(),
                'analyzer_version': '1.0.0'
            }
        }
        inspection.status = Inspection.Status.COMPLETED
        inspection.save()

        # Update video status
        video.status = 'COMPLETED'
        video.save()

        # Create findings
        create_findings_from_analysis(inspection, all_findings)
        
        # Generate action items
        generate_action_items(inspection)

        logger.info(f"Inspection {inspection_id} completed with overall score {inspection.overall_score}")
        return f"Inspection {inspection_id} analyzed successfully"

    except Exception as exc:
        inspection = Inspection.objects.get(id=inspection_id)
        inspection.status = Inspection.Status.FAILED
        inspection.error_message = str(exc)
        inspection.save()

        # Update video status to failed
        video = inspection.video
        video.status = 'FAILED'
        video.save()

        logger.error(f"Inspection analysis failed: {exc}")
        raise self.retry(exc=exc, countdown=60, max_retries=3)


def calculate_inspection_scores(frame_analyses):
    """Calculate overall inspection scores from frame analyses"""
    if not frame_analyses:
        return {
            'overall_score': 0.0,
            'ppe_score': 0.0,
            'safety_score': 0.0,
            'cleanliness_score': 0.0,
            'food_safety_score': 0.0,
            'equipment_score': 0.0,
            'operational_score': 0.0,
            'food_quality_score': 0.0,
            'staff_behavior_score': 0.0,
            'uniform_score': 0.0,
            'menu_board_score': 0.0
        }

    # Calculate averages
    overall_scores = [analysis.get('overall_score', 0) for analysis in frame_analyses]

    # For category scores, we need to extract them from the analyzer results
    ppe_scores = []
    safety_scores = []
    cleanliness_scores = []
    food_safety_scores = []
    equipment_scores = []
    operational_scores = []
    food_quality_scores = []
    staff_behavior_scores = []
    uniform_scores = []
    menu_scores = []

    for analysis in frame_analyses:
        # PPE Score calculation
        ppe_analysis = analysis.get('ppe_analysis', {})
        if ppe_analysis and 'summary' in ppe_analysis:
            summary = ppe_analysis['summary']
            total_persons = summary.get('total_persons', 0)
            if total_persons > 0:
                face_compliance = summary.get('persons_with_face_cover', 0) / total_persons
                hand_compliance = summary.get('persons_with_hand_cover', 0) / total_persons
                ppe_score = (face_compliance * 0.7 + hand_compliance * 0.3) * 100
                ppe_scores.append(ppe_score)
            else:
                ppe_scores.append(100.0)
        else:
            ppe_scores.append(100.0)

        # Safety Score - basic calculation based on violations
        safety_objects = analysis.get('safety_analysis', [])
        safety_score = 100.0
        blocked_exits = sum(1 for obj in safety_objects
                          if 'blocked' in obj.get('name', '').lower() or
                             'blocked' in obj.get('class', '').lower())
        safety_score -= blocked_exits * 30
        safety_scores.append(max(0.0, safety_score))

        # Cleanliness Score
        cleanliness_objects = analysis.get('cleanliness_analysis', [])
        cleanliness_score = 100.0
        spills = sum(1 for obj in cleanliness_objects
                    if 'spill' in obj.get('name', '').lower() or
                       'spill' in obj.get('class', '').lower())
        cleanliness_score -= spills * 20
        cleanliness_scores.append(max(0.0, cleanliness_score))

        # Food Safety Score
        food_safety_objects = analysis.get('food_safety_analysis', [])
        food_safety_score = 100.0
        uncovered_containers = sum(1 for obj in food_safety_objects
                                   if 'container' in obj.get('name', '').lower())
        food_safety_score -= uncovered_containers * 15
        food_safety_scores.append(max(0.0, food_safety_score))

        # Equipment Score
        equipment_objects = analysis.get('equipment_analysis', [])
        equipment_score = 100.0
        damage = sum(1 for obj in equipment_objects
                    if any(keyword in obj.get('name', '').lower()
                          for keyword in ['rust', 'damage', 'broken', 'crack']))
        grease = sum(1 for obj in equipment_objects
                    if 'grease' in obj.get('name', '').lower())
        leaks = sum(1 for obj in equipment_objects
                   if any(keyword in obj.get('name', '').lower()
                         for keyword in ['leak', 'drip', 'moisture']))
        equipment_score -= damage * 25
        equipment_score -= grease * 15
        equipment_score -= leaks * 15
        equipment_scores.append(max(0.0, equipment_score))

        # Operational Score
        operational_objects = analysis.get('operational_analysis', [])
        people_analysis = analysis.get('people_analysis', {})
        operational_score = 100.0

        people_count = people_analysis.get('people_count', 0)
        max_capacity = getattr(settings, 'MAX_PEOPLE_IN_KITCHEN', 10)
        if people_count > max_capacity:
            over_capacity = people_count - max_capacity
            operational_score -= over_capacity * 5

        queues = sum(1 for obj in operational_objects
                    if any(keyword in obj.get('name', '').lower()
                          for keyword in ['queue', 'line', 'crowd']))
        operational_score -= queues * 10
        operational_scores.append(max(0.0, operational_score))

        # Food Quality Score
        food_quality_scores.append(100.0)  # Placeholder - can be enhanced later

        # Staff Behavior Score
        staff_behavior_objects = analysis.get('staff_behavior_analysis', [])
        staff_behavior_score = 100.0
        jewelry = sum(1 for obj in staff_behavior_objects
                     if any(keyword in obj.get('name', '').lower()
                           for keyword in ['jewelry', 'watch', 'ring', 'bracelet']))
        phones = sum(1 for obj in staff_behavior_objects
                    if any(keyword in obj.get('name', '').lower()
                          for keyword in ['phone', 'mobile', 'cell']))
        food_beverage = sum(1 for obj in staff_behavior_objects
                           if any(keyword in obj.get('name', '').lower()
                                 for keyword in ['eating', 'drinking', 'beverage', 'cup']))
        staff_behavior_score -= jewelry * 15
        staff_behavior_score -= phones * 15
        staff_behavior_score -= food_beverage * 10
        staff_behavior_scores.append(max(0.0, staff_behavior_score))

        # Uniform Score
        uniform_analysis = analysis.get('uniform_analysis', {})
        uniform_score = uniform_analysis.get('compliance_score', 100.0)
        uniform_scores.append(uniform_score)

        # Menu Board Score
        menu_analysis = analysis.get('menu_board_analysis', {})
        menu_score = menu_analysis.get('compliance_score', 100.0)
        menu_scores.append(menu_score)

    return {
        'overall_score': sum(overall_scores) / len(overall_scores),
        'ppe_score': sum(ppe_scores) / len(ppe_scores),
        'safety_score': sum(safety_scores) / len(safety_scores),
        'cleanliness_score': sum(cleanliness_scores) / len(cleanliness_scores),
        'food_safety_score': sum(food_safety_scores) / len(food_safety_scores),
        'equipment_score': sum(equipment_scores) / len(equipment_scores),
        'operational_score': sum(operational_scores) / len(operational_scores),
        'food_quality_score': sum(food_quality_scores) / len(food_quality_scores),
        'staff_behavior_score': sum(staff_behavior_scores) / len(staff_behavior_scores),
        'uniform_score': sum(uniform_scores) / len(uniform_scores),
        'menu_board_score': sum(menu_scores) / len(menu_scores)
    }


def create_findings_from_analysis(inspection, findings_data):
    """Create consolidated Finding objects from analysis results with AI-generated recommendations"""
    if not findings_data:
        return

    # Initialize Bedrock service for generating recommendations
    bedrock_service = BedrockRecommendationService()

    # Group findings by (category, severity, title) for consolidation
    grouped_findings = {}

    for finding_data in findings_data:
        category = finding_data.get('category', 'OTHER')
        severity = finding_data.get('severity', 'LOW')
        title = finding_data.get('title', 'Unknown Issue')

        # Create unique key for grouping
        key = (category, severity, title)

        if key not in grouped_findings:
            grouped_findings[key] = []

        grouped_findings[key].append(finding_data)

    # Create one consolidated finding per group
    for (category, severity, title), group_findings in grouped_findings.items():
        try:
            # Extract data from all findings in this group
            frames = [f.get('frame') for f in group_findings if f.get('frame')]
            confidences = [f.get('confidence', 0.0) for f in group_findings]
            timestamps = [f.get('frame').timestamp for f in group_findings if f.get('frame')]

            # Find the finding with highest confidence (representative)
            max_confidence_idx = confidences.index(max(confidences)) if confidences else 0
            representative_finding = group_findings[max_confidence_idx]
            representative_frame = representative_finding.get('frame')

            # Calculate consolidated metrics
            affected_frame_count = len(group_findings)
            average_confidence = sum(confidences) / len(confidences) if confidences else 0.0
            max_confidence = max(confidences) if confidences else 0.0
            first_timestamp = min(timestamps) if timestamps else None
            last_timestamp = max(timestamps) if timestamps else None

            # Get base description from representative finding
            description = representative_finding.get('description', '')
            bounding_box = representative_finding.get('bounding_box')

            # Generate AI-powered recommendation and time estimate
            is_consolidated = affected_frame_count > 1
            recommendation = bedrock_service.generate_recommendation(
                category=category,
                severity=severity,
                title=title,
                description=description,
                is_consolidated=is_consolidated,
                frame_count=affected_frame_count
            )

            recommended_action = recommendation['recommended_action']
            estimated_minutes = recommendation['estimated_minutes']

            # Create consolidated finding with AI-generated recommendations
            Finding.objects.create(
                inspection=inspection,
                frame=representative_frame,
                category=category,
                severity=severity,
                title=title,
                description=description,
                confidence=max_confidence,
                bounding_box=bounding_box,
                recommended_action=recommended_action,
                estimated_minutes=estimated_minutes,
                affected_frame_count=affected_frame_count,
                first_timestamp=first_timestamp,
                last_timestamp=last_timestamp,
                average_confidence=average_confidence
            )

            logger.info(
                f"Consolidated {affected_frame_count} findings for '{title}' "
                f"(confidence: avg={average_confidence:.2f}, max={max_confidence:.2f}, "
                f"estimated time: {estimated_minutes} minutes)"
            )

        except Exception as e:
            logger.error(f"Error creating consolidated finding for '{title}': {e}")


def generate_action_items(inspection):
    """Generate action items based on findings"""
    findings = inspection.findings.all()
    
    # Group findings by category and severity
    critical_findings = findings.filter(severity='CRITICAL')
    high_findings = findings.filter(severity='HIGH')
    
    # Create action items for critical findings
    for finding in critical_findings:
        ActionItem.objects.create(
            inspection=inspection,
            finding=finding,
            title=f"Address Critical Issue: {finding.title}",
            description=finding.recommended_action or finding.description,
            priority=ActionItem.Priority.URGENT,
            due_date=timezone.now() + timezone.timedelta(hours=4)  # 4 hours for critical
        )
    
    # Create action items for high priority findings
    for finding in high_findings:
        ActionItem.objects.create(
            inspection=inspection,
            finding=finding,
            title=f"Address High Priority Issue: {finding.title}",
            description=finding.recommended_action or finding.description,
            priority=ActionItem.Priority.HIGH,
            due_date=timezone.now() + timezone.timedelta(days=1)  # 1 day for high
        )
    
    # Create summary action items for categories with multiple medium findings
    medium_findings_by_category = {}
    for finding in findings.filter(severity='MEDIUM'):
        category = finding.category
        if category not in medium_findings_by_category:
            medium_findings_by_category[category] = []
        medium_findings_by_category[category].append(finding)
    
    for category, category_findings in medium_findings_by_category.items():
        if len(category_findings) >= 3:  # Create summary action for 3+ medium findings
            ActionItem.objects.create(
                inspection=inspection,
                title=f"Review {category} Compliance",
                description=f"Multiple {category.lower()} issues detected. Review and address all findings in this category.",
                priority=ActionItem.Priority.MEDIUM,
                due_date=timezone.now() + timezone.timedelta(days=3)  # 3 days for medium
            )


@shared_task
def cleanup_expired_inspections():
    """Clean up expired coaching mode inspections"""
    expired_inspections = Inspection.objects.filter(
        mode=Inspection.Mode.COACHING,
        expires_at__lt=timezone.now()
    )
    
    count = 0
    for inspection in expired_inspections:
        try:
            # Delete associated video frames and files if they exist
            video = inspection.video
            for frame in video.frames.all():
                if frame.image and os.path.exists(frame.image.path):
                    os.remove(frame.image.path)
            
            # Delete video file and thumbnail
            if video.file and os.path.exists(video.file.path):
                os.remove(video.file.path)
            if video.thumbnail and os.path.exists(video.thumbnail.path):
                os.remove(video.thumbnail.path)
            
            # Delete the inspection (cascades to findings, action items, etc.)
            inspection.delete()
            count += 1
            
        except Exception as e:
            logger.error(f"Error cleaning up expired inspection {inspection.id}: {e}")
    
    logger.info(f"Cleaned up {count} expired coaching mode inspections")
    return f"Cleaned up {count} expired inspections"
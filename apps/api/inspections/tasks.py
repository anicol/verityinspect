import os
from celery import shared_task
from django.utils import timezone
from django.conf import settings
from .models import Inspection, Finding, ActionItem
from ai_services.analyzer import VideoAnalyzer
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
            try:
                frame_path = frame.image.path
                
                # Read frame image as bytes for Rekognition
                frame_bytes = None
                if os.path.exists(frame_path):
                    with open(frame_path, 'rb') as f:
                        frame_bytes = f.read()
                
                # Analyze frame
                frame_analysis = analyzer.analyze_frame(frame_path, frame_bytes)
                all_analyses.append(frame_analysis)
                
                # Generate findings for this frame
                findings = analyzer.generate_findings(frame_analysis, frame)
                all_findings.extend(findings)
                
                logger.info(f"Analyzed frame {frame.frame_number} with score {frame_analysis.get('overall_score', 0)}")
                
            except Exception as e:
                logger.error(f"Error analyzing frame {frame.frame_number}: {e}")
                continue

        # Calculate overall scores
        scores = calculate_inspection_scores(all_analyses)
        
        # Update inspection with results
        inspection.overall_score = scores['overall_score']
        inspection.ppe_score = scores['ppe_score']
        inspection.safety_score = scores['safety_score']
        inspection.cleanliness_score = scores['cleanliness_score']
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
            'uniform_score': 0.0,
            'menu_board_score': 0.0
        }

    # Calculate averages
    overall_scores = [analysis.get('overall_score', 0) for analysis in frame_analyses]
    
    # For category scores, we need to extract them from the analyzer results
    ppe_scores = []
    safety_scores = []
    cleanliness_scores = []
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
        'uniform_score': sum(uniform_scores) / len(uniform_scores),
        'menu_board_score': sum(menu_scores) / len(menu_scores)
    }


def create_findings_from_analysis(inspection, findings_data):
    """Create Finding objects from analysis results"""
    for finding_data in findings_data:
        try:
            Finding.objects.create(
                inspection=inspection,
                frame=finding_data.get('frame'),
                category=finding_data.get('category', 'OTHER'),
                severity=finding_data.get('severity', 'LOW'),
                title=finding_data.get('title', 'Unknown Issue'),
                description=finding_data.get('description', ''),
                confidence=finding_data.get('confidence', 0.0),
                bounding_box=finding_data.get('bounding_box'),
                recommended_action=finding_data.get('recommended_action', '')
            )
        except Exception as e:
            logger.error(f"Error creating finding: {e}")


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
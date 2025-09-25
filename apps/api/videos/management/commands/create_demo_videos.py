from django.core.management.base import BaseCommand
from videos.models import Video
from accounts.models import User
from brands.models import Store
from django.core.files.base import ContentFile


class Command(BaseCommand):
    help = 'Create demo videos for the interactive demo experience'

    def handle(self, *args, **options):
        # Sample violation data for WATCH stage (more violations to show AI capability)
        watch_violations = [
            {
                "id": 1,
                "timestamp": 5.2,
                "duration": 3.0,
                "bbox": {"x": 15, "y": 20, "width": 25, "height": 30},
                "title": "Missing Safety Goggles",
                "category": "PPE",
                "severity": "HIGH",
                "confidence": 0.94
            },
            {
                "id": 2,
                "timestamp": 12.8,
                "duration": 2.5,
                "bbox": {"x": 45, "y": 35, "width": 20, "height": 25},
                "title": "Improper Glove Usage",
                "category": "PPE", 
                "severity": "MEDIUM",
                "confidence": 0.87
            },
            {
                "id": 3,
                "timestamp": 18.1,
                "duration": 4.0,
                "bbox": {"x": 60, "y": 10, "width": 30, "height": 35},
                "title": "Spill Not Cleaned",
                "category": "CLEANLINESS",
                "severity": "CRITICAL",
                "confidence": 0.96
            },
            {
                "id": 4,
                "timestamp": 25.3,
                "duration": 2.8,
                "bbox": {"x": 25, "y": 55, "width": 22, "height": 28},
                "title": "Unsafe Lifting Posture",
                "category": "SAFETY",
                "severity": "HIGH",
                "confidence": 0.91
            },
            {
                "id": 5,
                "timestamp": 31.7,
                "duration": 3.2,
                "bbox": {"x": 70, "y": 25, "width": 18, "height": 30},
                "title": "Non-Standard Uniform",
                "category": "UNIFORM",
                "severity": "LOW",
                "confidence": 0.78
            }
        ]

        # Sample violation data for TRY stage (fewer, more obvious violations for user to find)
        try_violations = [
            {
                "id": 1,
                "timestamp": 8.5,
                "duration": 4.0,
                "bbox": {"x": 30, "y": 25, "width": 28, "height": 32},
                "title": "No Hard Hat",
                "category": "PPE",
                "severity": "CRITICAL",
                "confidence": 0.98
            },
            {
                "id": 2,
                "timestamp": 16.2,
                "duration": 3.5,
                "bbox": {"x": 50, "y": 40, "width": 25, "height": 30},
                "title": "Blocked Emergency Exit",
                "category": "SAFETY",
                "severity": "HIGH",
                "confidence": 0.93
            },
            {
                "id": 3,
                "timestamp": 22.8,
                "duration": 2.8,
                "bbox": {"x": 20, "y": 60, "width": 35, "height": 25},
                "title": "Food on Floor",
                "category": "CLEANLINESS",
                "severity": "MEDIUM",
                "confidence": 0.89
            }
        ]

        # Get references
        admin_user = User.objects.first()
        demo_store = Store.objects.first()
        
        # Create or update WATCH demo video
        watch_video, created = Video.objects.update_or_create(
            is_demo=True,
            demo_type='WATCH',
            defaults={
                'title': 'AI Analysis Demo - Restaurant Kitchen Safety',
                'description': 'Watch as our AI identifies multiple safety violations in real-time',
                'uploaded_by': admin_user,
                'store': demo_store,
                'status': 'COMPLETED',
                'duration': 35.0,
                'demo_violations': watch_violations,
            }
        )
        
        # Set a working sample video URL for demo purposes
        if created:
            # Use a publicly available sample video for demo
            Video.objects.filter(id=watch_video.id).update(
                file='https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
            )
        
        if created:
            self.stdout.write(self.style.SUCCESS('Created WATCH demo video'))
        else:
            self.stdout.write(self.style.SUCCESS('Updated WATCH demo video'))

        # Create or update TRY demo video  
        try_video, created = Video.objects.update_or_create(
            is_demo=True,
            demo_type='TRY',
            defaults={
                'title': 'Interactive Demo - Spot the Violations',
                'description': 'Test your skills - can you spot the violations before the AI reveals them?',
                'uploaded_by': admin_user,
                'store': demo_store,
                'status': 'COMPLETED', 
                'duration': 28.0,
                'demo_violations': try_violations,
            }
        )
        
        # Set a working sample video URL for demo purposes
        if created:
            # Use a different sample video for the TRY stage
            Video.objects.filter(id=try_video.id).update(
                file='https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
            )
        
        if created:
            self.stdout.write(self.style.SUCCESS('Created TRY demo video'))
        else:
            self.stdout.write(self.style.SUCCESS('Updated TRY demo video'))

        self.stdout.write(self.style.SUCCESS(f'Demo videos ready: WATCH ({len(watch_violations)} violations), TRY ({len(try_violations)} violations)'))
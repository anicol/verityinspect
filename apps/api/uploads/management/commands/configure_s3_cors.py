import boto3
from django.core.management.base import BaseCommand
from django.conf import settings


class Command(BaseCommand):
    help = 'Configure S3 CORS policy to allow direct uploads from frontend'

    def add_arguments(self, parser):
        parser.add_argument(
            '--production-domain',
            type=str,
            default='',
            help='Production frontend domain (e.g., https://app.example.com)'
        )

    def handle(self, *args, **options):
        bucket_name = settings.AWS_STORAGE_BUCKET_NAME

        if not bucket_name:
            self.stdout.write(self.style.ERROR('AWS_STORAGE_BUCKET_NAME not configured'))
            return

        production_domain = options.get('production_domain', '')

        # Define CORS rules
        cors_configuration = {
            'CORSRules': [
                {
                    'AllowedOrigins': [
                        'http://localhost:3000',  # Development frontend
                        'http://localhost:5173',  # Vite dev server
                    ],
                    'AllowedMethods': ['GET', 'PUT', 'POST', 'HEAD'],
                    'AllowedHeaders': ['*'],
                    'ExposeHeaders': ['ETag'],
                    'MaxAgeSeconds': 3000
                }
            ]
        }

        # Add production domain if provided
        if production_domain:
            cors_configuration['CORSRules'].append({
                'AllowedOrigins': [production_domain],
                'AllowedMethods': ['GET', 'PUT', 'POST', 'HEAD'],
                'AllowedHeaders': ['*'],
                'ExposeHeaders': ['ETag'],
                'MaxAgeSeconds': 3000
            })

        try:
            # Create S3 client
            s3_client = boto3.client(
                's3',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_S3_REGION_NAME
            )

            # Apply CORS configuration
            s3_client.put_bucket_cors(
                Bucket=bucket_name,
                CORSConfiguration=cors_configuration
            )

            self.stdout.write(self.style.SUCCESS(f'Successfully configured CORS for bucket: {bucket_name}'))
            self.stdout.write(self.style.SUCCESS('Allowed origins:'))
            for rule in cors_configuration['CORSRules']:
                for origin in rule['AllowedOrigins']:
                    self.stdout.write(f'  - {origin}')

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Failed to configure CORS: {str(e)}'))
            self.stdout.write(self.style.ERROR('Make sure your AWS credentials have s3:PutBucketCORS permission'))

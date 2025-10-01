import boto3
import json
from django.core.management.base import BaseCommand
from django.conf import settings


class Command(BaseCommand):
    help = 'Check S3 bucket configuration (CORS, bucket policy, ACL)'

    def handle(self, *args, **options):
        bucket_name = settings.AWS_STORAGE_BUCKET_NAME

        if not bucket_name:
            self.stdout.write(self.style.ERROR('AWS_STORAGE_BUCKET_NAME not configured'))
            return

        try:
            # Create S3 client
            s3_client = boto3.client(
                's3',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_S3_REGION_NAME
            )

            self.stdout.write(self.style.SUCCESS(f'\n=== S3 Configuration for bucket: {bucket_name} ===\n'))

            # Check CORS configuration
            self.stdout.write(self.style.WARNING('CORS Configuration:'))
            try:
                cors = s3_client.get_bucket_cors(Bucket=bucket_name)
                self.stdout.write(json.dumps(cors['CORSRules'], indent=2))
            except Exception as e:
                error_code = e.response.get('Error', {}).get('Code', '') if hasattr(e, 'response') else ''
                if error_code == 'NoSuchCORSConfiguration':
                    self.stdout.write(self.style.ERROR('  No CORS configuration found!'))
                else:
                    self.stdout.write(self.style.ERROR(f'  Error getting CORS: {str(e)}'))

            # Check bucket policy
            self.stdout.write(self.style.WARNING('\nBucket Policy:'))
            try:
                policy = s3_client.get_bucket_policy(Bucket=bucket_name)
                policy_json = json.loads(policy['Policy'])
                self.stdout.write(json.dumps(policy_json, indent=2))
            except Exception as e:
                error_code = e.response.get('Error', {}).get('Code', '') if hasattr(e, 'response') else ''
                if error_code == 'NoSuchBucketPolicy':
                    self.stdout.write(self.style.SUCCESS('  No bucket policy (using IAM roles - SECURE)'))
                else:
                    self.stdout.write(self.style.ERROR(f'  Error getting policy: {str(e)}'))

            # Check public access block
            self.stdout.write(self.style.WARNING('\nPublic Access Block:'))
            try:
                public_block = s3_client.get_public_access_block(Bucket=bucket_name)
                config = public_block['PublicAccessBlockConfiguration']
                self.stdout.write(f"  Block Public ACLs: {config['BlockPublicAcls']}")
                self.stdout.write(f"  Ignore Public ACLs: {config['IgnorePublicAcls']}")
                self.stdout.write(f"  Block Public Policy: {config['BlockPublicPolicy']}")
                self.stdout.write(f"  Restrict Public Buckets: {config['RestrictPublicBuckets']}")

                if all([config['BlockPublicAcls'], config['IgnorePublicAcls'],
                       config['BlockPublicPolicy'], config['RestrictPublicBuckets']]):
                    self.stdout.write(self.style.SUCCESS('  ✓ Bucket is FULLY PRIVATE (secure)'))
                else:
                    self.stdout.write(self.style.WARNING('  ⚠ Bucket has some public access'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'  Error getting public access block: {str(e)}'))

            # Django settings check
            self.stdout.write(self.style.WARNING('\nDjango S3 Settings:'))
            self.stdout.write(f"  AWS_QUERYSTRING_AUTH: {settings.AWS_QUERYSTRING_AUTH}")
            self.stdout.write(f"  AWS_QUERYSTRING_EXPIRE: {settings.AWS_QUERYSTRING_EXPIRE} seconds")
            self.stdout.write(f"  AWS_DEFAULT_ACL: {settings.AWS_DEFAULT_ACL}")

            if settings.AWS_QUERYSTRING_AUTH:
                self.stdout.write(self.style.SUCCESS('  ✓ Using signed URLs (secure)'))
            else:
                self.stdout.write(self.style.WARNING('  ⚠ Not using signed URLs'))

            self.stdout.write(self.style.SUCCESS('\n=== Configuration check complete ===\n'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Failed to check S3 configuration: {str(e)}'))
            self.stdout.write(self.style.ERROR('Make sure your AWS credentials have the necessary S3 permissions'))

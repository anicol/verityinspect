# AWS Setup Guide for VerityInspect

This guide walks you through setting up AWS services and getting the credentials needed for Render deployment.

## Step 1: Create AWS Account

1. **Go to AWS Console**
   - Visit: [aws.amazon.com](https://aws.amazon.com)
   - Click "Sign In" or "Create AWS Account"
   - Follow the account creation process

2. **Account Setup**
   - Provide payment method (required even for free tier)
   - Choose support plan (Basic - Free is sufficient)
   - Verify identity via phone

## Step 2: Create S3 Bucket for Media Storage

1. **Navigate to S3**
   - AWS Console → Services → S3
   - Or search "S3" in the top search bar

2. **Create Bucket**
   - Click "Create bucket"
   - **Bucket name**: `verityinspect-media` (must be globally unique)
   - **Region**: `US East (N. Virginia) us-east-1`
   - **Object Ownership**: ACLs disabled (recommended)

3. **Configure Bucket Settings**
   - **Block Public Access**: Keep all settings checked (we'll use presigned URLs)
   - **Bucket Versioning**: Enable (recommended for data protection)
   - **Default encryption**: Server-side encryption with Amazon S3 managed keys (SSE-S3)
   - Click "Create bucket"

## Step 3: Create IAM User for VerityInspect

1. **Navigate to IAM**
   - AWS Console → Services → IAM
   - Or search "IAM" in the search bar

2. **Create User**
   - Click "Users" in left sidebar
   - Click "Create user"
   - **User name**: `verityinspect-app`
   - **Console access**: Uncheck (this is a programmatic user)
   - Click "Next"

3. **Set Permissions**
   - Choose "Attach policies directly"
   - For now, click "Next" (we'll add custom policy)
   - Click "Create user"

## Step 4: Create Custom IAM Policy

1. **Create Policy**
   - In IAM, click "Policies" in left sidebar
   - Click "Create policy"
   - Click "JSON" tab

2. **Add Policy JSON**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "S3BucketAccess",
         "Effect": "Allow",
         "Action": [
           "s3:GetObject",
           "s3:PutObject",
           "s3:DeleteObject",
           "s3:GetObjectVersion",
           "s3:ListBucket"
         ],
         "Resource": [
           "arn:aws:s3:::verityinspect-media",
           "arn:aws:s3:::verityinspect-media/*"
         ]
       },
       {
         "Sid": "RekognitionAccess",
         "Effect": "Allow",
         "Action": [
           "rekognition:DetectProtectiveEquipment",
           "rekognition:DetectLabels",
           "rekognition:DetectFaces",
           "rekognition:DetectModerationLabels"
         ],
         "Resource": "*"
       }
     ]
   }
   ```

3. **Save Policy**
   - Click "Next: Tags" (skip tags)
   - Click "Next: Review"
   - **Name**: `VerityInspectAppPolicy`
   - **Description**: `S3 and Rekognition access for VerityInspect application`
   - Click "Create policy"

## Step 5: Attach Policy to User

1. **Go to Users**
   - IAM → Users → `verityinspect-app`

2. **Add Permissions**
   - Click "Add permissions" dropdown
   - Select "Attach policies directly"
   - Search for `VerityInspectAppPolicy`
   - Check the policy box
   - Click "Add permissions"

## Step 6: Create Access Keys

1. **Generate Access Keys**
   - In user details page, click "Security credentials" tab
   - Scroll to "Access keys" section
   - Click "Create access key"

2. **Select Use Case**
   - Choose "Application running outside AWS"
   - Check "I understand the above recommendation"
   - Click "Next"

3. **Add Description (Optional)**
   - **Description**: `VerityInspect Render deployment`
   - Click "Create access key"

4. **⚠️ IMPORTANT: Save Credentials**
   - **Access Key ID**: Copy and save securely
   - **Secret Access Key**: Copy and save securely
   - **Download .csv file** for backup
   - ⚠️ This is your ONLY chance to see the secret key!

## Step 7: Test S3 Access (Optional)

You can test the credentials using AWS CLI:

```bash
# Install AWS CLI (if not installed)
pip install awscli

# Configure credentials
aws configure
# Enter your Access Key ID
# Enter your Secret Access Key  
# Region: us-east-1
# Output format: json

# Test S3 access
aws s3 ls s3://verityinspect-media/
```

## Step 8: Set Environment Variables in Render

1. **Go to Render Dashboard**
   - Navigate to your `verityinspect-api` service
   - Go to "Environment" tab

2. **Add AWS Credentials**
   ```bash
   AWS_ACCESS_KEY_ID=AKIA...your_access_key_here
   AWS_SECRET_ACCESS_KEY=wJa...your_secret_key_here
   AWS_STORAGE_BUCKET_NAME=verityinspect-media
   AWS_S3_REGION_NAME=us-east-1
   ```

3. **Deploy**
   - Click "Save Changes"
   - Service will redeploy with new environment variables

## Step 9: Verify Setup

After deployment, test the setup:

1. **Check API Health**
   ```bash
   curl https://your-api-url.onrender.com/health/
   ```

2. **Test File Upload** (once deployed)
   - Login to web app
   - Try uploading a test video
   - Check S3 bucket for uploaded files

## Security Best Practices

### 1. Principle of Least Privilege
- The IAM policy only grants necessary S3 and Rekognition permissions
- No unnecessary AWS service access

### 2. Key Rotation
- Rotate access keys every 90 days
- Monitor key usage in AWS CloudTrail

### 3. Monitoring
- Enable S3 access logging
- Set up CloudWatch alarms for unusual access patterns

### 4. Backup Strategy
- S3 bucket versioning is enabled
- Consider Cross-Region Replication for critical data

## Cost Estimates

### S3 Storage
- **Free Tier**: 5 GB storage for 12 months
- **After Free Tier**: ~$0.023/GB/month
- **Requests**: ~$0.0004 per 1,000 PUT requests

### Rekognition
- **Free Tier**: 5,000 images/month for 12 months  
- **After Free Tier**: ~$0.001 per image analyzed

### Expected Monthly Cost
- **Development/Testing**: $0-5/month (within free tier)
- **Production**: $10-50/month depending on usage

## Troubleshooting

### Access Denied Errors
1. Verify bucket name matches exactly: `verityinspect-media`
2. Check IAM policy resource ARNs are correct
3. Ensure user has the custom policy attached

### Rekognition Errors
1. Verify region is `us-east-1` (Rekognition availability)
2. Check IAM policy includes Rekognition permissions
3. Ensure image format is supported (JPEG, PNG)

### Key Not Working
1. Verify credentials are copied correctly (no extra spaces)
2. Check if keys are active in IAM console
3. Verify user has permissions attached

## Support Resources

- **AWS Documentation**: [docs.aws.amazon.com](https://docs.aws.amazon.com)
- **S3 User Guide**: Search "S3 User Guide" in AWS docs
- **IAM User Guide**: Search "IAM User Guide" in AWS docs
- **AWS Support**: Basic support included with account

---

## Quick Reference

**Bucket Name**: `verityinspect-media`  
**Region**: `us-east-1`  
**IAM User**: `verityinspect-app`  
**Policy Name**: `VerityInspectAppPolicy`

**Environment Variables for Render**:
```bash
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key  
AWS_STORAGE_BUCKET_NAME=verityinspect-media
AWS_S3_REGION_NAME=us-east-1
```
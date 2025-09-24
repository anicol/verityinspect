# API Client Generation for VerityInspect

This document explains the automated OpenAPI schema generation and TypeScript client generation system for VerityInspect.

## Overview

VerityInspect uses a sophisticated API documentation and client generation system that:

1. **Automatically generates OpenAPI 3.0 schemas** from Django REST Framework views
2. **Creates type-safe TypeScript clients** for frontend consumption
3. **Provides comprehensive API documentation** with examples and detailed descriptions
4. **Maintains API consistency** across development and production environments

## Architecture

### OpenAPI Schema Generation

The Django backend uses `drf-spectacular` to automatically generate OpenAPI schemas from:
- ViewSets and APIViews
- Serializers (for request/response types)
- URL patterns and routing
- Custom schema hooks for enhanced documentation

**Key Components:**
- `verityinspect/settings.py`: Spectacular configuration
- `verityinspect/schema.py`: Custom schema hooks and processors
- `/api/schema/`: OpenAPI schema endpoint
- `/api/docs/`: Interactive Swagger UI

### TypeScript Client Generation

The `scripts/generate-client.js` script:
1. Fetches the OpenAPI schema from the Django backend
2. Parses schema definitions into TypeScript interfaces
3. Generates API client methods with proper typing
4. Creates a complete TypeScript package

## Usage

### Manual Generation (Development)

```bash
# From project root
./scripts/dev-generate-client.sh

# Or with custom API URL
API_URL=https://verityinspect-api.onrender.com ./scripts/dev-generate-client.sh

# From web app directory
npm run generate-client
# or for production
npm run generate-client:prod
```

### Automatic Generation (CI/CD)

The GitHub Actions workflow automatically generates clients when:
- Python files in `apps/api/` change
- Views, serializers, or URL configurations are modified
- Manual workflow dispatch

## Generated Files

The generation process creates three main files in `apps/web/src/generated/`:

### `types.ts`
TypeScript interfaces for all API models:
```typescript
export interface Video {
  id: number;
  title: string;
  status: 'UPLOADED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  created_at: string;
  store?: Store;
}

export interface Upload {
  id: number;
  s3_key: string;
  mode: 'inspection' | 'coaching';
  status: 'uploaded' | 'processing' | 'complete' | 'failed';
  original_filename: string;
  created_by: number;
}
```

### `client.ts`
Type-safe API client class:
```typescript
export class VerityInspectClient {
  constructor(baseURL?: string, token?: string);
  
  // Authentication
  async post_auth_login(data: LoginCredentials): Promise<AxiosResponse<AuthResponse>>;
  
  // Videos
  async get_videos(params?: Record<string, any>): Promise<AxiosResponse<Video[]>>;
  async post_videos(data: FormData): Promise<AxiosResponse<Video>>;
  
  // Uploads
  async post_uploads_request_presigned_url(data: PresignedUrlRequest): Promise<AxiosResponse<PresignedUrlResponse>>;
  async post_uploads_confirm(upload_id: number): Promise<AxiosResponse<any>>;
}
```

### `index.ts`
Package exports and convenience imports:
```typescript
export * from './types';
export { default as VerityInspectClient } from './client';
export { VerityInspectClient as Client } from './client';
```

## Integration Examples

### Basic Usage

```typescript
import { VerityInspectClient, Video, Upload } from '@/generated';

const client = new VerityInspectClient();

// Login and set token
const auth = await client.post_auth_login({
  username: 'inspector@example.com',
  password: 'demo123'
});
client.setAuthToken(auth.data.access);

// Get videos with full type safety
const videos: Video[] = (await client.get_videos()).data;

// Request presigned URL for upload
const uploadRequest = await client.post_uploads_request_presigned_url({
  filename: 'kitchen_inspection.mp4',
  file_type: 'video/mp4',
  store_id: 1,
  mode: 'inspection'
});
```

### React Hook Integration

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { VerityInspectClient, Video } from '@/generated';

const client = new VerityInspectClient();

function useVideos() {
  return useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      const response = await client.get_videos();
      return response.data;
    }
  });
}

function useUploadVideo() {
  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await client.post_videos(data);
      return response.data;
    }
  });
}
```

## Schema Customization

### Adding Custom Tags

In your Django views, add schema customization:

```python
from drf_spectacular.utils import extend_schema

@extend_schema(
    tags=['Custom'],
    summary='Custom endpoint',
    description='Detailed description of what this endpoint does',
    responses={200: CustomSerializer}
)
class CustomViewSet(viewsets.ModelViewSet):
    # Your view implementation
    pass
```

### Custom Schema Processors

The `verityinspect/schema.py` file contains hooks for:

**Preprocessing Hook:**
- Auto-assigns tags based on model names
- Filters out admin endpoints
- Applies consistent naming conventions

**Postprocessing Hook:**
- Adds security schemes (JWT Bearer)
- Injects custom examples
- Enhances operation descriptions

### Example Customization

```python
def custom_preprocessing_hook(endpoints):
    # Add custom logic for endpoint processing
    for (path, path_regex, method, callback) in endpoints:
        if hasattr(callback.cls, 'queryset'):
            model_name = callback.cls.queryset.model.__name__
            callback.cls.tags = [f'{model_name}s']
    return endpoints
```

## API Documentation Features

### Interactive Swagger UI

Available at `/api/docs/` with:
- **Try it out** functionality
- Authentication support (JWT Bearer)
- Request/response examples
- Schema validation
- Download OpenAPI spec

### Schema Endpoint

The `/api/schema/` endpoint provides:
- Complete OpenAPI 3.0 specification
- JSON format for programmatic access
- Version information and server details
- Comprehensive type definitions

## Development Workflow

### 1. Backend Changes
When modifying Django models, serializers, or views:

```bash
# Make your changes to Django code
# The schema is automatically updated

# Generate client locally to test
./scripts/dev-generate-client.sh
```

### 2. Frontend Integration
Use the generated types in your React components:

```typescript
// Instead of generic types
const [videos, setVideos] = useState<any[]>([]);

// Use generated types
const [videos, setVideos] = useState<Video[]>([]);
```

### 3. Deployment
The GitHub Actions workflow automatically:
- Detects API changes
- Generates updated client
- Commits changes back to the repository
- Creates PR comments with update summaries

## Best Practices

### Backend (Django)

1. **Use descriptive serializer field help texts**:
```python
class VideoSerializer(serializers.ModelSerializer):
    title = serializers.CharField(
        help_text="Human-readable title for the video"
    )
```

2. **Add operation descriptions with @extend_schema**:
```python
@extend_schema(
    summary="Upload a new video",
    description="Upload a video file for AI-powered inspection analysis"
)
def create(self, request):
    # Implementation
```

3. **Use proper HTTP status codes and responses**:
```python
@extend_schema(
    responses={
        201: VideoSerializer,
        400: 'Bad request - invalid data',
        413: 'File too large'
    }
)
```

### Frontend (TypeScript)

1. **Always use generated types**:
```typescript
// Good
const video: Video = await client.get_video(id);

// Avoid
const video: any = await client.get_video(id);
```

2. **Handle API errors properly**:
```typescript
try {
  const result = await client.post_videos(formData);
} catch (error: ApiError) {
  console.error('Upload failed:', error.message);
}
```

3. **Leverage type safety**:
```typescript
// TypeScript will catch typos and type mismatches
const upload: Upload = {
  mode: 'inspection', // ✅ Valid enum value
  // mode: 'invalid',  // ❌ TypeScript error
};
```

## Troubleshooting

### Schema Generation Issues

**Problem**: Schema endpoint returns 500 error
**Solution**: Check Django logs, ensure all serializers are valid

**Problem**: Missing endpoints in schema
**Solution**: Verify URLconf includes all viewsets, check view permissions

### Client Generation Issues

**Problem**: TypeScript compilation errors
**Solution**: Check generated types, may need to handle null/undefined values

**Problem**: API calls fail with 401
**Solution**: Ensure JWT token is properly set with `client.setAuthToken()`

### Development Issues

**Problem**: Generated client out of sync
**Solution**: Run `./scripts/dev-generate-client.sh` after API changes

**Problem**: Types don't match API responses
**Solution**: Check serializer definitions, ensure proper field types

## Monitoring and Maintenance

### Schema Validation
- Monitor schema endpoint health in production
- Validate generated client compatibility
- Track API versioning and breaking changes

### Performance Considerations
- Schema generation is cached by Django
- Client generation should run in CI/CD only when needed
- Frontend bundle size impact is minimal due to tree-shaking

### Version Management
- Generated client version matches API version
- Semantic versioning for breaking changes
- Backward compatibility considerations

This automated system ensures that the frontend always has up-to-date, type-safe access to the VerityInspect API, reducing development time and preventing runtime errors.
"""
OpenAPI schema customization for PeakOps API
"""
from drf_spectacular.openapi import AutoSchema
from drf_spectacular.utils import extend_schema_view


def custom_preprocessing_hook(endpoints):
    """
    Pre-process the API endpoints before schema generation
    """
    filtered = []
    for (path, path_regex, method, callback) in endpoints:
        # Skip admin endpoints
        if path.startswith('/admin'):
            continue
        
        # Add tags based on URL patterns
        if hasattr(callback.cls, 'queryset') and hasattr(callback.cls.queryset, 'model'):
            model_name = callback.cls.queryset.model.__name__
            
            # Auto-tag based on model names
            if model_name in ['User']:
                callback.cls.tags = ['Authentication']
            elif model_name in ['Video', 'VideoFrame']:
                callback.cls.tags = ['Videos']
            elif model_name in ['Upload']:
                callback.cls.tags = ['Uploads']  
            elif model_name in ['Inspection', 'Detection', 'Rule']:
                callback.cls.tags = ['Inspections']
            elif model_name in ['Brand', 'Store']:
                callback.cls.tags = ['Brands']
            else:
                callback.cls.tags = ['Core']
        
        filtered.append((path, path_regex, method, callback))
    
    return filtered


def custom_postprocessing_hook(result, generator, request, public):
    """
    Post-process the generated OpenAPI schema
    """
    # Add custom security schemes
    if 'components' not in result:
        result['components'] = {}
    
    if 'securitySchemes' not in result['components']:
        result['components']['securitySchemes'] = {}
    
    result['components']['securitySchemes']['JWT'] = {
        'type': 'http',
        'scheme': 'bearer',
        'bearerFormat': 'JWT',
        'description': 'JWT token obtained from /api/auth/login/'
    }
    
    # Add global security requirement
    result['security'] = [{'JWT': []}]
    
    # Add custom response examples
    add_custom_examples(result)
    
    return result


def add_custom_examples(schema):
    """
    Add custom examples to the schema
    """
    if 'paths' not in schema:
        return
    
    # Add examples for common endpoints
    paths = schema['paths']
    
    # Auth login example
    if '/api/auth/login/' in paths and 'post' in paths['/api/auth/login/']:
        login_endpoint = paths['/api/auth/login/']['post']
        if 'requestBody' in login_endpoint:
            login_endpoint['requestBody']['content']['application/json']['example'] = {
                'username': 'inspector@example.com',
                'password': 'demo123'
            }
    
    # Video upload example
    if '/api/videos/' in paths and 'post' in paths['/api/videos/']:
        video_endpoint = paths['/api/videos/']['post']
        video_endpoint['summary'] = 'Upload a new video for inspection'
        video_endpoint['description'] = '''
        Upload a video file for AI-powered inspection analysis.
        Supports MP4, MOV, and AVI formats up to 100MB.
        '''
    
    # Presigned URL example
    if '/api/uploads/request-presigned-url/' in paths and 'post' in paths['/api/uploads/request-presigned-url/']:
        upload_endpoint = paths['/api/uploads/request-presigned-url/']['post']
        upload_endpoint['summary'] = 'Request presigned URL for direct S3 upload'
        upload_endpoint['description'] = '''
        Request a presigned URL for direct video upload to S3.
        This is the preferred method for large video files.
        '''
        if 'requestBody' in upload_endpoint:
            upload_endpoint['requestBody']['content']['application/json']['example'] = {
                'filename': 'kitchen_inspection_2024.mp4',
                'file_type': 'video/mp4',
                'store_id': 1,
                'mode': 'inspection'
            }


class CustomAutoSchema(AutoSchema):
    """
    Custom schema generator for enhanced OpenAPI documentation
    """
    
    def get_tags(self):
        """
        Override to provide better tag inference
        """
        tags = super().get_tags()
        
        # Use model-based tags if available
        if hasattr(self.target_component, 'tags'):
            return self.target_component.tags
            
        return tags
    
    def get_operation_id(self):
        """
        Generate more descriptive operation IDs
        """
        method = self.method.lower()
        path_name = self.path.replace('/api/', '').replace('/', '_').strip('_')
        
        # Clean up operation ID
        if path_name.endswith('_'):
            path_name = path_name[:-1]
            
        return f"{method}_{path_name}"
    
    def get_summary(self):
        """
        Generate better summaries for operations
        """
        summary = super().get_summary()
        
        # Add custom summaries for common patterns
        if 'presigned-url' in self.path:
            return 'Request presigned URL for S3 upload'
        elif 'confirm' in self.path:
            return 'Confirm upload completion'
        elif 'retention' in self.path:
            return 'Manage data retention'
        
        return summary
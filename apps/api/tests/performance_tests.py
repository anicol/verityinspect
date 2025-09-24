from django.test import TestCase, TransactionTestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.test.utils import override_settings
from django.db import transaction, connections
from django.core.cache import cache
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch, MagicMock
from concurrent.futures import ThreadPoolExecutor, as_completed
import time
import threading
from datetime import timedelta
import statistics

from brands.models import Brand, Store  
from uploads.models import Upload, Detection, Rule, Violation, Scorecard
from videos.models import Video
from inspections.models import Inspection, Finding

User = get_user_model()


class VideoUploadPerformanceTest(TransactionTestCase):
    """Test performance of video upload operations"""
    
    def setUp(self):
        self.client = APIClient()
        self.brand = Brand.objects.create(name="Performance Test Brand")
        self.store = Store.objects.create(
            brand=self.brand, name="Perf Store", code="PS001",
            address="123 Perf St", city="Perf City", state="PS", zip_code="12345"
        )
        self.user = User.objects.create_user(
            username="perfuser", store=self.store
        )
        self.client.force_authenticate(user=self.user)

    @patch('uploads.views.boto3.client')
    def test_concurrent_presigned_url_requests(self, mock_boto):
        """Test performance of concurrent presigned URL requests"""
        mock_s3_client = MagicMock()
        mock_s3_client.generate_presigned_url.return_value = "https://test-presigned-url.com"
        mock_boto.return_value = mock_s3_client
        
        def request_presigned_url():
            data = {
                'filename': f'test_video_{threading.current_thread().ident}.mp4',
                'file_type': 'video/mp4', 
                'store_id': self.store.id,
                'mode': 'inspection'
            }
            
            start_time = time.time()
            response = self.client.post('/api/uploads/request-presigned-url/', data)
            end_time = time.time()
            
            return {
                'status_code': response.status_code,
                'response_time': end_time - start_time,
                'thread_id': threading.current_thread().ident
            }
        
        # Test concurrent requests
        num_concurrent_requests = 10
        response_times = []
        
        with ThreadPoolExecutor(max_workers=num_concurrent_requests) as executor:
            futures = [
                executor.submit(request_presigned_url)
                for _ in range(num_concurrent_requests)
            ]
            
            results = [future.result() for future in as_completed(futures)]
        
        # Analyze results
        successful_requests = [r for r in results if r['status_code'] == 200]
        response_times = [r['response_time'] for r in successful_requests]
        
        self.assertEqual(len(successful_requests), num_concurrent_requests)
        
        # Performance assertions
        avg_response_time = statistics.mean(response_times)
        max_response_time = max(response_times)
        
        print(f"Average response time: {avg_response_time:.3f}s")
        print(f"Max response time: {max_response_time:.3f}s")
        
        # Assert reasonable performance (adjust thresholds as needed)
        self.assertLess(avg_response_time, 2.0, "Average response time should be under 2 seconds")
        self.assertLess(max_response_time, 5.0, "Max response time should be under 5 seconds")

    def test_bulk_upload_creation_performance(self):
        """Test performance of creating many upload records"""
        num_uploads = 100
        
        start_time = time.time()
        
        uploads = []
        for i in range(num_uploads):
            uploads.append(Upload(
                store=self.store,
                mode=Upload.Mode.INSPECTION,
                s3_key=f"uploads/bulk_test_{i}.mp4",
                original_filename=f"bulk_test_{i}.mp4",
                status=Upload.Status.UPLOADED,
                created_by=self.user
            ))
        
        # Bulk create for better performance
        Upload.objects.bulk_create(uploads)
        
        end_time = time.time()
        creation_time = end_time - start_time
        
        print(f"Created {num_uploads} uploads in {creation_time:.3f}s")
        print(f"Average creation time per upload: {(creation_time/num_uploads)*1000:.2f}ms")
        
        # Verify all uploads were created
        self.assertEqual(Upload.objects.count(), num_uploads)
        
        # Performance assertion
        self.assertLess(creation_time, 5.0, "Bulk upload creation should complete in under 5 seconds")

    def test_upload_status_query_performance(self):
        """Test performance of querying upload status"""
        # Create test data
        num_uploads = 500
        uploads = []
        
        for i in range(num_uploads):
            uploads.append(Upload(
                store=self.store,
                mode=Upload.Mode.INSPECTION if i % 2 == 0 else Upload.Mode.COACHING,
                s3_key=f"uploads/query_test_{i}.mp4",
                original_filename=f"query_test_{i}.mp4",
                status=Upload.Status.COMPLETE if i % 3 == 0 else Upload.Status.PROCESSING,
                created_by=self.user
            ))
        
        Upload.objects.bulk_create(uploads)
        
        # Test various query patterns
        queries = [
            ('All uploads', lambda: Upload.objects.all().count()),
            ('Inspection mode', lambda: Upload.objects.filter(mode=Upload.Mode.INSPECTION).count()),
            ('Complete status', lambda: Upload.objects.filter(status=Upload.Status.COMPLETE).count()),
            ('Store filter', lambda: Upload.objects.filter(store=self.store).count()),
            ('Complex filter', lambda: Upload.objects.filter(
                store=self.store,
                mode=Upload.Mode.INSPECTION, 
                status=Upload.Status.COMPLETE
            ).count())
        ]
        
        for query_name, query_func in queries:
            start_time = time.time()
            result_count = query_func()
            end_time = time.time()
            
            query_time = end_time - start_time
            print(f"{query_name}: {result_count} results in {query_time*1000:.2f}ms")
            
            # Performance assertion - queries should be fast
            self.assertLess(query_time, 0.1, f"{query_name} query should complete in under 100ms")


class DetectionPerformanceTest(TestCase):
    """Test performance of detection and rule processing"""
    
    def setUp(self):
        self.brand = Brand.objects.create(name="Detection Perf Brand")
        self.store = Store.objects.create(
            brand=self.brand, name="Det Store", code="DS001",
            address="123 Det St", city="Det City", state="DS", zip_code="12345"
        )
        self.user = User.objects.create_user(
            username="detuser", store=self.store
        )
        self.upload = Upload.objects.create(
            store=self.store, mode=Upload.Mode.INSPECTION,
            s3_key="uploads/detection_test.mp4", original_filename="detection_test.mp4",
            created_by=self.user
        )

    def test_bulk_detection_creation(self):
        """Test performance of creating many detection records"""
        num_detections = 1000
        
        detections = []
        for i in range(num_detections):
            detections.append(Detection(
                upload=self.upload,
                type="PPE" if i % 3 == 0 else "SAFETY" if i % 3 == 1 else "CLEANLINESS",
                label=f"detection_{i}",
                confidence=0.5 + (i % 50) / 100,  # Vary confidence 0.5-0.99
                frame_ts_ms=i * 100,  # Every 100ms
                bbox_json={"x": i % 100, "y": i % 100, "width": 50, "height": 50}
            ))
        
        start_time = time.time()
        Detection.objects.bulk_create(detections)
        end_time = time.time()
        
        creation_time = end_time - start_time
        print(f"Created {num_detections} detections in {creation_time:.3f}s")
        
        # Verify creation
        self.assertEqual(Detection.objects.count(), num_detections)
        
        # Performance assertion
        self.assertLess(creation_time, 3.0, "Detection bulk creation should complete in under 3 seconds")

    def test_detection_filtering_performance(self):
        """Test performance of filtering detections"""
        # Create test detections first
        self.test_bulk_detection_creation()
        
        filter_tests = [
            ('By type', lambda: Detection.objects.filter(type="PPE")),
            ('By confidence', lambda: Detection.objects.filter(confidence__gte=0.8)),
            ('By time range', lambda: Detection.objects.filter(
                frame_ts_ms__gte=10000, frame_ts_ms__lte=50000
            )),
            ('Complex filter', lambda: Detection.objects.filter(
                upload=self.upload, type="PPE", confidence__gte=0.7
            ).order_by('-confidence'))
        ]
        
        for test_name, filter_func in filter_tests:
            start_time = time.time()
            results = list(filter_func())  # Force evaluation
            end_time = time.time()
            
            filter_time = end_time - start_time
            print(f"{test_name}: {len(results)} results in {filter_time*1000:.2f}ms")
            
            # Performance assertion
            self.assertLess(filter_time, 0.5, f"{test_name} filter should complete in under 500ms")

    def test_rule_evaluation_performance(self):
        """Test performance of rule evaluation logic"""
        # Create rules
        rules = []
        for i in range(50):
            rules.append(Rule(
                brand=self.brand,
                code=f"RULE_{i:03d}",
                name=f"Performance Rule {i}",
                description=f"Test rule {i} for performance testing",
                config_json={
                    "min_confidence": 0.7 + (i % 3) * 0.1,
                    "detection_types": ["PPE", "SAFETY"],
                    "violation_threshold": 1 + (i % 3)
                }
            ))
        
        Rule.objects.bulk_create(rules)
        
        # Create detections that will trigger rules
        detections = []
        for i in range(200):
            detections.append(Detection(
                upload=self.upload,
                type="PPE",
                label="no_mask_detected",
                confidence=0.85,
                frame_ts_ms=i * 500,
                bbox_json={"x": 100, "y": 100, "width": 50, "height": 50}
            ))
        
        Detection.objects.bulk_create(detections)
        
        # Simulate rule evaluation
        start_time = time.time()
        
        active_rules = Rule.objects.filter(brand=self.brand, is_active=True)
        high_confidence_detections = Detection.objects.filter(
            upload=self.upload, confidence__gte=0.8
        )
        
        # Simulate basic rule matching logic
        violations_created = 0
        for rule in active_rules:
            min_conf = rule.config_json.get("min_confidence", 0.7)
            matching_detections = high_confidence_detections.filter(
                confidence__gte=min_conf
            )
            
            if matching_detections.exists():
                violations_created += 1
        
        end_time = time.time()
        
        evaluation_time = end_time - start_time
        print(f"Evaluated {active_rules.count()} rules against {high_confidence_detections.count()} detections")
        print(f"Rule evaluation completed in {evaluation_time:.3f}s")
        print(f"Would create {violations_created} violations")
        
        # Performance assertion
        self.assertLess(evaluation_time, 2.0, "Rule evaluation should complete in under 2 seconds")


class DatabasePerformanceTest(TestCase):
    """Test database query performance"""
    
    def setUp(self):
        self.brand = Brand.objects.create(name="DB Perf Brand")
        self.store = Store.objects.create(
            brand=self.brand, name="DB Store", code="DBS001", 
            address="123 DB St", city="DB City", state="DB", zip_code="12345"
        )
        self.user = User.objects.create_user(
            username="dbuser", store=self.store
        )

    def test_complex_analytics_query_performance(self):
        """Test performance of complex analytics queries"""
        # Create substantial test data
        num_uploads = 100
        uploads = []
        
        base_date = timezone.now() - timedelta(days=90)
        
        for i in range(num_uploads):
            uploads.append(Upload(
                store=self.store,
                mode=Upload.Mode.INSPECTION if i % 3 == 0 else Upload.Mode.COACHING,
                s3_key=f"uploads/analytics_{i}.mp4",
                original_filename=f"analytics_{i}.mp4",
                status=Upload.Status.COMPLETE,
                created_by=self.user,
                duration_s=60 + (i % 120)  # 60-180 seconds
            ))
        
        # Manually set different creation dates
        Upload.objects.bulk_create(uploads)
        
        # Update creation dates to spread over time
        for i, upload in enumerate(Upload.objects.all()):
            Upload.objects.filter(id=upload.id).update(
                created_at=base_date + timedelta(days=i % 90)
            )
        
        # Test complex aggregation queries
        queries = [
            ('Upload count by mode', lambda: Upload.objects.values('mode').annotate(
                count=models.Count('id')
            )),
            ('Uploads per day last 30 days', lambda: Upload.objects.filter(
                created_at__gte=timezone.now() - timedelta(days=30)
            ).extra(
                select={'day': 'DATE(created_at)'}
            ).values('day').annotate(count=models.Count('id'))),
            ('Average duration by mode', lambda: Upload.objects.values('mode').annotate(
                avg_duration=models.Avg('duration_s')
            ))
        ]
        
        for query_name, query_func in queries:
            start_time = time.time()
            with self.assertNumQueriesLessThan(5):  # Ensure efficient querying
                results = list(query_func())
            end_time = time.time()
            
            query_time = end_time - start_time
            print(f"{query_name}: {len(results)} results in {query_time*1000:.2f}ms")
            
            # Performance assertion
            self.assertLess(query_time, 1.0, f"{query_name} should complete in under 1 second")

    def assertNumQueriesLessThan(self, num):
        """Custom assertion to check query count"""
        return self.assertNumQueries(num, using='default')

    def test_pagination_performance(self):
        """Test performance of paginated queries"""
        # Create large dataset
        num_records = 1000
        uploads = []
        
        for i in range(num_records):
            uploads.append(Upload(
                store=self.store,
                mode=Upload.Mode.INSPECTION,
                s3_key=f"uploads/page_test_{i}.mp4", 
                original_filename=f"page_test_{i}.mp4",
                status=Upload.Status.COMPLETE,
                created_by=self.user
            ))
        
        Upload.objects.bulk_create(uploads)
        
        # Test pagination at different offsets
        page_size = 50
        offsets = [0, 100, 500, 900]  # Different positions
        
        for offset in offsets:
            start_time = time.time()
            page_results = Upload.objects.all()[offset:offset + page_size]
            list(page_results)  # Force evaluation
            end_time = time.time()
            
            page_time = end_time - start_time
            print(f"Page at offset {offset}: {page_time*1000:.2f}ms")
            
            # Performance assertion - pagination should remain fast
            self.assertLess(page_time, 0.5, f"Pagination at offset {offset} should be under 500ms")


class CachePerformanceTest(TestCase):
    """Test caching performance optimizations"""
    
    def setUp(self):
        self.brand = Brand.objects.create(name="Cache Perf Brand")
        self.store = Store.objects.create(
            brand=self.brand, name="Cache Store", code="CS001",
            address="123 Cache St", city="Cache City", state="CS", zip_code="12345"
        )
        # Clear cache before tests
        cache.clear()

    @override_settings(CACHES={
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
            'LOCATION': 'unique-cache-test'
        }
    })
    def test_cache_hit_performance(self):
        """Test performance difference between cache hits and misses"""
        cache_key = "test_expensive_operation"
        
        def expensive_operation():
            # Simulate expensive database operation
            return list(Upload.objects.filter(store=self.store).values())
        
        # Test cache miss (first call)
        start_time = time.time()
        result = cache.get_or_set(cache_key, expensive_operation, timeout=300)
        cache_miss_time = time.time() - start_time
        
        # Test cache hit (subsequent calls)
        start_time = time.time()
        cached_result = cache.get(cache_key)
        cache_hit_time = time.time() - start_time
        
        print(f"Cache miss time: {cache_miss_time*1000:.2f}ms")
        print(f"Cache hit time: {cache_hit_time*1000:.2f}ms")
        print(f"Performance improvement: {cache_miss_time/cache_hit_time:.1f}x faster")
        
        # Assert cache is working and faster
        self.assertIsNotNone(cached_result)
        self.assertEqual(result, cached_result)
        self.assertLess(cache_hit_time, cache_miss_time, "Cache hit should be faster than miss")

    def test_cache_invalidation_performance(self):
        """Test performance of cache invalidation patterns"""
        # Set up cached data
        cache_keys = [f"test_key_{i}" for i in range(100)]
        
        start_time = time.time()
        for key in cache_keys:
            cache.set(key, f"cached_value_{key}", timeout=300)
        set_time = time.time() - start_time
        
        start_time = time.time()
        cache.delete_many(cache_keys)
        delete_time = time.time() - start_time
        
        print(f"Set {len(cache_keys)} cache entries in {set_time*1000:.2f}ms")
        print(f"Deleted {len(cache_keys)} cache entries in {delete_time*1000:.2f}ms")
        
        # Performance assertions
        self.assertLess(set_time, 1.0, "Cache set operations should be fast")
        self.assertLess(delete_time, 1.0, "Cache delete operations should be fast")


class APIEndpointPerformanceTest(TestCase):
    """Test performance of API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.brand = Brand.objects.create(name="API Perf Brand")
        self.store = Store.objects.create(
            brand=self.brand, name="API Store", code="AS001",
            address="123 API St", city="API City", state="AS", zip_code="12345"
        )
        self.user = User.objects.create_user(
            username="apiuser", role=User.Role.INSPECTOR, store=self.store
        )
        self.client.force_authenticate(user=self.user)

    def test_list_endpoint_performance(self):
        """Test performance of list endpoints with various data sizes"""
        # Create test data of different sizes
        data_sizes = [10, 50, 100, 200]
        
        for size in data_sizes:
            # Clear existing data
            Upload.objects.all().delete()
            
            # Create test uploads
            uploads = []
            for i in range(size):
                uploads.append(Upload(
                    store=self.store, mode=Upload.Mode.INSPECTION,
                    s3_key=f"uploads/api_test_{i}.mp4", 
                    original_filename=f"api_test_{i}.mp4",
                    status=Upload.Status.COMPLETE, created_by=self.user
                ))
            
            Upload.objects.bulk_create(uploads)
            
            # Test API endpoint performance
            start_time = time.time()
            response = self.client.get('/api/uploads/')
            end_time = time.time()
            
            response_time = end_time - start_time
            
            print(f"List API with {size} records: {response_time*1000:.2f}ms")
            
            # Performance assertion - should scale reasonably
            expected_max_time = 0.5 + (size / 1000)  # Allow more time for larger datasets
            self.assertLess(response_time, expected_max_time, 
                          f"List endpoint should handle {size} records efficiently")

    def test_concurrent_api_requests(self):
        """Test API performance under concurrent load"""
        # Create test data
        uploads = []
        for i in range(50):
            uploads.append(Upload(
                store=self.store, mode=Upload.Mode.INSPECTION,
                s3_key=f"uploads/concurrent_test_{i}.mp4",
                original_filename=f"concurrent_test_{i}.mp4", 
                status=Upload.Status.COMPLETE, created_by=self.user
            ))
        
        Upload.objects.bulk_create(uploads)
        
        def make_api_request():
            start_time = time.time()
            response = self.client.get('/api/uploads/')
            end_time = time.time()
            
            return {
                'status_code': response.status_code,
                'response_time': end_time - start_time,
                'record_count': len(response.data.get('results', []))
                if hasattr(response, 'data') else 0
            }
        
        # Test concurrent requests
        num_concurrent = 5
        with ThreadPoolExecutor(max_workers=num_concurrent) as executor:
            futures = [executor.submit(make_api_request) for _ in range(num_concurrent)]
            results = [future.result() for future in as_completed(futures)]
        
        # Analyze results
        successful_requests = [r for r in results if r['status_code'] == 200]
        response_times = [r['response_time'] for r in successful_requests]
        
        if response_times:
            avg_time = statistics.mean(response_times)
            max_time = max(response_times)
            
            print(f"Concurrent API requests - Avg: {avg_time*1000:.2f}ms, Max: {max_time*1000:.2f}ms")
            
            # Performance assertions
            self.assertEqual(len(successful_requests), num_concurrent, "All requests should succeed")
            self.assertLess(avg_time, 2.0, "Average response time should be reasonable under load")
            self.assertLess(max_time, 5.0, "Max response time should be acceptable")
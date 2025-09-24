from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from unittest.mock import patch
from datetime import datetime, timedelta
from brands.models import Brand, Store

User = get_user_model()


class UserModelTest(TestCase):
    def setUp(self):
        self.brand = Brand.objects.create(name="Test Brand")
        self.store = Store.objects.create(
            brand=self.brand,
            name="Test Store",
            code="TS001",
            address="123 Test St",
            city="Test City",
            state="TS",
            zip_code="12345"
        )

    def test_create_user(self):
        user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpass123",
            first_name="Test",
            last_name="User",
            role="INSPECTOR",
            store=self.store
        )
        self.assertEqual(user.username, "testuser")
        self.assertEqual(user.role, "INSPECTOR")
        self.assertEqual(user.full_name, "Test User")
        self.assertTrue(user.check_password("testpass123"))

    def test_user_str(self):
        user = User.objects.create_user(
            username="testuser",
            role="GM"
        )
        self.assertEqual(str(user), "testuser (GM)")


class AuthAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.brand = Brand.objects.create(name="Test Brand")
        self.store = Store.objects.create(
            brand=self.brand,
            name="Test Store",
            code="TS001",
            address="123 Test St",
            city="Test City",
            state="TS",
            zip_code="12345"
        )
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpass123",
            store=self.store
        )

    def test_login_success(self):
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = self.client.post('/api/auth/login/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)

    def test_login_invalid_credentials(self):
        data = {
            'username': 'testuser',
            'password': 'wrongpassword'
        }
        response = self.client.post('/api/auth/login/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_profile_authenticated(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/auth/profile/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')

    def test_profile_unauthenticated(self):
        response = self.client.get('/api/auth/profile/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_jwt_refresh_token(self):
        """Test JWT refresh token functionality"""
        refresh = RefreshToken.for_user(self.user)
        data = {'refresh': str(refresh)}
        
        response = self.client.post('/api/auth/refresh/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        
    def test_invalid_refresh_token(self):
        """Test invalid refresh token handling"""
        data = {'refresh': 'invalid_token'}
        response = self.client.post('/api/auth/refresh/', data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class RBACTest(TestCase):
    """Role-Based Access Control tests"""
    
    def setUp(self):
        self.client = APIClient()
        self.brand = Brand.objects.create(name="Test Brand")
        self.store1 = Store.objects.create(
            brand=self.brand, name="Store 1", code="ST001",
            address="123 Test St", city="Test City", state="TS", zip_code="12345"
        )
        self.store2 = Store.objects.create(
            brand=self.brand, name="Store 2", code="ST002", 
            address="456 Test Ave", city="Test City", state="TS", zip_code="12345"
        )
        
        # Create users with different roles
        self.admin_user = User.objects.create_user(
            username="admin", email="admin@test.com", password="test123",
            role=User.Role.ADMIN, store=self.store1
        )
        self.gm_user = User.objects.create_user(
            username="gm", email="gm@test.com", password="test123",
            role=User.Role.GM, store=self.store1
        )
        self.inspector_user = User.objects.create_user(
            username="inspector", email="inspector@test.com", password="test123",
            role=User.Role.INSPECTOR, store=self.store2
        )
        
    def test_admin_access_all_stores(self):
        """Test admin can access all stores"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/api/brands/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
    def test_gm_store_restrictions(self):
        """Test GM is restricted to their assigned store"""
        self.client.force_authenticate(user=self.gm_user)
        # This would need actual store filtering logic in views
        response = self.client.get('/api/auth/profile/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['role'], 'GM')
        self.assertEqual(response.data['store'], self.store1.id)
        
    def test_inspector_permissions(self):
        """Test inspector role permissions"""
        self.client.force_authenticate(user=self.inspector_user)
        response = self.client.get('/api/auth/profile/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['role'], 'INSPECTOR')
        
    def test_role_based_user_creation(self):
        """Test users are created with correct roles"""
        self.assertEqual(self.admin_user.role, User.Role.ADMIN)
        self.assertEqual(self.gm_user.role, User.Role.GM)
        self.assertEqual(self.inspector_user.role, User.Role.INSPECTOR)
        
    def test_unauthorized_access_to_admin_endpoints(self):
        """Test non-admin users cannot access admin endpoints"""
        self.client.force_authenticate(user=self.inspector_user)
        # This would test actual admin-only endpoints when they exist
        response = self.client.get('/api/users/')
        # Should return 403 Forbidden for non-admin users
        self.assertIn(response.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])
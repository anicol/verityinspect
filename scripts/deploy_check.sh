#!/bin/bash

# VerityInspect Deployment Health Check Script
# Run this after deployment to verify all services are working

echo "🚀 VerityInspect Deployment Health Check"
echo "========================================"

# Set base URLs (update these with your actual Render URLs)
API_URL="https://verityinspect-api.onrender.com"
WEB_URL="https://verityinspect-web.onrender.com"
MARKETING_URL="https://verityinspect-marketing.onrender.com"

echo ""
echo "1. Checking API Health..."
curl -s "$API_URL/health/" | jq '.' || echo "❌ API health check failed"

echo ""
echo "2. Checking Database Connection..."
curl -s "$API_URL/health/db/" | jq '.' || echo "❌ Database health check failed"

echo ""
echo "3. Checking Redis Connection..."
curl -s "$API_URL/health/redis/" | jq '.' || echo "❌ Redis health check failed"

echo ""
echo "4. Checking API Documentation..."
curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/docs/" | grep -q "200" && echo "✅ API docs accessible" || echo "❌ API docs not accessible"

echo ""
echo "5. Checking Web App..."
curl -s -o /dev/null -w "%{http_code}" "$WEB_URL/" | grep -q "200" && echo "✅ Web app accessible" || echo "❌ Web app not accessible"

echo ""
echo "6. Checking Marketing Site..."
curl -s -o /dev/null -w "%{http_code}" "$MARKETING_URL/" | grep -q "200" && echo "✅ Marketing site accessible" || echo "❌ Marketing site not accessible"

echo ""
echo "7. Testing Authentication..."
AUTH_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login/" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"demo123"}')

if echo "$AUTH_RESPONSE" | jq -e '.access' > /dev/null 2>&1; then
  echo "✅ Authentication working"
  TOKEN=$(echo "$AUTH_RESPONSE" | jq -r '.access')
  
  echo ""
  echo "8. Testing Authenticated Endpoint..."
  curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/api/brands/" | jq '.' > /dev/null && echo "✅ Authenticated API working" || echo "❌ Authenticated API failed"
else
  echo "❌ Authentication failed"
fi

echo ""
echo "========================================"
echo "Health check complete!"
echo ""
echo "Service URLs:"
echo "• API: $API_URL"
echo "• Web: $WEB_URL"
echo "• Marketing: $MARKETING_URL"
echo "• Docs: $API_URL/api/docs/"
echo ""
echo "Demo Credentials:"
echo "• Username: admin"
echo "• Password: demo123"
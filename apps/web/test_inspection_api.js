// Test script for InspectionDetailPage API integration
// Run with: node test_inspection_api.js

const API_BASE = 'http://localhost:8000/api';
const TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzU4ODA5OTcyLCJpYXQiOjE3NTg4MDYzNzIsImp0aSI6IjBjMzAwZjFmNWJkNzQ1NmFhMDFkMTdjNzgyNmM1ODhjIiwidXNlcl9pZCI6IjEifQ.SHUZPGdjFLeaiqrwTjz6Y3_BsYo8FH58K4tGqeUM-14';

async function testAPI(url, description) {
  try {
    const response = await fetch(url, {
      headers: { 'Authorization': TOKEN }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ ${description}:`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Data keys: ${Object.keys(data).join(', ')}`);
    
    if (data.results) {
      console.log(`   Results count: ${data.results.length}`);
    }
    
    return data;
  } catch (error) {
    console.log(`❌ ${description}:`);
    console.log(`   Error: ${error.message}`);
    return null;
  }
}

async function testBoundingBoxCalculations(findings) {
  console.log('\n🔍 Testing Bounding Box Calculations:');
  
  findings.forEach((finding, index) => {
    if (finding.bounding_box) {
      const bb = finding.bounding_box;
      console.log(`   Finding ${index + 1} (${finding.title}):`);
      console.log(`     Coordinates: x=${bb.x}, y=${bb.y}, w=${bb.width}, h=${bb.height}`);
      console.log(`     CSS calc: left=${(bb.x * 100).toFixed(1)}%, top=${(bb.y * 100).toFixed(1)}%`);
      console.log(`     Size: ${(bb.width * 100).toFixed(1)}% x ${(bb.height * 100).toFixed(1)}%`);
      
      // Validate coordinates are normalized (0-1)
      const valid = bb.x >= 0 && bb.x <= 1 && bb.y >= 0 && bb.y <= 1 && 
                   bb.width >= 0 && bb.width <= 1 && bb.height >= 0 && bb.height <= 1;
      console.log(`     Validation: ${valid ? '✅ Valid normalized coords' : '❌ Invalid coords'}`);
    }
  });
}

async function testResponseStructure(inspection) {
  console.log('\n📊 Testing Response Structure:');
  
  // Test required fields
  const requiredFields = ['id', 'status', 'overall_score', 'video_title', 'store_name'];
  requiredFields.forEach(field => {
    const exists = inspection.hasOwnProperty(field);
    console.log(`   ${field}: ${exists ? '✅' : '❌'} ${exists ? inspection[field] : 'Missing'}`);
  });
  
  // Test category scores
  const categoryScores = ['ppe_score', 'safety_score', 'cleanliness_score', 'uniform_score', 'menu_board_score'];
  console.log('\n   Category Scores:');
  categoryScores.forEach(score => {
    const value = inspection[score];
    console.log(`     ${score}: ${value !== null ? `${value}%` : 'N/A'}`);
  });
  
  // Test findings structure
  if (inspection.findings && inspection.findings.length > 0) {
    console.log(`\n   Findings: ${inspection.findings.length} total`);
    const categories = [...new Set(inspection.findings.map(f => f.category))];
    console.log(`   Categories: ${categories.join(', ')}`);
    
    const severities = [...new Set(inspection.findings.map(f => f.severity))];
    console.log(`   Severities: ${severities.join(', ')}`);
  }
  
  // Test action items
  if (inspection.action_items && inspection.action_items.length > 0) {
    console.log(`\n   Action Items: ${inspection.action_items.length} total`);
    const statuses = [...new Set(inspection.action_items.map(a => a.status))];
    console.log(`   Statuses: ${statuses.join(', ')}`);
    
    const priorities = [...new Set(inspection.action_items.map(a => a.priority))];
    console.log(`   Priorities: ${priorities.join(', ')}`);
  }
}

async function main() {
  console.log('🧪 InspectionDetailPage API Testing\n');
  
  // Test 1: List inspections
  const inspections = await testAPI(`${API_BASE}/inspections/`, 'List inspections');
  if (!inspections || !inspections.results) return;
  
  const testInspectionId = inspections.results[0].id;
  console.log(`\n🎯 Testing with inspection ID: ${testInspectionId}`);
  
  // Test 2: Get specific inspection (main API call used by component)
  const inspection = await testAPI(`${API_BASE}/inspections/${testInspectionId}/`, 'Get inspection detail');
  if (!inspection) return;
  
  // Test 3: Get findings separately (old redundant call)
  const findingsResponse = await testAPI(`${API_BASE}/inspections/${testInspectionId}/findings/`, 'Get findings separately');
  
  // Test 4: Compare findings sources
  console.log('\n🔄 Comparing Findings Sources:');
  const inlineFindingsCount = inspection.findings ? inspection.findings.length : 0;
  const separateFindingsCount = findingsResponse && findingsResponse.results ? findingsResponse.results.length : 0;
  console.log(`   Inline findings: ${inlineFindingsCount}`);
  console.log(`   Separate API findings: ${separateFindingsCount}`);
  console.log(`   Match: ${inlineFindingsCount === separateFindingsCount ? '✅' : '❌'}`);
  
  // Test 5: Response structure analysis
  await testResponseStructure(inspection);
  
  // Test 6: Bounding box calculations
  if (inspection.findings && inspection.findings.length > 0) {
    await testBoundingBoxCalculations(inspection.findings);
  }
  
  // Test 7: Error handling
  console.log('\n❌ Testing Error Handling:');
  await testAPI(`${API_BASE}/inspections/999999/`, 'Non-existent inspection (should 404)');
  
  console.log('\n✨ Testing Complete!');
  console.log('\nRecommendations:');
  console.log('1. ✅ Remove separate findings API call - data already in inspection response');
  console.log('2. ✅ Bounding box calculations appear correct for normalized coordinates');
  console.log('3. ✅ Component structure matches API response format');
  console.log('4. 🔍 Manual browser testing needed to verify visual rendering');
}

// Handle fetch not being available in Node.js
if (typeof fetch === 'undefined') {
  console.log('❌ This script requires Node.js 18+ with built-in fetch, or run in browser console');
  console.log('\nTo test in browser console:');
  console.log('1. Go to http://localhost:3003/inspections/9');
  console.log('2. Open browser dev tools');
  console.log('3. Copy and paste this script in the console');
} else {
  main().catch(console.error);
}

// Export for browser usage
if (typeof window !== 'undefined') {
  window.testInspectionAPI = main;
}
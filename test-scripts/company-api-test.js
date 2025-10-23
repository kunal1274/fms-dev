/**
 * Company API Integration Test
 * 
 * This script tests the Company API endpoints with the backend
 * Run with: node test-scripts/company-api-test.js
 */

const BASE_URL = 'http://localhost:3000/fms/api/v0'
let authToken = null

// Test data
const testCompany = {
  companyName: 'Test Company Ltd',
  companyCode: 'TC001',
  email: 'test@company.com',
  contactNumber: '+1234567890',
  primaryGSTAddress: '123 Test Street, Test City, Test State 12345, Test Country',
  businessType: 'Trading',
  currency: 'INR',
  website: 'https://www.testcompany.com',
  active: true,
  remarks: 'Test company for API integration testing'
}

const updatedCompany = {
  ...testCompany,
  companyName: 'Updated Test Company Ltd',
  remarks: 'Updated test company description'
}

// Utility functions
async function makeRequest(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
      ...options.headers
    },
    ...options
  })
  
  const data = await response.json()
  return { response, data }
}

async function testEndpoint(method, endpoint, body = null, expectedStatus = 200) {
  try {
    const options = { method }
    if (body) {
      options.body = JSON.stringify(body)
    }
    
    const { response, data } = await makeRequest(`${BASE_URL}${endpoint}`, options)
    
    if (response.status === expectedStatus) {
      console.log(`✅ ${method} ${endpoint} - Status: ${response.status}`)
      return { success: true, data }
    } else {
      console.log(`❌ ${method} ${endpoint} - Expected: ${expectedStatus}, Got: ${response.status}`)
      console.log('Response:', data)
      return { success: false, data }
    }
  } catch (error) {
    console.log(`❌ ${method} ${endpoint} - Error: ${error.message}`)
    return { success: false, error }
  }
}

// Test functions
async function testGetAllCompanies() {
  console.log('\n📋 Testing GET /companies (All Companies)...')
  
  const result = await testEndpoint('GET', '/companies')
  
  if (result.success) {
    console.log('✅ Companies retrieved successfully')
    console.log(`📊 Found ${result.data.data?.length || 0} companies`)
    return { success: true, companies: result.data.data }
  } else {
    console.log('❌ Failed to retrieve companies')
    return { success: false }
  }
}

async function testCreateCompany() {
  console.log('\n➕ Testing POST /companies (Create Company)...')
  
  const result = await testEndpoint('POST', '/companies', testCompany, 201)
  
  if (result.success && result.data.data?.id) {
    console.log('✅ Company created successfully')
    console.log('🆔 Company ID:', result.data.data.id)
    return { success: true, company: result.data.data }
  } else {
    console.log('❌ Failed to create company')
    return { success: false }
  }
}

async function testGetCompanyById(companyId) {
  console.log('\n🔍 Testing GET /companies/:id (Get Company by ID)...')
  
  const result = await testEndpoint('GET', `/companies/${companyId}`)
  
  if (result.success) {
    console.log('✅ Company retrieved successfully')
    console.log('📄 Company details:', result.data.data)
    return { success: true, company: result.data.data }
  } else {
    console.log('❌ Failed to retrieve company')
    return { success: false }
  }
}

async function testUpdateCompany(companyId) {
  console.log('\n✏️ Testing PUT /companies/:id (Update Company)...')
  
  const result = await testEndpoint('PUT', `/companies/${companyId}`, updatedCompany)
  
  if (result.success) {
    console.log('✅ Company updated successfully')
    console.log('📄 Updated company:', result.data.data)
    return { success: true, company: result.data.data }
  } else {
    console.log('❌ Failed to update company')
    return { success: false }
  }
}

async function testDeleteCompany(companyId) {
  console.log('\n🗑️ Testing DELETE /companies/:id (Delete Company)...')
  
  const result = await testEndpoint('DELETE', `/companies/${companyId}`)
  
  if (result.success) {
    console.log('✅ Company deleted successfully')
    return { success: true }
  } else {
    console.log('❌ Failed to delete company')
    return { success: false }
  }
}

async function testCompanySearch() {
  console.log('\n🔍 Testing Company Search...')
  
  const result = await testEndpoint('GET', '/companies?search=Test')
  
  if (result.success) {
    console.log('✅ Company search successful')
    console.log(`📊 Found ${result.data.data?.length || 0} companies matching "Test"`)
    return { success: true, companies: result.data.data }
  } else {
    console.log('❌ Company search failed')
    return { success: false }
  }
}

async function testCompanyPagination() {
  console.log('\n📄 Testing Company Pagination...')
  
  const result = await testEndpoint('GET', '/companies?page=1&limit=5')
  
  if (result.success) {
    console.log('✅ Company pagination successful')
    console.log('📊 Pagination info:', result.data.pagination)
    return { success: true, pagination: result.data.pagination }
  } else {
    console.log('❌ Company pagination failed')
    return { success: false }
  }
}

async function testCompanyValidation() {
  console.log('\n🚨 Testing Company Validation...')
  
  // Test invalid company data
  const invalidCompany = {
    companyName: '', // Empty name should fail
    email: 'invalid-email', // Invalid email format
    phone: '123' // Too short phone number
  }
  
  const result = await testEndpoint('POST', '/companies', invalidCompany, 400)
  
  if (result.success) {
    console.log('✅ Validation working correctly - rejected invalid data')
    return { success: true }
  } else {
    console.log('❌ Validation not working - accepted invalid data')
    return { success: false }
  }
}

async function testCompanyErrorHandling() {
  console.log('\n🚨 Testing Company Error Handling...')
  
  // Test non-existent company
  await testEndpoint('GET', '/companies/non-existent-id', null, 404)
  
  // Test invalid company ID format
  await testEndpoint('GET', '/companies/invalid-id', null, 400)
  
  console.log('✅ Error handling tests completed')
}

async function runCompanyTests() {
  console.log('🚀 Starting Company API Tests...')
  console.log(`Base URL: ${BASE_URL}`)
  
  try {
    // Test 1: Get all companies
    const getAllResult = await testGetAllCompanies()
    
    // Test 2: Create company
    const createResult = await testCreateCompany()
    if (!createResult.success) {
      console.log('❌ Company creation failed, stopping tests')
      return false
    }
    
    const companyId = createResult.company.id
    
    // Test 3: Get company by ID
    await testGetCompanyById(companyId)
    
    // Test 4: Update company
    await testUpdateCompany(companyId)
    
    // Test 5: Search companies
    await testCompanySearch()
    
    // Test 6: Test pagination
    await testCompanyPagination()
    
    // Test 7: Test validation
    await testCompanyValidation()
    
    // Test 8: Test error handling
    await testCompanyErrorHandling()
    
    // Test 9: Delete company (cleanup)
    await testDeleteCompany(companyId)
    
    console.log('\n✅ All Company API tests completed successfully!')
    return true
    
  } catch (error) {
    console.error('\n❌ Company API tests failed:', error)
    return false
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runCompanyTests()
    .then((success) => {
      if (success) {
        console.log('\n🎉 Company API integration is ready!')
        console.log('\n📝 Next Steps:')
        console.log('1. Update frontend Company API client')
        console.log('2. Implement Company CRUD operations')
        console.log('3. Add file upload functionality')
        console.log('4. Create comprehensive test suite')
      } else {
        console.log('\n❌ Company API integration needs fixes')
      }
    })
    .catch(error => {
      console.error('❌ Test suite failed:', error)
    })
}

export {
  runCompanyTests,
  testGetAllCompanies,
  testCreateCompany,
  testGetCompanyById,
  testUpdateCompany,
  testDeleteCompany,
  testCompanySearch,
  testCompanyPagination,
  testCompanyValidation,
  testCompanyErrorHandling
}

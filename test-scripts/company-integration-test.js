/**
 * Company Integration Test - Frontend to Backend
 * 
 * This script tests the complete Company module integration
 * Run with: node test-scripts/company-integration-test.js
 */

const BASE_URL = 'http://localhost:3000/fms/api/v0'

// Test data matching backend requirements
const testCompany = {
  companyName: 'Integration Test Company Ltd',
  companyCode: 'ITC001',
  email: 'integration@testcompany.com',
  contactNumber: '+1234567890',
  primaryGSTAddress: '123 Integration Street, Test City, Test State 12345, Test Country',
  businessType: 'Trading',
  currency: 'INR',
  website: 'https://www.integrationtestcompany.com',
  active: true,
  remarks: 'Company created for integration testing'
}

const updatedCompany = {
  ...testCompany,
  companyName: 'Updated Integration Test Company Ltd',
  remarks: 'Updated company for integration testing'
}

// Utility functions
async function makeRequest(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
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
async function testCompanyCRUD() {
  console.log('\n🏢 Testing Company CRUD Operations...')
  
  // Test 1: Create Company
  console.log('\n➕ Creating Company...')
  const createResult = await testEndpoint('POST', '/companies', testCompany, 201)
  
  if (!createResult.success) {
    console.log('❌ Company creation failed')
    return { success: false }
  }
  
  const companyId = createResult.data.data.id
  console.log('✅ Company created with ID:', companyId)
  
  // Test 2: Get Company by ID
  console.log('\n🔍 Getting Company by ID...')
  const getResult = await testEndpoint('GET', `/companies/${companyId}`)
  
  if (!getResult.success) {
    console.log('❌ Failed to get company')
    return { success: false }
  }
  
  console.log('✅ Company retrieved successfully')
  
  // Test 3: Update Company
  console.log('\n✏️ Updating Company...')
  const updateResult = await testEndpoint('PUT', `/companies/${companyId}`, updatedCompany)
  
  if (!updateResult.success) {
    console.log('❌ Failed to update company')
    return { success: false }
  }
  
  console.log('✅ Company updated successfully')
  
  // Test 4: Get All Companies
  console.log('\n📋 Getting All Companies...')
  const getAllResult = await testEndpoint('GET', '/companies')
  
  if (!getAllResult.success) {
    console.log('❌ Failed to get all companies')
    return { success: false }
  }
  
  console.log(`✅ Retrieved ${getAllResult.data.data.length} companies`)
  
  // Test 5: Search Companies
  console.log('\n🔍 Searching Companies...')
  const searchResult = await testEndpoint('GET', '/companies?search=Integration')
  
  if (!searchResult.success) {
    console.log('❌ Company search failed')
    return { success: false }
  }
  
  console.log(`✅ Found ${searchResult.data.data.length} companies matching "Integration"`)
  
  // Test 6: Delete Company
  console.log('\n🗑️ Deleting Company...')
  const deleteResult = await testEndpoint('DELETE', `/companies/${companyId}`)
  
  if (!deleteResult.success) {
    console.log('❌ Failed to delete company')
    return { success: false }
  }
  
  console.log('✅ Company deleted successfully')
  
  return { success: true }
}

async function testCompanyValidation() {
  console.log('\n🚨 Testing Company Validation...')
  
  // Test invalid company data
  const invalidCompany = {
    companyName: '', // Empty name should fail
    email: 'invalid-email', // Invalid email format
    contactNumber: '123' // Too short phone number
  }
  
  const result = await testEndpoint('POST', '/companies', invalidCompany, 422)
  
  if (result.success) {
    console.log('✅ Validation working correctly - rejected invalid data')
    return { success: true }
  } else {
    console.log('❌ Validation not working - accepted invalid data')
    return { success: false }
  }
}

async function testCompanyPagination() {
  console.log('\n📄 Testing Company Pagination...')
  
  const result = await testEndpoint('GET', '/companies?page=1&limit=5')
  
  if (result.success) {
    console.log('✅ Company pagination successful')
    console.log('📊 Companies retrieved:', result.data.data.length)
    return { success: true }
  } else {
    console.log('❌ Company pagination failed')
    return { success: false }
  }
}

async function testCompanyErrorHandling() {
  console.log('\n🚨 Testing Company Error Handling...')
  
  // Test non-existent company
  await testEndpoint('GET', '/companies/non-existent-id', null, 500)
  
  // Test invalid company ID format
  await testEndpoint('GET', '/companies/invalid-id', null, 500)
  
  console.log('✅ Error handling tests completed')
}

async function runCompanyIntegrationTests() {
  console.log('🚀 Starting Company Integration Tests...')
  console.log(`Base URL: ${BASE_URL}`)
  
  try {
    // Test 1: CRUD Operations
    const crudResult = await testCompanyCRUD()
    if (!crudResult.success) {
      console.log('❌ CRUD operations failed')
      return false
    }
    
    // Test 2: Validation
    const validationResult = await testCompanyValidation()
    if (!validationResult.success) {
      console.log('❌ Validation tests failed')
      return false
    }
    
    // Test 3: Pagination
    const paginationResult = await testCompanyPagination()
    if (!paginationResult.success) {
      console.log('❌ Pagination tests failed')
      return false
    }
    
    // Test 4: Error Handling
    await testCompanyErrorHandling()
    
    console.log('\n✅ All Company integration tests completed successfully!')
    return true
    
  } catch (error) {
    console.error('\n❌ Company integration tests failed:', error)
    return false
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runCompanyIntegrationTests()
    .then((success) => {
      if (success) {
        console.log('\n🎉 Company integration is ready!')
        console.log('\n📝 Next Steps:')
        console.log('1. Update frontend Company components')
        console.log('2. Implement Company forms and validation')
        console.log('3. Add file upload functionality')
        console.log('4. Create comprehensive UI tests')
        console.log('5. Implement Company management features')
      } else {
        console.log('\n❌ Company integration needs fixes')
      }
    })
    .catch(error => {
      console.error('❌ Test suite failed:', error)
    })
}

export {
  runCompanyIntegrationTests,
  testCompanyCRUD,
  testCompanyValidation,
  testCompanyPagination,
  testCompanyErrorHandling
}

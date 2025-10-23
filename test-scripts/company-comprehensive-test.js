/**
 * Company Comprehensive Test Suite
 * 
 * This script provides comprehensive testing for the Company module
 * including performance, edge cases, and advanced scenarios
 * Run with: node test-scripts/company-comprehensive-test.js
 */

const BASE_URL = 'http://localhost:3000/fms/api/v0'

// Test data for comprehensive testing
const testCompanies = [
  {
    companyName: 'Alpha Technologies Ltd',
    companyCode: 'ALPHA001',
    email: 'alpha@tech.com',
    contactNumber: '+1234567890',
    primaryGSTAddress: '123 Alpha Street, Tech City, TC 12345, Tech Country',
    businessType: 'Technology',
    currency: 'USD',
    website: 'https://www.alpha-tech.com',
    active: true,
    remarks: 'Leading technology company'
  },
  {
    companyName: 'Beta Manufacturing Inc',
    companyCode: 'BETA002',
    email: 'beta@manufacturing.com',
    contactNumber: '+1987654321',
    primaryGSTAddress: '456 Beta Avenue, Manufacturing City, MC 54321, Manufacturing Country',
    businessType: 'Manufacturing',
    currency: 'EUR',
    website: 'https://www.beta-manufacturing.com',
    active: true,
    remarks: 'Industrial manufacturing company'
  },
  {
    companyName: 'Gamma Services Corp',
    companyCode: 'GAMMA003',
    email: 'gamma@services.com',
    contactNumber: '+1555666777',
    primaryGSTAddress: '789 Gamma Road, Services City, SC 98765, Services Country',
    businessType: 'Services',
    currency: 'GBP',
    website: 'https://www.gamma-services.com',
    active: false,
    remarks: 'Professional services company'
  }
]

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

// Performance testing
async function testPerformance() {
  console.log('\n⚡ Testing Performance...')
  
  const startTime = Date.now()
  
  // Test bulk creation
  const createPromises = testCompanies.map(company => 
    testEndpoint('POST', '/companies', company, 201)
  )
  
  const createResults = await Promise.all(createPromises)
  const createTime = Date.now() - startTime
  
  console.log(`✅ Created ${createResults.length} companies in ${createTime}ms`)
  
  // Test bulk retrieval
  const getStartTime = Date.now()
  const getResult = await testEndpoint('GET', '/companies')
  const getTime = Date.now() - getStartTime
  
  console.log(`✅ Retrieved companies in ${getTime}ms`)
  
  return {
    createTime,
    getTime,
    success: createResults.every(result => result.success) && getResult.success
  }
}

// Edge case testing
async function testEdgeCases() {
  console.log('\n🔍 Testing Edge Cases...')
  
  const edgeCases = [
    {
      name: 'Empty company name',
      data: { companyName: '', companyCode: 'TEST', email: 'test@test.com', primaryGSTAddress: 'Test Address' },
      expectedStatus: 422
    },
    {
      name: 'Invalid email format',
      data: { companyName: 'Test Company', companyCode: 'TEST', email: 'invalid-email', primaryGSTAddress: 'Test Address' },
      expectedStatus: 422
    },
    {
      name: 'Very long company name',
      data: { 
        companyName: 'A'.repeat(1000), 
        companyCode: 'TEST', 
        email: 'test@test.com', 
        primaryGSTAddress: 'Test Address' 
      },
      expectedStatus: 422
    },
    {
      name: 'Special characters in company code',
      data: { 
        companyName: 'Test Company', 
        companyCode: 'TEST@#$%', 
        email: 'test@test.com', 
        primaryGSTAddress: 'Test Address' 
      },
      expectedStatus: 201
    }
  ]
  
  const results = []
  
  for (const testCase of edgeCases) {
    console.log(`\n🧪 Testing: ${testCase.name}`)
    const result = await testEndpoint('POST', '/companies', testCase.data, testCase.expectedStatus)
    results.push({
      name: testCase.name,
      success: result.success,
      expectedStatus: testCase.expectedStatus,
      actualStatus: result.data?.status || 'unknown'
    })
  }
  
  return results
}

// Search functionality testing
async function testSearchFunctionality() {
  console.log('\n🔍 Testing Search Functionality...')
  
  const searchTests = [
    { query: 'Alpha', expectedResults: 1 },
    { query: 'Technology', expectedResults: 1 },
    { query: 'Manufacturing', expectedResults: 1 },
    { query: 'Services', expectedResults: 1 },
    { query: 'NonExistent', expectedResults: 0 }
  ]
  
  const results = []
  
  for (const test of searchTests) {
    console.log(`\n🔍 Searching for: "${test.query}"`)
    const result = await testEndpoint('GET', `/companies?search=${test.query}`)
    
    if (result.success) {
      const actualResults = result.data.data.length
      const success = actualResults >= test.expectedResults
      console.log(`✅ Found ${actualResults} results (expected: ${test.expectedResults})`)
      results.push({ query: test.query, success, actualResults, expectedResults: test.expectedResults })
    } else {
      results.push({ query: test.query, success: false })
    }
  }
  
  return results
}

// Pagination testing
async function testPagination() {
  console.log('\n📄 Testing Pagination...')
  
  const paginationTests = [
    { page: 1, limit: 2 },
    { page: 2, limit: 2 },
    { page: 1, limit: 5 },
    { page: 1, limit: 10 }
  ]
  
  const results = []
  
  for (const test of paginationTests) {
    console.log(`\n📄 Testing page ${test.page} with limit ${test.limit}`)
    const result = await testEndpoint('GET', `/companies?page=${test.page}&limit=${test.limit}`)
    
    if (result.success) {
      const companies = result.data.data
      const success = companies.length <= test.limit
      console.log(`✅ Retrieved ${companies.length} companies`)
      results.push({ 
        page: test.page, 
        limit: test.limit, 
        success, 
        actualCount: companies.length 
      })
    } else {
      results.push({ page: test.page, limit: test.limit, success: false })
    }
  }
  
  return results
}

// Bulk operations testing
async function testBulkOperations() {
  console.log('\n📦 Testing Bulk Operations...')
  
  // First, create some test companies
  const createdCompanies = []
  
  for (const company of testCompanies) {
    const result = await testEndpoint('POST', '/companies', company, 201)
    if (result.success) {
      createdCompanies.push(result.data.data)
    }
  }
  
  console.log(`✅ Created ${createdCompanies.length} companies for bulk testing`)
  
  // Test bulk delete
  if (createdCompanies.length > 0) {
    const companyIds = createdCompanies.map(company => company.id)
    console.log(`\n🗑️ Testing bulk delete for ${companyIds.length} companies`)
    
    // Note: The backend might not have bulk delete implemented yet
    // This is a placeholder for when it's implemented
    console.log('⚠️ Bulk delete not implemented in backend yet')
  }
  
  return { createdCompanies }
}

// Data integrity testing
async function testDataIntegrity() {
  console.log('\n🔒 Testing Data Integrity...')
  
  const integrityTests = [
    {
      name: 'Company code uniqueness',
      test: async () => {
        const duplicateCompany = {
          ...testCompanies[0],
          companyCode: 'DUPLICATE001'
        }
        
        // Create first company
        const firstResult = await testEndpoint('POST', '/companies', duplicateCompany, 201)
        if (!firstResult.success) return false
        
        // Try to create duplicate
        const secondResult = await testEndpoint('POST', '/companies', duplicateCompany, 422)
        return secondResult.success
      }
    },
    {
      name: 'Email uniqueness',
      test: async () => {
        const duplicateEmail = {
          ...testCompanies[0],
          companyCode: 'UNIQUE001',
          email: 'duplicate@test.com'
        }
        
        // Create first company
        const firstResult = await testEndpoint('POST', '/companies', duplicateEmail, 201)
        if (!firstResult.success) return false
        
        // Try to create duplicate
        const secondResult = await testEndpoint('POST', '/companies', duplicateEmail, 422)
        return secondResult.success
      }
    }
  ]
  
  const results = []
  
  for (const test of integrityTests) {
    console.log(`\n🔒 Testing: ${test.name}`)
    const success = await test.test()
    console.log(`${success ? '✅' : '❌'} ${test.name}: ${success ? 'PASSED' : 'FAILED'}`)
    results.push({ name: test.name, success })
  }
  
  return results
}

// Cleanup function
async function cleanupTestData() {
  console.log('\n🧹 Cleaning up test data...')
  
  // Get all companies
  const getAllResult = await testEndpoint('GET', '/companies')
  if (!getAllResult.success) return
  
  const companies = getAllResult.data.data
  const testCompanies = companies.filter(company => 
    company.companyCode.startsWith('ALPHA') ||
    company.companyCode.startsWith('BETA') ||
    company.companyCode.startsWith('GAMMA') ||
    company.companyCode.startsWith('TEST') ||
    company.companyCode.startsWith('UNIQUE')
  )
  
  console.log(`🗑️ Deleting ${testCompanies.length} test companies`)
  
  for (const company of testCompanies) {
    await testEndpoint('DELETE', `/companies/${company.id}`)
  }
  
  console.log('✅ Cleanup completed')
}

// Main test runner
async function runComprehensiveTests() {
  console.log('🚀 Starting Company Comprehensive Test Suite...')
  console.log(`Base URL: ${BASE_URL}`)
  
  const startTime = Date.now()
  const results = {
    performance: null,
    edgeCases: null,
    search: null,
    pagination: null,
    bulkOperations: null,
    dataIntegrity: null
  }
  
  try {
    // Run all test suites
    console.log('\n📊 Running Performance Tests...')
    results.performance = await testPerformance()
    
    console.log('\n🔍 Running Edge Case Tests...')
    results.edgeCases = await testEdgeCases()
    
    console.log('\n🔍 Running Search Tests...')
    results.search = await testSearchFunctionality()
    
    console.log('\n📄 Running Pagination Tests...')
    results.pagination = await testPagination()
    
    console.log('\n📦 Running Bulk Operations Tests...')
    results.bulkOperations = await testBulkOperations()
    
    console.log('\n🔒 Running Data Integrity Tests...')
    results.dataIntegrity = await testDataIntegrity()
    
    // Cleanup
    await cleanupTestData()
    
    const totalTime = Date.now() - startTime
    
    // Generate report
    console.log('\n📊 COMPREHENSIVE TEST REPORT')
    console.log('=' * 50)
    
    console.log(`\n⏱️ Total Test Time: ${totalTime}ms`)
    console.log(`⚡ Performance: ${results.performance?.success ? 'PASSED' : 'FAILED'}`)
    console.log(`🔍 Edge Cases: ${results.edgeCases?.filter(r => r.success).length}/${results.edgeCases?.length} passed`)
    console.log(`🔍 Search: ${results.search?.filter(r => r.success).length}/${results.search?.length} passed`)
    console.log(`📄 Pagination: ${results.pagination?.filter(r => r.success).length}/${results.pagination?.length} passed`)
    console.log(`🔒 Data Integrity: ${results.dataIntegrity?.filter(r => r.success).length}/${results.dataIntegrity?.length} passed`)
    
    const allTestsPassed = Object.values(results).every(result => 
      result === null || 
      (Array.isArray(result) ? result.every(r => r.success) : result.success)
    )
    
    if (allTestsPassed) {
      console.log('\n🎉 ALL COMPREHENSIVE TESTS PASSED!')
      console.log('\n📝 Next Steps:')
      console.log('1. Company module is production-ready')
      console.log('2. Move to Customer Management integration')
      console.log('3. Implement advanced features')
      console.log('4. Add monitoring and analytics')
    } else {
      console.log('\n❌ Some tests failed - review and fix issues')
    }
    
    return allTestsPassed
    
  } catch (error) {
    console.error('\n❌ Comprehensive test suite failed:', error)
    return false
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runComprehensiveTests()
    .then((success) => {
      if (success) {
        console.log('\n🎉 Company module comprehensive testing completed successfully!')
      } else {
        console.log('\n❌ Company module needs fixes before production')
      }
    })
    .catch(error => {
      console.error('❌ Test suite failed:', error)
    })
}

export {
  runComprehensiveTests,
  testPerformance,
  testEdgeCases,
  testSearchFunctionality,
  testPagination,
  testBulkOperations,
  testDataIntegrity,
  cleanupTestData
}

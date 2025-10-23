/**
 * API Integration Tests
 * 
 * This script tests the integration between frontend and backend APIs
 * Run with: node test-scripts/api-integration-tests.js
 */

const BASE_URL = 'http://localhost:3000/fms/api/v0'
let authToken = null

// Test data
const testCompany = {
  companyName: 'Test Company Ltd',
  companyCode: 'TC001',
  email: 'test@company.com',
  phone: '+1234567890',
  address: {
    street: '123 Test Street',
    city: 'Test City',
    state: 'Test State',
    zipCode: '12345',
    country: 'Test Country'
  },
  isActive: true
}

const testCustomer = {
  customerName: 'Test Customer',
  customerCode: 'CUST001',
  email: 'customer@test.com',
  phone: '+1234567890',
  address: {
    street: '456 Customer Street',
    city: 'Customer City',
    state: 'Customer State',
    zipCode: '54321',
    country: 'Customer Country'
  },
  isActive: true
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
async function testAuthentication() {
  console.log('\n🔐 Testing Authentication...')
  
  // Test login (you'll need to create a test user first)
  const loginResult = await testEndpoint('POST', '/otp-auth/login', {
    email: 'test@example.com',
    password: 'password123'
  })
  
  if (loginResult.success && loginResult.data.data?.token) {
    authToken = loginResult.data.data.token
    console.log('✅ Authentication successful, token received')
    return true
  } else {
    console.log('⚠️ Authentication failed, continuing with public endpoints')
    return false
  }
}

async function testCompanies() {
  console.log('\n🏢 Testing Companies API...')
  
  // Test GET all companies
  await testEndpoint('GET', '/companies')
  
  // Test POST create company
  const createResult = await testEndpoint('POST', '/companies', testCompany, 201)
  
  if (createResult.success && createResult.data.data?.id) {
    const companyId = createResult.data.data.id
    
    // Test GET company by ID
    await testEndpoint('GET', `/companies/${companyId}`)
    
    // Test PUT update company
    const updatedCompany = { ...testCompany, companyName: 'Updated Test Company' }
    await testEndpoint('PUT', `/companies/${companyId}`, updatedCompany)
    
    // Test DELETE company
    await testEndpoint('DELETE', `/companies/${companyId}`)
  }
}

async function testCustomers() {
  console.log('\n👥 Testing Customers API...')
  
  // Test GET all customers
  await testEndpoint('GET', '/customers')
  
  // Test POST create customer
  const createResult = await testEndpoint('POST', '/customers', testCustomer, 201)
  
  if (createResult.success && createResult.data.data?.id) {
    const customerId = createResult.data.data.id
    
    // Test GET customer by ID
    await testEndpoint('GET', `/customers/${customerId}`)
    
    // Test PUT update customer
    const updatedCustomer = { ...testCustomer, customerName: 'Updated Test Customer' }
    await testEndpoint('PUT', `/customers/${customerId}`, updatedCustomer)
    
    // Test DELETE customer
    await testEndpoint('DELETE', `/customers/${customerId}`)
  }
}

async function testItems() {
  console.log('\n📦 Testing Items API...')
  
  // Test GET all items
  await testEndpoint('GET', '/items')
  
  // Test POST create item
  const testItem = {
    itemName: 'Test Item',
    itemCode: 'ITEM001',
    description: 'Test item description',
    category: 'Test Category',
    unitPrice: 100.00,
    isActive: true
  }
  
  const createResult = await testEndpoint('POST', '/items', testItem, 201)
  
  if (createResult.success && createResult.data.data?.id) {
    const itemId = createResult.data.data.id
    
    // Test GET item by ID
    await testEndpoint('GET', `/items/${itemId}`)
    
    // Test PUT update item
    const updatedItem = { ...testItem, itemName: 'Updated Test Item' }
    await testEndpoint('PUT', `/items/${itemId}`, updatedItem)
    
    // Test DELETE item
    await testEndpoint('DELETE', `/items/${itemId}`)
  }
}

async function testSalesOrders() {
  console.log('\n💰 Testing Sales Orders API...')
  
  // Test GET all sales orders
  await testEndpoint('GET', '/salesorders')
  
  // Test POST create sales order
  const testSalesOrder = {
    orderNumber: 'SO001',
    customerId: 'test-customer-id',
    orderDate: new Date().toISOString(),
    items: [{
      itemId: 'test-item-id',
      quantity: 10,
      unitPrice: 100.00
    }],
    totalAmount: 1000.00,
    status: 'draft'
  }
  
  const createResult = await testEndpoint('POST', '/salesorders', testSalesOrder, 201)
  
  if (createResult.success && createResult.data.data?.id) {
    const orderId = createResult.data.data.id
    
    // Test GET sales order by ID
    await testEndpoint('GET', `/salesorders/${orderId}`)
    
    // Test PATCH update status
    await testEndpoint('PATCH', `/salesorders/${orderId}/status`, { status: 'confirmed' })
    
    // Test DELETE sales order
    await testEndpoint('DELETE', `/salesorders/${orderId}`)
  }
}

async function testBanks() {
  console.log('\n🏦 Testing Banks API...')
  
  // Test GET all banks
  await testEndpoint('GET', '/banks')
  
  // Test POST create bank
  const testBank = {
    bankName: 'Test Bank',
    accountNumber: '1234567890',
    accountType: 'checking',
    balance: 10000.00,
    isActive: true
  }
  
  const createResult = await testEndpoint('POST', '/banks', testBank, 201)
  
  if (createResult.success && createResult.data.data?.id) {
    const bankId = createResult.data.data.id
    
    // Test GET bank by ID
    await testEndpoint('GET', `/banks/${bankId}`)
    
    // Test PUT update bank
    const updatedBank = { ...testBank, balance: 15000.00 }
    await testEndpoint('PUT', `/banks/${bankId}`, updatedBank)
    
    // Test DELETE bank
    await testEndpoint('DELETE', `/banks/${bankId}`)
  }
}

async function testErrorHandling() {
  console.log('\n🚨 Testing Error Handling...')
  
  // Test 404 error
  await testEndpoint('GET', '/companies/non-existent-id', null, 404)
  
  // Test 400 error (invalid data)
  await testEndpoint('POST', '/companies', { invalidField: 'test' }, 400)
  
  // Test 401 error (unauthorized)
  const originalToken = authToken
  authToken = 'invalid-token'
  await testEndpoint('GET', '/companies', null, 401)
  authToken = originalToken
}

async function runAllTests() {
  console.log('🚀 Starting API Integration Tests...')
  console.log(`Base URL: ${BASE_URL}`)
  
  try {
    // Test authentication first
    await testAuthentication()
    
    // Test all modules
    await testCompanies()
    await testCustomers()
    await testItems()
    await testSalesOrders()
    await testBanks()
    
    // Test error handling
    await testErrorHandling()
    
    console.log('\n✅ All tests completed!')
  } catch (error) {
    console.error('\n❌ Test suite failed:', error)
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests()
}

module.exports = {
  runAllTests,
  testAuthentication,
  testCompanies,
  testCustomers,
  testItems,
  testSalesOrders,
  testBanks,
  testErrorHandling
}

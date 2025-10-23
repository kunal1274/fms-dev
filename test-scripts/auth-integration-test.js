/**
 * Authentication Integration Test
 * 
 * This script tests the OTP-based authentication flow between frontend and backend
 * Run with: node test-scripts/auth-integration-test.js
 */

const BASE_URL = 'http://localhost:3000/fms/api/v0'

// Test data
const testEmail = 'test@example.com'
const testPhoneNumber = '+1234567890'

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
async function testSendOtp() {
  console.log('\n📧 Testing Send OTP...')
  
  // Test send OTP with email
  const emailResult = await testEndpoint('POST', '/otp-auth/send-otp', {
    email: testEmail
  })
  
  if (emailResult.success) {
    console.log('✅ Email OTP sent successfully')
    return { success: true, method: 'email', email: testEmail }
  }
  
  // Test send OTP with phone number
  const phoneResult = await testEndpoint('POST', '/otp-auth/send-otp', {
    phoneNumber: testPhoneNumber
  })
  
  if (phoneResult.success) {
    console.log('✅ Phone OTP sent successfully')
    return { success: true, method: 'phone', phoneNumber: testPhoneNumber }
  }
  
  console.log('❌ Failed to send OTP via both methods')
  return { success: false }
}

async function testVerifyOtp(otpData) {
  console.log('\n🔐 Testing Verify OTP...')
  
  // Note: In a real test, you would need the actual OTP from email/SMS
  // For testing purposes, we'll use a mock OTP
  const mockOtp = '123456'
  
  const verifyData = {
    otp: mockOtp,
    ...(otpData.method === 'email' ? { email: otpData.email } : { phoneNumber: otpData.phoneNumber })
  }
  
  const result = await testEndpoint('POST', '/otp-auth/verify-otp', verifyData)
  
  if (result.success && result.data.token) {
    console.log('✅ OTP verification successful')
    console.log('Token received:', result.data.token.substring(0, 20) + '...')
    return { success: true, token: result.data.token }
  } else {
    console.log('❌ OTP verification failed')
    return { success: false }
  }
}

async function testGetCurrentUser(token) {
  console.log('\n👤 Testing Get Current User...')
  
  const result = await testEndpoint('POST', '/otp-auth/me', null, 200)
  
  if (result.success) {
    console.log('✅ Current user retrieved successfully')
    console.log('User data:', result.data.user)
    return { success: true, user: result.data.user }
  } else {
    console.log('❌ Failed to get current user')
    return { success: false }
  }
}

async function testAuthenticationFlow() {
  console.log('🚀 Starting Authentication Flow Test...')
  console.log(`Base URL: ${BASE_URL}`)
  
  try {
    // Step 1: Send OTP
    const otpResult = await testSendOtp()
    if (!otpResult.success) {
      console.log('❌ Authentication flow failed at OTP sending step')
      return false
    }
    
    // Step 2: Verify OTP (Note: This will fail with mock OTP)
    const verifyResult = await testVerifyOtp(otpResult)
    if (!verifyResult.success) {
      console.log('⚠️ OTP verification failed (expected with mock OTP)')
      console.log('Note: In real testing, you would need the actual OTP from email/SMS')
      return false
    }
    
    // Step 3: Get current user (if token was received)
    if (verifyResult.token) {
      const userResult = await testGetCurrentUser(verifyResult.token)
      if (!userResult.success) {
        console.log('❌ Failed to get current user')
        return false
      }
    }
    
    console.log('\n✅ Authentication flow test completed!')
    console.log('Note: OTP verification requires actual OTP from email/SMS')
    return true
    
  } catch (error) {
    console.error('\n❌ Authentication flow test failed:', error)
    return false
  }
}

async function testErrorHandling() {
  console.log('\n🚨 Testing Authentication Error Handling...')
  
  // Test invalid email format
  await testEndpoint('POST', '/otp-auth/send-otp', {
    email: 'invalid-email'
  }, 400)
  
  // Test missing email/phone
  await testEndpoint('POST', '/otp-auth/send-otp', {}, 400)
  
  // Test invalid OTP
  await testEndpoint('POST', '/otp-auth/verify-otp', {
    email: testEmail,
    otp: '000000'
  }, 400)
  
  // Test missing OTP
  await testEndpoint('POST', '/otp-auth/verify-otp', {
    email: testEmail
  }, 400)
  
  console.log('✅ Error handling tests completed')
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAuthenticationFlow()
    .then(() => testErrorHandling())
    .then(() => {
      console.log('\n🎉 All authentication tests completed!')
      console.log('\n📝 Next Steps:')
      console.log('1. Check your email/SMS for the actual OTP')
      console.log('2. Update the mockOtp variable with the real OTP')
      console.log('3. Re-run the test to verify complete flow')
    })
    .catch(error => {
      console.error('❌ Test suite failed:', error)
    })
}

module.exports = {
  testAuthenticationFlow,
  testSendOtp,
  testVerifyOtp,
  testGetCurrentUser,
  testErrorHandling
}

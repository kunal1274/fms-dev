import React, { useState } from 'react'
import { useSendOtpMutation } from '../store/api'

const SimpleTest: React.FC = () => {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [sendOtp] = useSendOtpMutation()

  const testNativeFetch = async () => {
    setLoading(true)
    setResult('Testing native fetch with localhost:3000...')
    
    try {
      console.log('🧪 Testing native fetch with localhost:3000...')
      const response = await fetch('http://localhost:3000/fms/api/v0/otp-auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          method: 'email'
        })
      })
      
      const data = await response.text()
      console.log('✅ Native fetch success:', { status: response.status, data })
      setResult(`✅ Native Fetch Success: ${response.status} - ${data}`)
    } catch (error: any) {
      console.error('❌ Native fetch error:', error)
      setResult(`❌ Native Fetch Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testLocalhostFetch = async () => {
    setLoading(true)
    setResult('Testing localhost fetch...')
    
    try {
      console.log('🧪 Testing localhost fetch...')
      const response = await fetch('http://localhost:3000/fms/api/v0/otp-auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:5173'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          method: 'email'
        })
      })
      
      const data = await response.text()
      console.log('✅ Localhost fetch success:', { status: response.status, data })
      setResult(`✅ Localhost Fetch Success: ${response.status} - ${data}`)
    } catch (error: any) {
      console.error('❌ Localhost fetch error:', error)
      setResult(`❌ Localhost Fetch Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testRTKQuery = async () => {
    setLoading(true)
    setResult('Testing RTK Query...')
    
    try {
      const res = await sendOtp({ email: 'test@example.com', method: 'email' }).unwrap()
      console.log('✅ RTK Query success:', res)
      setResult(`✅ RTK Query Success: ${JSON.stringify(res)}`)
    } catch (error: any) {
      console.error('❌ RTK Query error:', error)
      setResult(`❌ RTK Query Error: ${error?.data?.message || error.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">Simple Test</h3>
      
      <div className="space-y-2 mb-4">
        <button
          onClick={testNativeFetch}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test localhost:3000 Fetch'}
        </button>
        
        <button
          onClick={testLocalhostFetch}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Localhost Fetch'}
        </button>
        
        <button
          onClick={testRTKQuery}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test RTK Query'}
        </button>
      </div>
      
      <div className="bg-white p-3 rounded border">
        <pre className="text-sm whitespace-pre-wrap">{result}</pre>
      </div>
    </div>
  )
}

export default SimpleTest

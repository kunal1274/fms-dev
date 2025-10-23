import React, { useState } from 'react'

const TestConnection: React.FC = () => {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testDirectFetch = async () => {
    setLoading(true)
    setResult('Testing direct fetch...')
    
    try {
      const response = await fetch('http://localhost:3000/fms/api/v0/otp-auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:5173'
        },
        body: JSON.stringify({
          email: 'kunalratxen@gmail.com',
          method: 'email'
        })
      })
      
      const data = await response.text()
      setResult(`✅ Success: ${response.status} - ${data}`)
    } catch (error: any) {
      setResult(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testEnvironmentVariables = () => {
    const envVars = {
      VITE_API_BASE: import.meta.env.VITE_API_BASE,
      NODE_ENV: import.meta.env.NODE_ENV,
      MODE: import.meta.env.MODE
    }
    setResult(`Environment Variables: ${JSON.stringify(envVars, null, 2)}`)
  }

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">Connection Test</h3>
      
      <div className="space-y-2 mb-4">
        <button
          onClick={testEnvironmentVariables}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Environment Variables
        </button>
        
        <button
          onClick={testDirectFetch}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Direct Fetch'}
        </button>
      </div>
      
      <div className="bg-white p-3 rounded border">
        <pre className="text-sm whitespace-pre-wrap">{result}</pre>
      </div>
    </div>
  )
}

export default TestConnection

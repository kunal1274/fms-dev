import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      setSent(true)
    }, 1000)
  }

  if (sent) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
            <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            Check your email
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            We've sent a password reset link to <strong>{email}</strong>
          </p>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Didn't receive the email?{' '}
            <button
              onClick={() => setSent(false)}
              className="font-medium text-primary hover:text-primary/80"
            >
              Try again
            </button>
          </p>
        </div>

        <div className="text-center">
          <Link
            to="/login"
            className="text-sm font-medium text-primary hover:text-primary/80"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Forgot your password?
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          No worries, we'll send you reset instructions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send reset link'}
        </Button>
      </form>

      <div className="text-center">
        <Link
          to="/login"
          className="text-sm font-medium text-primary hover:text-primary/80"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  )
}

export default ForgotPassword
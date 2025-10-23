import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Button } from '../../components/ui/Button'
import { loginSuccess } from '../../store/slices/authSlice'
import { useSendOtpMutation, useVerifyOtpMutation } from '../../store/api'
import { toast } from 'react-hot-toast'

const Login: React.FC = () => {
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
  })
  const [loading, setLoading] = useState(false)
  const [otpTimer, setOtpTimer] = useState(0)
  const [canResend, setCanResend] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const [sendOtp] = useSendOtpMutation()
  const [verifyOtp] = useVerifyOtpMutation()

  // Timer effect for OTP resend
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [otpTimer])

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    console.log('🔍 Login Component - Starting OTP send:', {
      email: formData.email,
      method: 'email',
      timestamp: new Date().toISOString()
    })
    
    try {
      console.log('📤 Sending OTP request...')
      const result = await sendOtp({ 
        email: formData.email,
        method: 'email'
      }).unwrap()
      
      console.log('✅ OTP send successful:', result)
      toast.success(result.message || 'OTP sent successfully!')
      setStep('otp')
      setOtpTimer(60) // 60 seconds timer
      setCanResend(false)
    } catch (error: any) {
      console.error('❌ OTP send failed:', error)
      console.error('❌ Error details:', {
        message: error.message,
        data: error.data,
        status: error.status,
        originalStatus: error.originalStatus
      })
      toast.error(error.data?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const result = await verifyOtp({ 
        email: formData.email, 
        otp: formData.otp 
      }).unwrap()
      
      console.log('✅ OTP verification successful:', result)
      
      // Check if token exists in the response (RTK Query wraps response in 'data' field, but backend returns token directly)
      const token = result.data?.token || result.token
      
      if (token) {
        // Store token in localStorage
        localStorage.setItem('token', token)
        
        // Dispatch login success
        dispatch(loginSuccess({
          user: { 
            id: 'temp-id', // Temporary ID since backend doesn't return user object
            email: formData.email,
            name: formData.email.split('@')[0], // Use email prefix as name
            role: 'user' as const,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          token: token
        }))
        
        toast.success('Login successful!')
        navigate('/dashboard')
      } else {
        console.error('❌ No token found in response:', result)
        toast.error('Invalid response from server')
      }
    } catch (error: any) {
      toast.error(error.data?.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleBackToEmail = () => {
    setStep('email')
    setFormData(prev => ({ ...prev, otp: '' }))
    setOtpTimer(0)
    setCanResend(false)
  }

  const handleResendOtp = async () => {
    setLoading(true)
    
    try {
      console.log('🔄 Resending OTP...')
      const result = await sendOtp({ 
        email: formData.email,
        method: 'email'
      }).unwrap()
      
      console.log('✅ OTP resent successfully:', result)
      toast.success('OTP resent successfully!')
      setOtpTimer(60) // Reset timer to 60 seconds
      setCanResend(false)
    } catch (error: any) {
      console.error('❌ OTP resend failed:', error)
      toast.error(error.data?.message || 'Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {step === 'email' ? 'Sign in to your account' : 'Enter verification code'}
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {step === 'email' 
            ? 'Welcome back! Please enter your email address.' 
            : `We've sent a verification code to ${formData.email}`
          }
        </p>
        {step === 'otp' && (
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {otpTimer > 0 ? (
              <span>Resend OTP in {otpTimer} seconds</span>
            ) : (
              <span>Didn't receive the code? Check your spam folder or resend.</span>
            )}
          </div>
        )}
      </div>

      {step === 'email' ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
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
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Verification code
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              required
              maxLength={6}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-lg tracking-widest"
              value={formData.otp}
              onChange={handleChange}
              placeholder="000000"
            />
          </div>

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleBackToEmail}
              disabled={loading}
            >
              Back
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </Button>
          </div>

          {/* Resend OTP Section */}
          <div className="text-center">
            {canResend ? (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="text-sm text-primary hover:text-primary/80 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Resending...' : 'Resend OTP'}
              </button>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Resend OTP in {otpTimer} seconds
              </p>
            )}
          </div>
        </form>
      )}

      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-medium text-primary hover:text-primary/80"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
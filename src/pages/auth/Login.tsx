import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Button } from '../../components/ui/Button'
import { loginSuccess } from '../../store/slices/authSlice'
import { useSendOtpMutation, useVerifyOtpMutation, useLoginWithPasswordMutation } from '../../store/api'
import { toast } from 'react-hot-toast'

const Login: React.FC = () => {
  const [step, setStep] = useState<'email' | 'otp' | 'password'>('email')
  const [loginMethod, setLoginMethod] = useState<'otp' | 'password'>('otp')
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [otpTimer, setOtpTimer] = useState(0)
  const [canResend, setCanResend] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const [sendOtp] = useSendOtpMutation()
  const [verifyOtp] = useVerifyOtpMutation()
  const [loginWithPassword] = useLoginWithPasswordMutation()

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
        setFormData(prev => ({ ...prev, otp: '', password: '' }))
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

      const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        
        try {
          console.log('🔐 Attempting password login...')
          const result = await loginWithPassword({ 
            email: formData.email,
            password: formData.password
          }).unwrap()
          
          console.log('✅ Password login successful:', result)
          
          // Extract token and user data
          const token = result.data?.token || result.token
          
          if (token) {
            // Store token in localStorage
            localStorage.setItem('token', token)
            
            // Dispatch login success
            dispatch(loginSuccess({
              user: result.data?.user || {
                id: 'temp-id',
                email: formData.email,
                name: formData.email.split('@')[0],
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
          console.error('❌ Password login failed:', error)
          toast.error(error.data?.message || 'Invalid email or password')
        } finally {
          setLoading(false)
        }
      }

  return (
    <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {step === 'email' ? 'Sign in to your account' : 
             step === 'otp' ? 'Enter verification code' : 
             'Enter your password'}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {step === 'email' 
              ? 'Welcome back! Please enter your email address.' 
              : step === 'otp'
              ? `We've sent a verification code to ${formData.email}`
              : `Enter your password for ${formData.email}`
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
        <div className="space-y-4">
          {/* Login Method Selection */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setLoginMethod('otp')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                loginMethod === 'otp'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              OTP Login
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod('password')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                loginMethod === 'password'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Password Login
            </button>
          </div>

          <form onSubmit={loginMethod === 'otp' ? handleSendOtp : (e) => { e.preventDefault(); setStep('password'); }} className="space-y-4">
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
              {loading ? 'Processing...' : loginMethod === 'otp' ? 'Send OTP' : 'Continue with Password'}
            </Button>
          </form>
        </div>
      ) : step === 'otp' ? (
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
      ) : (
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white pr-10"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setStep('email')}
              disabled={loading}
            >
              Back
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </div>

          {/* Alternative login method */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setStep('email')
                setLoginMethod('otp')
                setFormData(prev => ({ ...prev, password: '' }))
              }}
              className="text-sm text-primary hover:text-primary/80 font-medium"
            >
              Try OTP login instead
            </button>
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
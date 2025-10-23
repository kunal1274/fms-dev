import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export interface SendOtpRequest {
  email: string
  phoneNumber?: string
  method: 'email' | 'sms' | 'whatsapp'
}

export interface VerifyOtpRequest {
  email: string
  phoneNumber?: string
  otp: string
}

export interface RegisterRequest {
  email: string
  name: string
  password: string
  confirmPassword: string
}

export interface AuthResponse {
  success: boolean
  data: {
    token: string
    user: {
      id: string
      email: string
      name: string
      role: string
      phoneNumber?: string
    }
  }
  message: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RefreshTokenResponse {
  success: boolean
  data: {
    token: string
  }
  message: string
}

// Log environment variables for debugging
console.log('🔧 Environment Variables:', {
  VITE_API_BASE: import.meta.env.VITE_API_BASE,
  NODE_ENV: import.meta.env.NODE_ENV,
  MODE: import.meta.env.MODE
})

const baseUrl = import.meta.env.VITE_API_BASE || 'http://localhost:3000/fms/api/v0'
console.log('🌐 Using API Base URL:', baseUrl)

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl,
    prepareHeaders: (headers) => {
      // Add auth token if available
      const token = localStorage.getItem('token')
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      headers.set('content-type', 'application/json')
      return headers
    },
  }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    sendOtp: builder.mutation<{ success: boolean; message: string }, SendOtpRequest>({
      query: (data) => ({
        url: '/otp-auth/send-otp',
        method: 'POST',
        body: data,
      }),
    }),
    verifyOtp: builder.mutation<AuthResponse, VerifyOtpRequest>({
      query: (data) => ({
        url: '/otp-auth/verify-otp',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (data) => ({
        url: '/otp-auth/register',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    getCurrentUser: builder.query<AuthResponse, void>({
      query: () => '/otp-auth/me',
      providesTags: ['User'],
    }),
  }),
})

export const {
  useSendOtpMutation,
  useVerifyOtpMutation,
  useRegisterMutation,
  useGetCurrentUserQuery,
} = authApi

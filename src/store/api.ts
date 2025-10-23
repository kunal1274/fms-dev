import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from './index'
import { companiesApi } from './api/companies'
import { customersApi } from './api/customers'
import { vendorsApi } from './api/vendors'
import { itemsApi } from './api/items'
import { salesApi } from './api/sales'
import { purchasesApi } from './api/purchases'
import { banksApi } from './api/banks'
import { taxesApi } from './api/taxes'

// Log environment variables for debugging
console.log('🔧 Main API Environment Variables:', {
  VITE_API_BASE: import.meta.env.VITE_API_BASE,
  NODE_ENV: import.meta.env.NODE_ENV,
  MODE: import.meta.env.MODE
})

const baseUrl = import.meta.env.VITE_API_BASE || 'http://localhost:3000/fms/api/v0'
console.log('🌐 Main API Base URL:', baseUrl)

const baseQuery = fetchBaseQuery({
  baseUrl: baseUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    headers.set('content-type', 'application/json')
    return headers
  },
})

// Custom baseQuery with logging
const baseQueryWithLogging = async (args: any, api: any, extraOptions: any) => {
  console.log('🚀 RTK Query Request:', {
    url: args.url,
    method: args.method,
    body: args.body,
    baseUrl: baseUrl
  })
  
  try {
    const result = await baseQuery(args, api, extraOptions)
    
    console.log('📥 RTK Query Response:', {
      status: result.meta?.response?.status,
      data: result.data,
      error: result.error
    })
    
    return result
  } catch (error) {
    console.error('❌ RTK Query Error:', error)
    throw error
  }
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithLogging,
  tagTypes: [
    'User',
    'Company',
    'Item',
    'Customer',
    'Vendor',
    'SaleOrder',
    'PurchaseOrder',
    'Invoice',
    'BankAccount',
    'Transaction',
    'Report',
  ],
  endpoints: (builder) => ({
    // Auth endpoints
    sendOtp: builder.mutation<{ success: boolean; message: string }, { email: string; method: 'email' | 'sms' | 'whatsapp' }>({
      query: (data) => ({
        url: '/otp-auth/send-otp',
        method: 'POST',
        body: data,
      }),
    }),
    verifyOtp: builder.mutation<{ success: boolean; data: { token: string; user: any }; message: string }, { email: string; otp: string }>({
      query: (data) => ({
        url: '/otp-auth/verify-otp',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    register: builder.mutation<{ success: boolean; data: { token: string; user: any }; message: string }, { email: string; name: string; password: string; confirmPassword: string }>({
      query: (data) => ({
        url: '/otp-auth/register',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    getCurrentUser: builder.query<{ success: boolean; data: { token: string; user: any }; message: string }, void>({
      query: () => '/otp-auth/me',
      providesTags: ['User'],
    }),
  }),
})

// Export auth hooks from main API
export const {
  useSendOtpMutation,
  useVerifyOtpMutation,
  useRegisterMutation,
  useGetCurrentUserQuery,
} = api

// Export all API hooks
export * from './api/companies'
export * from './api/customers'
export * from './api/vendors'
export * from './api/items'
export * from './api/sales'
export * from './api/purchases'
export * from './api/banks'
export * from './api/taxes'
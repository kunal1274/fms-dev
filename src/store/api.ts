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

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || '/api',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    headers.set('content-type', 'application/json')
    return headers
  },
})

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions)
  
  if (result.error && result.error.status === 401) {
    // Try to get a new token
    const refreshResult = await baseQuery('/auth/refresh', api, extraOptions)
    if (refreshResult.data) {
      // Store the new token
      api.dispatch({ type: 'auth/setToken', payload: refreshResult.data })
      // Retry the original query
      result = await baseQuery(args, api, extraOptions)
    } else {
      // Refresh failed, logout
      api.dispatch({ type: 'auth/logout' })
    }
  }
  
  return result
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
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
  endpoints: () => ({}),
})

// Export all API hooks
export * from './api/companies'
export * from './api/customers'
export * from './api/vendors'
export * from './api/items'
export * from './api/sales'
export * from './api/purchases'
export * from './api/banks'
export * from './api/taxes'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { Customer, ApiResponse, PaginatedResponse, FilterOptions } from '@/types/models'

export const customersApi = createApi({
  reducerPath: 'customersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://fms-qkmw.onrender.com/fms/api/v0/customers',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token')
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['Customer'],
  endpoints: (builder) => ({
    // Get all customers with pagination and filters
    getCustomers: builder.query<PaginatedResponse<Customer>, FilterOptions>({
      query: (params) => ({
        url: '',
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          search: params.search,
          status: params.status,
          dateFrom: params.dateFrom,
          dateTo: params.dateTo,
          sortBy: params.sortBy || 'createdAt',
          sortOrder: params.sortOrder || 'desc',
        },
      }),
      providesTags: ['Customer'],
    }),

    // Get customer by ID
    getCustomer: builder.query<ApiResponse<Customer>, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Customer', id }],
    }),

    // Create new customer
    createCustomer: builder.mutation<ApiResponse<Customer>, Partial<Customer>>({
      query: (customer) => ({
        url: '',
        method: 'POST',
        body: customer,
      }),
      invalidatesTags: ['Customer'],
    }),

    // Update customer
    updateCustomer: builder.mutation<ApiResponse<Customer>, { id: string; data: Partial<Customer> }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Customer', id }],
    }),

    // Delete customer
    deleteCustomer: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Customer'],
    }),

    // Bulk delete customers
    bulkDeleteCustomers: builder.mutation<ApiResponse<void>, string[]>({
      query: (ids) => ({
        url: '/bulk-delete',
        method: 'POST',
        body: { ids },
      }),
      invalidatesTags: ['Customer'],
    }),

    // Get customer metrics
    getCustomerMetrics: builder.query<ApiResponse<any>, FilterOptions>({
      query: (params) => ({
        url: '/metrics',
        params: {
          dateFrom: params.dateFrom,
          dateTo: params.dateTo,
        },
      }),
    }),

    // Export customers
    exportCustomers: builder.mutation<Blob, { format: 'pdf' | 'excel' | 'csv'; filters?: FilterOptions }>({
      query: ({ format, filters }) => ({
        url: '/export',
        method: 'POST',
        body: { format, filters },
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
})

export const {
  useGetCustomersQuery,
  useGetCustomerQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useBulkDeleteCustomersMutation,
  useGetCustomerMetricsQuery,
  useExportCustomersMutation,
} = customersApi

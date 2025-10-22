import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { BankAccount, ApiResponse, PaginatedResponse, FilterOptions } from '@/types/models'

export const banksApi = createApi({
  reducerPath: 'banksApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://fms-qkmw.onrender.com/fms/api/v0/banks',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token')
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['BankAccount'],
  endpoints: (builder) => ({
    // Get all bank accounts with pagination and filters
    getBankAccounts: builder.query<PaginatedResponse<BankAccount>, FilterOptions>({
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
      providesTags: ['BankAccount'],
    }),

    // Get bank account by ID
    getBankAccount: builder.query<ApiResponse<BankAccount>, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'BankAccount', id }],
    }),

    // Create new bank account
    createBankAccount: builder.mutation<ApiResponse<BankAccount>, Partial<BankAccount>>({
      query: (bankAccount) => ({
        url: '',
        method: 'POST',
        body: bankAccount,
      }),
      invalidatesTags: ['BankAccount'],
    }),

    // Update bank account
    updateBankAccount: builder.mutation<ApiResponse<BankAccount>, { id: string; data: Partial<BankAccount> }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'BankAccount', id }],
    }),

    // Delete bank account
    deleteBankAccount: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['BankAccount'],
    }),

    // Bulk delete bank accounts
    bulkDeleteBankAccounts: builder.mutation<ApiResponse<void>, string[]>({
      query: (ids) => ({
        url: '/bulk-delete',
        method: 'POST',
        body: { ids },
      }),
      invalidatesTags: ['BankAccount'],
    }),

    // Get bank account metrics
    getBankAccountMetrics: builder.query<ApiResponse<any>, FilterOptions>({
      query: (params) => ({
        url: '/metrics',
        params: {
          dateFrom: params.dateFrom,
          dateTo: params.dateTo,
        },
      }),
    }),

    // Export bank accounts
    exportBankAccounts: builder.mutation<Blob, { format: 'pdf' | 'excel' | 'csv'; filters?: FilterOptions }>({
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
  useGetBankAccountsQuery,
  useGetBankAccountQuery,
  useCreateBankAccountMutation,
  useUpdateBankAccountMutation,
  useDeleteBankAccountMutation,
  useBulkDeleteBankAccountsMutation,
  useGetBankAccountMetricsQuery,
  useExportBankAccountsMutation,
} = banksApi

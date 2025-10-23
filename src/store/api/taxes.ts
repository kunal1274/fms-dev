import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { TaxRate, ApiResponse, PaginatedResponse, FilterOptions } from '@/types/models'

export const taxesApi = createApi({
  reducerPath: 'taxesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://fms-qkmw.onrender.com/fms/api/v0/taxes',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token')
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['TaxRate'],
  endpoints: (builder) => ({
    // Get all tax rates with pagination and filters
    getTaxRates: builder.query<PaginatedResponse<TaxRate>, FilterOptions>({
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
      providesTags: ['TaxRate'],
    }),

    // Get tax rate by ID
    getTaxRate: builder.query<ApiResponse<TaxRate>, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'TaxRate', id }],
    }),

    // Create new tax rate
    createTaxRate: builder.mutation<ApiResponse<TaxRate>, Partial<TaxRate>>({
      query: (taxRate) => ({
        url: '',
        method: 'POST',
        body: taxRate,
      }),
      invalidatesTags: ['TaxRate'],
    }),

    // Update tax rate
    updateTaxRate: builder.mutation<ApiResponse<TaxRate>, { id: string; data: Partial<TaxRate> }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'TaxRate', id }],
    }),

    // Delete tax rate
    deleteTaxRate: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TaxRate'],
    }),

    // Bulk delete tax rates
    bulkDeleteTaxRates: builder.mutation<ApiResponse<void>, string[]>({
      query: (ids) => ({
        url: '/bulk-delete',
        method: 'POST',
        body: { ids },
      }),
      invalidatesTags: ['TaxRate'],
    }),

    // Get tax rate metrics
    getTaxRateMetrics: builder.query<ApiResponse<any>, FilterOptions>({
      query: (params) => ({
        url: '/metrics',
        params: {
          dateFrom: params.dateFrom,
          dateTo: params.dateTo,
        },
      }),
    }),

    // Export tax rates
    exportTaxRates: builder.mutation<Blob, { format: 'pdf' | 'excel' | 'csv'; filters?: FilterOptions }>({
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
  useGetTaxRatesQuery,
  useGetTaxRateQuery,
  useCreateTaxRateMutation,
  useUpdateTaxRateMutation,
  useDeleteTaxRateMutation,
  useBulkDeleteTaxRatesMutation,
  useGetTaxRateMetricsQuery,
  useExportTaxRatesMutation,
} = taxesApi

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { Company, ApiResponse, PaginatedResponse, FilterOptions } from '../../types/models'

export const companiesApi = createApi({
  reducerPath: 'companiesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE || 'http://localhost:3000/fms/api/v0',
    prepareHeaders: (headers) => {
      // Add auth token if available
      const token = localStorage.getItem('token')
      console.log('🔧 Companies API Debug:', {
        baseUrl: import.meta.env.VITE_API_BASE || 'http://localhost:3000/fms/api/v0',
        token: token ? 'Token present' : 'No token',
        tokenLength: token?.length || 0
      })
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      headers.set('content-type', 'application/json')
      return headers
    },
  }),
  tagTypes: ['Company'],
  endpoints: (builder) => ({
    // Get all companies with pagination and filters
    getCompanies: builder.query<PaginatedResponse<Company>, FilterOptions>({
      query: (params) => ({
        url: '/companies',
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
      providesTags: ['Company'],
    }),

    // Get company by ID
    getCompany: builder.query<ApiResponse<Company>, string>({
      query: (id) => `/companies/${id}`,
      providesTags: (result, error, id) => [{ type: 'Company', id }],
    }),

    // Create new company
    createCompany: builder.mutation<ApiResponse<Company>, Partial<Company>>({
      query: (company) => ({
        url: '/companies',
        method: 'POST',
        body: company,
      }),
      invalidatesTags: ['Company'],
    }),

    // Update company
    updateCompany: builder.mutation<ApiResponse<Company>, { id: string; data: Partial<Company> }>({
      query: ({ id, data }) => ({
        url: `/companies/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Company', id }],
    }),

    // Delete company
    deleteCompany: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/companies/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Company'],
    }),

    // Bulk delete companies
    bulkDeleteCompanies: builder.mutation<ApiResponse<void>, string[]>({
      query: (ids) => ({
        url: '/companies/bulk',
        method: 'DELETE',
        body: { ids },
      }),
      invalidatesTags: ['Company'],
    }),

    // Get company metrics
    getCompanyMetrics: builder.query<ApiResponse<any>, FilterOptions>({
      query: (params) => ({
        url: '/companies/metrics',
        params: {
          dateFrom: params.dateFrom,
          dateTo: params.dateTo,
        },
      }),
    }),

    // Export companies
    exportCompanies: builder.mutation<Blob, { format: 'pdf' | 'excel' | 'csv'; filters?: FilterOptions }>({
      query: ({ format, filters }) => ({
        url: '/companies/export',
        method: 'POST',
        body: { format, filters },
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
})

export const {
  useGetCompaniesQuery,
  useGetCompanyQuery,
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  useDeleteCompanyMutation,
  useBulkDeleteCompaniesMutation,
  useGetCompanyMetricsQuery,
  useExportCompaniesMutation,
} = companiesApi

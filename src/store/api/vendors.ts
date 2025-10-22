import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { Vendor, ApiResponse, PaginatedResponse, FilterOptions } from '@/types/models'

export const vendorsApi = createApi({
  reducerPath: 'vendorsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://fms-qkmw.onrender.com/fms/api/v0/vendors',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token')
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['Vendor'],
  endpoints: (builder) => ({
    // Get all vendors with pagination and filters
    getVendors: builder.query<PaginatedResponse<Vendor>, FilterOptions>({
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
      providesTags: ['Vendor'],
    }),

    // Get vendor by ID
    getVendor: builder.query<ApiResponse<Vendor>, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Vendor', id }],
    }),

    // Create new vendor
    createVendor: builder.mutation<ApiResponse<Vendor>, Partial<Vendor>>({
      query: (vendor) => ({
        url: '',
        method: 'POST',
        body: vendor,
      }),
      invalidatesTags: ['Vendor'],
    }),

    // Update vendor
    updateVendor: builder.mutation<ApiResponse<Vendor>, { id: string; data: Partial<Vendor> }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Vendor', id }],
    }),

    // Delete vendor
    deleteVendor: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Vendor'],
    }),

    // Bulk delete vendors
    bulkDeleteVendors: builder.mutation<ApiResponse<void>, string[]>({
      query: (ids) => ({
        url: '/bulk-delete',
        method: 'POST',
        body: { ids },
      }),
      invalidatesTags: ['Vendor'],
    }),

    // Get vendor metrics
    getVendorMetrics: builder.query<ApiResponse<any>, FilterOptions>({
      query: (params) => ({
        url: '/metrics',
        params: {
          dateFrom: params.dateFrom,
          dateTo: params.dateTo,
        },
      }),
    }),

    // Export vendors
    exportVendors: builder.mutation<Blob, { format: 'pdf' | 'excel' | 'csv'; filters?: FilterOptions }>({
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
  useGetVendorsQuery,
  useGetVendorQuery,
  useCreateVendorMutation,
  useUpdateVendorMutation,
  useDeleteVendorMutation,
  useBulkDeleteVendorsMutation,
  useGetVendorMetricsQuery,
  useExportVendorsMutation,
} = vendorsApi

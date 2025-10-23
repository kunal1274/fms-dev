import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { SalesOrder, ApiResponse, PaginatedResponse, FilterOptions } from '@/types/models'

export const salesApi = createApi({
  reducerPath: 'salesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://fms-qkmw.onrender.com/fms/api/v0/sales',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token')
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['SalesOrder'],
  endpoints: (builder) => ({
    // Get all sales orders with pagination and filters
    getSalesOrders: builder.query<PaginatedResponse<SalesOrder>, FilterOptions>({
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
      providesTags: ['SalesOrder'],
    }),

    // Get sales order by ID
    getSalesOrder: builder.query<ApiResponse<SalesOrder>, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'SalesOrder', id }],
    }),

    // Create new sales order
    createSalesOrder: builder.mutation<ApiResponse<SalesOrder>, Partial<SalesOrder>>({
      query: (salesOrder) => ({
        url: '',
        method: 'POST',
        body: salesOrder,
      }),
      invalidatesTags: ['SalesOrder'],
    }),

    // Update sales order
    updateSalesOrder: builder.mutation<ApiResponse<SalesOrder>, { id: string; data: Partial<SalesOrder> }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'SalesOrder', id }],
    }),

    // Delete sales order
    deleteSalesOrder: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SalesOrder'],
    }),

    // Bulk delete sales orders
    bulkDeleteSalesOrders: builder.mutation<ApiResponse<void>, string[]>({
      query: (ids) => ({
        url: '/bulk-delete',
        method: 'POST',
        body: { ids },
      }),
      invalidatesTags: ['SalesOrder'],
    }),

    // Get sales metrics
    getSalesMetrics: builder.query<ApiResponse<any>, FilterOptions>({
      query: (params) => ({
        url: '/metrics',
        params: {
          dateFrom: params.dateFrom,
          dateTo: params.dateTo,
        },
      }),
    }),

    // Export sales orders
    exportSalesOrders: builder.mutation<Blob, { format: 'pdf' | 'excel' | 'csv'; filters?: FilterOptions }>({
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
  useGetSalesOrdersQuery,
  useGetSalesOrderQuery,
  useCreateSalesOrderMutation,
  useUpdateSalesOrderMutation,
  useDeleteSalesOrderMutation,
  useBulkDeleteSalesOrdersMutation,
  useGetSalesMetricsQuery,
  useExportSalesOrdersMutation,
} = salesApi

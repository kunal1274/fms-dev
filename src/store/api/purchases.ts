import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { PurchaseOrder, ApiResponse, PaginatedResponse, FilterOptions } from '@/types/models'

export const purchasesApi = createApi({
  reducerPath: 'purchasesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://fms-qkmw.onrender.com/fms/api/v0/purchases',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token')
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['PurchaseOrder'],
  endpoints: (builder) => ({
    // Get all purchase orders with pagination and filters
    getPurchaseOrders: builder.query<PaginatedResponse<PurchaseOrder>, FilterOptions>({
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
      providesTags: ['PurchaseOrder'],
    }),

    // Get purchase order by ID
    getPurchaseOrder: builder.query<ApiResponse<PurchaseOrder>, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'PurchaseOrder', id }],
    }),

    // Create new purchase order
    createPurchaseOrder: builder.mutation<ApiResponse<PurchaseOrder>, Partial<PurchaseOrder>>({
      query: (purchaseOrder) => ({
        url: '',
        method: 'POST',
        body: purchaseOrder,
      }),
      invalidatesTags: ['PurchaseOrder'],
    }),

    // Update purchase order
    updatePurchaseOrder: builder.mutation<ApiResponse<PurchaseOrder>, { id: string; data: Partial<PurchaseOrder> }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'PurchaseOrder', id }],
    }),

    // Delete purchase order
    deletePurchaseOrder: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PurchaseOrder'],
    }),

    // Bulk delete purchase orders
    bulkDeletePurchaseOrders: builder.mutation<ApiResponse<void>, string[]>({
      query: (ids) => ({
        url: '/bulk-delete',
        method: 'POST',
        body: { ids },
      }),
      invalidatesTags: ['PurchaseOrder'],
    }),

    // Get purchase metrics
    getPurchaseMetrics: builder.query<ApiResponse<any>, FilterOptions>({
      query: (params) => ({
        url: '/metrics',
        params: {
          dateFrom: params.dateFrom,
          dateTo: params.dateTo,
        },
      }),
    }),

    // Export purchase orders
    exportPurchaseOrders: builder.mutation<Blob, { format: 'pdf' | 'excel' | 'csv'; filters?: FilterOptions }>({
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
  useGetPurchaseOrdersQuery,
  useGetPurchaseOrderQuery,
  useCreatePurchaseOrderMutation,
  useUpdatePurchaseOrderMutation,
  useDeletePurchaseOrderMutation,
  useBulkDeletePurchaseOrdersMutation,
  useGetPurchaseMetricsQuery,
  useExportPurchaseOrdersMutation,
} = purchasesApi

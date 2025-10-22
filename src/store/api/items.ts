import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { Item, ApiResponse, PaginatedResponse, FilterOptions } from '@/types/models'

export const itemsApi = createApi({
  reducerPath: 'itemsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://fms-qkmw.onrender.com/fms/api/v0/items',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token')
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['Item'],
  endpoints: (builder) => ({
    // Get all items with pagination and filters
    getItems: builder.query<PaginatedResponse<Item>, FilterOptions>({
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
      providesTags: ['Item'],
    }),

    // Get item by ID
    getItem: builder.query<ApiResponse<Item>, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Item', id }],
    }),

    // Create new item
    createItem: builder.mutation<ApiResponse<Item>, Partial<Item>>({
      query: (item) => ({
        url: '',
        method: 'POST',
        body: item,
      }),
      invalidatesTags: ['Item'],
    }),

    // Update item
    updateItem: builder.mutation<ApiResponse<Item>, { id: string; data: Partial<Item> }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Item', id }],
    }),

    // Delete item
    deleteItem: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Item'],
    }),

    // Bulk delete items
    bulkDeleteItems: builder.mutation<ApiResponse<void>, string[]>({
      query: (ids) => ({
        url: '/bulk-delete',
        method: 'POST',
        body: { ids },
      }),
      invalidatesTags: ['Item'],
    }),

    // Get item metrics
    getItemMetrics: builder.query<ApiResponse<any>, FilterOptions>({
      query: (params) => ({
        url: '/metrics',
        params: {
          dateFrom: params.dateFrom,
          dateTo: params.dateTo,
        },
      }),
    }),

    // Export items
    exportItems: builder.mutation<Blob, { format: 'pdf' | 'excel' | 'csv'; filters?: FilterOptions }>({
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
  useGetItemsQuery,
  useGetItemQuery,
  useCreateItemMutation,
  useUpdateItemMutation,
  useDeleteItemMutation,
  useBulkDeleteItemsMutation,
  useGetItemMetricsQuery,
  useExportItemsMutation,
} = itemsApi

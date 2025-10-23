import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { AuditLog, AuditFilter, AuditStats, ApiResponse, PaginatedResponse } from '@/types/models'

export const auditApi = createApi({
  reducerPath: 'auditApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://fms-qkmw.onrender.com/fms/api/v0/audit',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token')
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['AuditLog'],
  endpoints: (builder) => ({
    // Get audit logs with pagination and filters
    getAuditLogs: builder.query<PaginatedResponse<AuditLog>, AuditFilter>({
      query: (params) => ({
        url: '',
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          entityType: params.entityType,
          action: params.action,
          userId: params.userId,
          dateFrom: params.dateFrom,
          dateTo: params.dateTo,
          search: params.search,
          sortBy: params.sortBy || 'timestamp',
          sortOrder: params.sortOrder || 'desc',
        },
      }),
      providesTags: ['AuditLog'],
    }),

    // Get audit log by ID
    getAuditLog: builder.query<ApiResponse<AuditLog>, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'AuditLog', id }],
    }),

    // Get audit statistics
    getAuditStats: builder.query<ApiResponse<AuditStats>, AuditFilter>({
      query: (params) => ({
        url: '/stats',
        params: {
          dateFrom: params.dateFrom,
          dateTo: params.dateTo,
        },
      }),
    }),

    // Get audit logs for specific entity
    getEntityAuditLogs: builder.query<PaginatedResponse<AuditLog>, { entityType: string; entityId: string; params?: AuditFilter }>({
      query: ({ entityType, entityId, params }) => ({
        url: `/entity/${entityType}/${entityId}`,
        params: {
          page: params?.page || 1,
          limit: params?.limit || 10,
          sortBy: params?.sortBy || 'timestamp',
          sortOrder: params?.sortOrder || 'desc',
        },
      }),
      providesTags: (result, error, { entityType, entityId }) => [
        { type: 'AuditLog', id: `${entityType}-${entityId}` }
      ],
    }),

    // Export audit logs
    exportAuditLogs: builder.mutation<Blob, { format: 'pdf' | 'excel' | 'csv'; filters?: AuditFilter }>({
      query: ({ format, filters }) => ({
        url: '/export',
        method: 'POST',
        body: { format, filters },
        responseHandler: (response) => response.blob(),
      }),
    }),

    // Create audit log (for internal use)
    createAuditLog: builder.mutation<ApiResponse<AuditLog>, Partial<AuditLog>>({
      query: (auditLog) => ({
        url: '',
        method: 'POST',
        body: auditLog,
      }),
      invalidatesTags: ['AuditLog'],
    }),
  }),
})

export const {
  useGetAuditLogsQuery,
  useGetAuditLogQuery,
  useGetAuditStatsQuery,
  useGetEntityAuditLogsQuery,
  useExportAuditLogsMutation,
  useCreateAuditLogMutation,
} = auditApi

export interface AuditLog {
  id: string
  entityType: string
  entityId: string
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'EXPORT' | 'LOGIN' | 'LOGOUT'
  userId: string
  userName: string
  userEmail: string
  timestamp: string
  ipAddress?: string
  userAgent?: string
  changes?: AuditChange[]
  metadata?: Record<string, any>
  description?: string
}

export interface AuditChange {
  field: string
  oldValue: any
  newValue: any
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
}

export interface AuditFilter {
  entityType?: string
  action?: string
  userId?: string
  dateFrom?: string
  dateTo?: string
  search?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface AuditStats {
  totalLogs: number
  logsByAction: Record<string, number>
  logsByEntity: Record<string, number>
  logsByUser: Record<string, number>
  recentActivity: AuditLog[]
}

export interface AuditConfig {
  enabled: boolean
  logLevels: string[]
  retentionDays: number
  excludeFields: string[]
  includeMetadata: boolean
}

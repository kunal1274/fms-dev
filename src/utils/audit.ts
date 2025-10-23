import { AuditLog, AuditChange } from '@/types/audit'

export class AuditLogger {
  private static instance: AuditLogger
  private logs: AuditLog[] = []

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger()
    }
    return AuditLogger.instance
  }

  private getCurrentUser() {
    // Get current user from auth state or localStorage
    const user = localStorage.getItem('user')
    if (user) {
      const userData = JSON.parse(user)
      return {
        id: userData.id || userData._id,
        name: userData.name || userData.username,
        email: userData.email,
      }
    }
    return {
      id: 'anonymous',
      name: 'Anonymous User',
      email: 'anonymous@example.com',
    }
  }

  private getClientInfo() {
    return {
      ipAddress: '127.0.0.1', // This would be set by the backend
      userAgent: navigator.userAgent,
    }
  }

  private createAuditLog(
    entityType: string,
    entityId: string,
    action: AuditLog['action'],
    changes?: AuditChange[],
    metadata?: Record<string, any>,
    description?: string
  ): AuditLog {
    const user = this.getCurrentUser()
    const clientInfo = this.getClientInfo()

    return {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      entityType,
      entityId,
      action,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      timestamp: new Date().toISOString(),
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
      changes,
      metadata,
      description,
    }
  }

  logCreate(entityType: string, entityId: string, data: any, description?: string) {
    const auditLog = this.createAuditLog(
      entityType,
      entityId,
      'CREATE',
      undefined,
      { createdData: data },
      description || `Created ${entityType} with ID ${entityId}`
    )
    this.logs.push(auditLog)
    this.sendToServer(auditLog)
  }

  logUpdate(
    entityType: string,
    entityId: string,
    oldData: any,
    newData: any,
    description?: string
  ) {
    const changes = this.calculateChanges(oldData, newData)
    const auditLog = this.createAuditLog(
      entityType,
      entityId,
      'UPDATE',
      changes,
      { oldData, newData },
      description || `Updated ${entityType} with ID ${entityId}`
    )
    this.logs.push(auditLog)
    this.sendToServer(auditLog)
  }

  logDelete(entityType: string, entityId: string, data: any, description?: string) {
    const auditLog = this.createAuditLog(
      entityType,
      entityId,
      'DELETE',
      undefined,
      { deletedData: data },
      description || `Deleted ${entityType} with ID ${entityId}`
    )
    this.logs.push(auditLog)
    this.sendToServer(auditLog)
  }

  logView(entityType: string, entityId: string, description?: string) {
    const auditLog = this.createAuditLog(
      entityType,
      entityId,
      'VIEW',
      undefined,
      undefined,
      description || `Viewed ${entityType} with ID ${entityId}`
    )
    this.logs.push(auditLog)
    this.sendToServer(auditLog)
  }

  logExport(entityType: string, format: string, filters?: any, description?: string) {
    const auditLog = this.createAuditLog(
      entityType,
      'bulk',
      'EXPORT',
      undefined,
      { format, filters },
      description || `Exported ${entityType} data in ${format} format`
    )
    this.logs.push(auditLog)
    this.sendToServer(auditLog)
  }

  logLogin(userId: string, userName: string, userEmail: string) {
    const auditLog = this.createAuditLog(
      'User',
      userId,
      'LOGIN',
      undefined,
      undefined,
      `User ${userName} logged in`
    )
    this.logs.push(auditLog)
    this.sendToServer(auditLog)
  }

  logLogout(userId: string, userName: string, userEmail: string) {
    const auditLog = this.createAuditLog(
      'User',
      userId,
      'LOGOUT',
      undefined,
      undefined,
      `User ${userName} logged out`
    )
    this.logs.push(auditLog)
    this.sendToServer(auditLog)
  }

  private calculateChanges(oldData: any, newData: any): AuditChange[] {
    const changes: AuditChange[] = []
    const excludeFields = ['updatedAt', 'updatedBy', 'version']

    for (const key in newData) {
      if (excludeFields.includes(key)) continue

      const oldValue = oldData[key]
      const newValue = newData[key]

      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({
          field: key,
          oldValue,
          newValue,
          type: this.getFieldType(newValue),
        })
      }
    }

    return changes
  }

  private getFieldType(value: any): AuditChange['type'] {
    if (Array.isArray(value)) return 'array'
    if (typeof value === 'object' && value !== null) return 'object'
    if (typeof value === 'boolean') return 'boolean'
    if (typeof value === 'number') return 'number'
    return 'string'
  }

  private async sendToServer(auditLog: AuditLog) {
    try {
      // Send to server - this would be implemented with the actual API
      console.log('Audit log:', auditLog)
      
      // For now, just store in localStorage for persistence
      const existingLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]')
      existingLogs.push(auditLog)
      localStorage.setItem('auditLogs', JSON.stringify(existingLogs))
    } catch (error) {
      console.error('Failed to send audit log to server:', error)
    }
  }

  getLogs(): AuditLog[] {
    return this.logs
  }

  clearLogs() {
    this.logs = []
  }
}

// Export singleton instance
export const auditLogger = AuditLogger.getInstance()

// Helper functions for common audit operations
export const auditHelpers = {
  logCompanyCreate: (companyId: string, companyData: any) => {
    auditLogger.logCreate('Company', companyId, companyData, `Created company: ${companyData.name}`)
  },

  logCompanyUpdate: (companyId: string, oldData: any, newData: any) => {
    auditLogger.logUpdate('Company', companyId, oldData, newData, `Updated company: ${newData.name || oldData.name}`)
  },

  logCompanyDelete: (companyId: string, companyData: any) => {
    auditLogger.logDelete('Company', companyId, companyData, `Deleted company: ${companyData.name}`)
  },

  logCustomerCreate: (customerId: string, customerData: any) => {
    auditLogger.logCreate('Customer', customerId, customerData, `Created customer: ${customerData.name}`)
  },

  logCustomerUpdate: (customerId: string, oldData: any, newData: any) => {
    auditLogger.logUpdate('Customer', customerId, oldData, newData, `Updated customer: ${newData.name || oldData.name}`)
  },

  logCustomerDelete: (customerId: string, customerData: any) => {
    auditLogger.logDelete('Customer', customerId, customerData, `Deleted customer: ${customerData.name}`)
  },

  logVendorCreate: (vendorId: string, vendorData: any) => {
    auditLogger.logCreate('Vendor', vendorId, vendorData, `Created vendor: ${vendorData.name}`)
  },

  logVendorUpdate: (vendorId: string, oldData: any, newData: any) => {
    auditLogger.logUpdate('Vendor', vendorId, oldData, newData, `Updated vendor: ${newData.name || oldData.name}`)
  },

  logVendorDelete: (vendorId: string, vendorData: any) => {
    auditLogger.logDelete('Vendor', vendorId, vendorData, `Deleted vendor: ${vendorData.name}`)
  },

  logItemCreate: (itemId: string, itemData: any) => {
    auditLogger.logCreate('Item', itemId, itemData, `Created item: ${itemData.name}`)
  },

  logItemUpdate: (itemId: string, oldData: any, newData: any) => {
    auditLogger.logUpdate('Item', itemId, oldData, newData, `Updated item: ${newData.name || oldData.name}`)
  },

  logItemDelete: (itemId: string, itemData: any) => {
    auditLogger.logDelete('Item', itemId, itemData, `Deleted item: ${itemData.name}`)
  },

  logSalesOrderCreate: (orderId: string, orderData: any) => {
    auditLogger.logCreate('SalesOrder', orderId, orderData, `Created sales order: ${orderData.orderNumber}`)
  },

  logSalesOrderUpdate: (orderId: string, oldData: any, newData: any) => {
    auditLogger.logUpdate('SalesOrder', orderId, oldData, newData, `Updated sales order: ${newData.orderNumber || oldData.orderNumber}`)
  },

  logSalesOrderDelete: (orderId: string, orderData: any) => {
    auditLogger.logDelete('SalesOrder', orderId, orderData, `Deleted sales order: ${orderData.orderNumber}`)
  },

  logPurchaseOrderCreate: (orderId: string, orderData: any) => {
    auditLogger.logCreate('PurchaseOrder', orderId, orderData, `Created purchase order: ${orderData.orderNumber}`)
  },

  logPurchaseOrderUpdate: (orderId: string, oldData: any, newData: any) => {
    auditLogger.logUpdate('PurchaseOrder', orderId, oldData, newData, `Updated purchase order: ${newData.orderNumber || oldData.orderNumber}`)
  },

  logPurchaseOrderDelete: (orderId: string, orderData: any) => {
    auditLogger.logDelete('PurchaseOrder', orderId, orderData, `Deleted purchase order: ${orderData.orderNumber}`)
  },

  logBankAccountCreate: (accountId: string, accountData: any) => {
    auditLogger.logCreate('BankAccount', accountId, accountData, `Created bank account: ${accountData.accountNumber}`)
  },

  logBankAccountUpdate: (accountId: string, oldData: any, newData: any) => {
    auditLogger.logUpdate('BankAccount', accountId, oldData, newData, `Updated bank account: ${newData.accountNumber || oldData.accountNumber}`)
  },

  logBankAccountDelete: (accountId: string, accountData: any) => {
    auditLogger.logDelete('BankAccount', accountId, accountData, `Deleted bank account: ${accountData.accountNumber}`)
  },

  logTaxRateCreate: (rateId: string, rateData: any) => {
    auditLogger.logCreate('TaxRate', rateId, rateData, `Created tax rate: ${rateData.name}`)
  },

  logTaxRateUpdate: (rateId: string, oldData: any, newData: any) => {
    auditLogger.logUpdate('TaxRate', rateId, oldData, newData, `Updated tax rate: ${newData.name || oldData.name}`)
  },

  logTaxRateDelete: (rateId: string, rateData: any) => {
    auditLogger.logDelete('TaxRate', rateId, rateData, `Deleted tax rate: ${rateData.name}`)
  },

  logDataExport: (entityType: string, format: string, recordCount: number) => {
    auditLogger.logExport(entityType, format, { recordCount }, `Exported ${recordCount} ${entityType} records in ${format} format`)
  },
}

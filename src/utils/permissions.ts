import { PERMISSIONS, ROLES, ROLE_PERMISSIONS, PermissionCheck, AccessControl } from '@/types/permissions'

export class PermissionManager {
  private static instance: PermissionManager
  private userPermissions: string[] = []
  private userRoles: string[] = []

  static getInstance(): PermissionManager {
    if (!PermissionManager.instance) {
      PermissionManager.instance = new PermissionManager()
    }
    return PermissionManager.instance
  }

  setUserPermissions(permissions: string[]) {
    this.userPermissions = permissions
  }

  setUserRoles(roles: string[]) {
    this.userRoles = roles
    // Auto-populate permissions based on roles
    this.userPermissions = this.getPermissionsFromRoles(roles)
  }

  private getPermissionsFromRoles(roles: string[]): string[] {
    const permissions = new Set<string>()
    
    roles.forEach(role => {
      const rolePermissions = ROLE_PERMISSIONS[role] || []
      rolePermissions.forEach(permission => permissions.add(permission))
    })

    return Array.from(permissions)
  }

  hasPermission(permission: string): boolean {
    return this.userPermissions.includes(permission)
  }

  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(permission))
  }

  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every(permission => this.hasPermission(permission))
  }

  hasRole(role: string): boolean {
    return this.userRoles.includes(role)
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role))
  }

  hasAllRoles(roles: string[]): boolean {
    return roles.every(role => this.hasRole(role))
  }

  canAccess(resource: string, action: string): boolean {
    const permission = `${resource}:${action}`
    return this.hasPermission(permission)
  }

  canCreate(resource: string): boolean {
    return this.canAccess(resource, 'create')
  }

  canRead(resource: string): boolean {
    return this.canAccess(resource, 'read')
  }

  canUpdate(resource: string): boolean {
    return this.canAccess(resource, 'update')
  }

  canDelete(resource: string): boolean {
    return this.canAccess(resource, 'delete')
  }

  canExport(resource: string): boolean {
    return this.canAccess(resource, 'export')
  }

  canImport(resource: string): boolean {
    return this.canAccess(resource, 'import')
  }

  canApprove(resource: string): boolean {
    return this.canAccess(resource, 'approve')
  }

  canReject(resource: string): boolean {
    return this.canAccess(resource, 'reject')
  }

  canAssign(resource: string): boolean {
    return this.canAccess(resource, 'assign')
  }

  canManage(resource: string): boolean {
    return this.canAccess(resource, 'manage')
  }

  getAccessControl(resource: string): AccessControl {
    return {
      canCreate: this.canCreate(resource),
      canRead: this.canRead(resource),
      canUpdate: this.canUpdate(resource),
      canDelete: this.canDelete(resource),
      canExport: this.canExport(resource),
      canImport: this.canImport(resource),
      canApprove: this.canApprove(resource),
      canReject: this.canReject(resource),
      canAssign: this.canAssign(resource),
      canManage: this.canManage(resource),
    }
  }

  isSuperAdmin(): boolean {
    return this.hasRole(ROLES.SUPER_ADMIN)
  }

  isAdmin(): boolean {
    return this.hasAnyRole([ROLES.SUPER_ADMIN, ROLES.ADMIN])
  }

  isManager(): boolean {
    return this.hasAnyRole([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.MANAGER])
  }

  isAccountant(): boolean {
    return this.hasRole(ROLES.ACCOUNTANT)
  }

  isSalesManager(): boolean {
    return this.hasRole(ROLES.SALES_MANAGER)
  }

  isPurchaseManager(): boolean {
    return this.hasRole(ROLES.PURCHASE_MANAGER)
  }

  isInventoryManager(): boolean {
    return this.hasRole(ROLES.INVENTORY_MANAGER)
  }

  isSalesUser(): boolean {
    return this.hasRole(ROLES.SALES_USER)
  }

  isPurchaseUser(): boolean {
    return this.hasRole(ROLES.PURCHASE_USER)
  }

  isInventoryUser(): boolean {
    return this.hasRole(ROLES.INVENTORY_USER)
  }

  isViewer(): boolean {
    return this.hasRole(ROLES.VIEWER)
  }

  // Business logic permissions
  canManageCompanies(): boolean {
    return this.hasAnyPermission([
      PERMISSIONS.COMPANY_CREATE,
      PERMISSIONS.COMPANY_UPDATE,
      PERMISSIONS.COMPANY_DELETE,
    ])
  }

  canManageCustomers(): boolean {
    return this.hasAnyPermission([
      PERMISSIONS.CUSTOMER_CREATE,
      PERMISSIONS.CUSTOMER_UPDATE,
      PERMISSIONS.CUSTOMER_DELETE,
    ])
  }

  canManageVendors(): boolean {
    return this.hasAnyPermission([
      PERMISSIONS.VENDOR_CREATE,
      PERMISSIONS.VENDOR_UPDATE,
      PERMISSIONS.VENDOR_DELETE,
    ])
  }

  canManageItems(): boolean {
    return this.hasAnyPermission([
      PERMISSIONS.ITEM_CREATE,
      PERMISSIONS.ITEM_UPDATE,
      PERMISSIONS.ITEM_DELETE,
    ])
  }

  canManageSales(): boolean {
    return this.hasAnyPermission([
      PERMISSIONS.SALES_CREATE,
      PERMISSIONS.SALES_UPDATE,
      PERMISSIONS.SALES_DELETE,
    ])
  }

  canManagePurchases(): boolean {
    return this.hasAnyPermission([
      PERMISSIONS.PURCHASE_CREATE,
      PERMISSIONS.PURCHASE_UPDATE,
      PERMISSIONS.PURCHASE_DELETE,
    ])
  }

  canManageBanks(): boolean {
    return this.hasAnyPermission([
      PERMISSIONS.BANK_CREATE,
      PERMISSIONS.BANK_UPDATE,
      PERMISSIONS.BANK_DELETE,
    ])
  }

  canManageTaxes(): boolean {
    return this.hasAnyPermission([
      PERMISSIONS.TAX_CREATE,
      PERMISSIONS.TAX_UPDATE,
      PERMISSIONS.TAX_DELETE,
    ])
  }

  canManageUsers(): boolean {
    return this.hasAnyPermission([
      PERMISSIONS.USER_CREATE,
      PERMISSIONS.USER_UPDATE,
      PERMISSIONS.USER_DELETE,
    ])
  }

  canManageRoles(): boolean {
    return this.hasAnyPermission([
      PERMISSIONS.ROLE_CREATE,
      PERMISSIONS.ROLE_UPDATE,
      PERMISSIONS.ROLE_DELETE,
    ])
  }

  canManageReports(): boolean {
    return this.hasAnyPermission([
      PERMISSIONS.REPORT_CREATE,
      PERMISSIONS.REPORT_UPDATE,
      PERMISSIONS.REPORT_DELETE,
    ])
  }

  canViewAuditLogs(): boolean {
    return this.hasPermission(PERMISSIONS.AUDIT_READ)
  }

  canViewDashboard(): boolean {
    return this.hasPermission(PERMISSIONS.DASHBOARD_READ)
  }

  canManageSettings(): boolean {
    return this.hasPermission(PERMISSIONS.SETTINGS_UPDATE)
  }

  // Get user's accessible modules
  getAccessibleModules(): string[] {
    const modules: string[] = []

    if (this.canRead('company')) modules.push('companies')
    if (this.canRead('customer')) modules.push('customers')
    if (this.canRead('vendor')) modules.push('vendors')
    if (this.canRead('item')) modules.push('inventory')
    if (this.canRead('sales')) modules.push('sales')
    if (this.canRead('purchase')) modules.push('purchases')
    if (this.canRead('bank')) modules.push('banks')
    if (this.canRead('tax')) modules.push('taxes')
    if (this.canRead('user')) modules.push('users')
    if (this.canRead('role')) modules.push('roles')
    if (this.canRead('report')) modules.push('reports')
    if (this.canViewAuditLogs()) modules.push('audit')
    if (this.canViewDashboard()) modules.push('dashboard')
    if (this.canRead('settings')) modules.push('settings')

    return modules
  }

  // Get user's permissions summary
  getPermissionsSummary(): Record<string, AccessControl> {
    const resources = ['company', 'customer', 'vendor', 'item', 'sales', 'purchase', 'bank', 'tax', 'user', 'role', 'report']
    const summary: Record<string, AccessControl> = {}

    resources.forEach(resource => {
      summary[resource] = this.getAccessControl(resource)
    })

    return summary
  }

  // Clear user permissions (for logout)
  clearPermissions() {
    this.userPermissions = []
    this.userRoles = []
  }
}

// Export singleton instance
export const permissionManager = PermissionManager.getInstance()

// Helper functions for common permission checks
export const permissionHelpers = {
  // Company permissions
  canViewCompanies: () => permissionManager.canRead('company'),
  canCreateCompany: () => permissionManager.canCreate('company'),
  canUpdateCompany: () => permissionManager.canUpdate('company'),
  canDeleteCompany: () => permissionManager.canDelete('company'),
  canExportCompanies: () => permissionManager.canExport('company'),

  // Customer permissions
  canViewCustomers: () => permissionManager.canRead('customer'),
  canCreateCustomer: () => permissionManager.canCreate('customer'),
  canUpdateCustomer: () => permissionManager.canUpdate('customer'),
  canDeleteCustomer: () => permissionManager.canDelete('customer'),
  canExportCustomers: () => permissionManager.canExport('customer'),

  // Vendor permissions
  canViewVendors: () => permissionManager.canRead('vendor'),
  canCreateVendor: () => permissionManager.canCreate('vendor'),
  canUpdateVendor: () => permissionManager.canUpdate('vendor'),
  canDeleteVendor: () => permissionManager.canDelete('vendor'),
  canExportVendors: () => permissionManager.canExport('vendor'),

  // Item permissions
  canViewItems: () => permissionManager.canRead('item'),
  canCreateItem: () => permissionManager.canCreate('item'),
  canUpdateItem: () => permissionManager.canUpdate('item'),
  canDeleteItem: () => permissionManager.canDelete('item'),
  canExportItems: () => permissionManager.canExport('item'),

  // Sales permissions
  canViewSales: () => permissionManager.canRead('sales'),
  canCreateSales: () => permissionManager.canCreate('sales'),
  canUpdateSales: () => permissionManager.canUpdate('sales'),
  canDeleteSales: () => permissionManager.canDelete('sales'),
  canExportSales: () => permissionManager.canExport('sales'),
  canApproveSales: () => permissionManager.canApprove('sales'),

  // Purchase permissions
  canViewPurchases: () => permissionManager.canRead('purchase'),
  canCreatePurchases: () => permissionManager.canCreate('purchase'),
  canUpdatePurchases: () => permissionManager.canUpdate('purchase'),
  canDeletePurchases: () => permissionManager.canDelete('purchase'),
  canExportPurchases: () => permissionManager.canExport('purchase'),
  canApprovePurchases: () => permissionManager.canApprove('purchase'),

  // Bank permissions
  canViewBanks: () => permissionManager.canRead('bank'),
  canCreateBank: () => permissionManager.canCreate('bank'),
  canUpdateBank: () => permissionManager.canUpdate('bank'),
  canDeleteBank: () => permissionManager.canDelete('bank'),
  canExportBanks: () => permissionManager.canExport('bank'),

  // Tax permissions
  canViewTaxes: () => permissionManager.canRead('tax'),
  canCreateTax: () => permissionManager.canCreate('tax'),
  canUpdateTax: () => permissionManager.canUpdate('tax'),
  canDeleteTax: () => permissionManager.canDelete('tax'),
  canExportTaxes: () => permissionManager.canExport('tax'),

  // User permissions
  canViewUsers: () => permissionManager.canRead('user'),
  canCreateUser: () => permissionManager.canCreate('user'),
  canUpdateUser: () => permissionManager.canUpdate('user'),
  canDeleteUser: () => permissionManager.canDelete('user'),
  canExportUsers: () => permissionManager.canExport('user'),

  // Role permissions
  canViewRoles: () => permissionManager.canRead('role'),
  canCreateRole: () => permissionManager.canCreate('role'),
  canUpdateRole: () => permissionManager.canUpdate('role'),
  canDeleteRole: () => permissionManager.canDelete('role'),
  canExportRoles: () => permissionManager.canExport('role'),

  // Report permissions
  canViewReports: () => permissionManager.canRead('report'),
  canCreateReport: () => permissionManager.canCreate('report'),
  canUpdateReport: () => permissionManager.canUpdate('report'),
  canDeleteReport: () => permissionManager.canDelete('report'),
  canExportReports: () => permissionManager.canExport('report'),

  // Audit permissions
  canViewAuditLogs: () => permissionManager.canViewAuditLogs(),
  canExportAuditLogs: () => permissionManager.canExport('audit'),

  // Dashboard permissions
  canViewDashboard: () => permissionManager.canViewDashboard(),
  canExportDashboard: () => permissionManager.canExport('dashboard'),

  // Settings permissions
  canViewSettings: () => permissionManager.canRead('settings'),
  canUpdateSettings: () => permissionManager.canManageSettings(),
}

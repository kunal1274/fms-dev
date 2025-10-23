import React, { Suspense, lazy, ComponentType } from 'react'
import { DataTableSkeleton } from '../ui/Loading'

interface LazyLoaderProps {
  fallback?: React.ReactNode
}

// Default fallback component
const DefaultFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
)

// Lazy load components with error boundaries
export const createLazyComponent = <P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  fallback?: React.ReactNode
) => {
  const LazyComponent = lazy(importFunc)

  return (props: P) => (
    <Suspense fallback={fallback || <DefaultFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  )
}

// Lazy load pages
export const LazyDashboard = createLazyComponent(
  () => import('../../pages/dashboard/Dashboard'),
  <DataTableSkeleton />
)

export const LazyCompanies = createLazyComponent(
  () => import('../../pages/company/Company'),
  <DataTableSkeleton />
)

export const LazyCustomers = createLazyComponent(
  () => import('../../pages/customers/Customers'),
  <DataTableSkeleton />
)

export const LazyVendors = createLazyComponent(
  () => import('../../pages/vendors/Vendors'),
  <DataTableSkeleton />
)

export const LazyInventory = createLazyComponent(
  () => import('../../pages/inventory/Inventory'),
  <DataTableSkeleton />
)

export const LazySales = createLazyComponent(
  () => import('../../pages/sales/SalesOrders'),
  <DataTableSkeleton />
)

export const LazyPurchases = createLazyComponent(
  () => import('../../pages/purchases/PurchaseOrders'),
  <DataTableSkeleton />
)

export const LazyBanks = createLazyComponent(
  () => import('../../pages/banks/BankAccounts'),
  <DataTableSkeleton />
)

export const LazyTaxes = createLazyComponent(
  () => import('../../pages/taxes/TaxRates'),
  <DataTableSkeleton />
)

export const LazyReports = createLazyComponent(
  () => import('../../pages/reports/Reports'),
  <DataTableSkeleton />
)

export const LazyAuditLogs = createLazyComponent(
  () => import('../../pages/audit/AuditLogs'),
  <DataTableSkeleton />
)

// Lazy load forms
export const LazyCompanyForm = createLazyComponent(
  () => import('../../pages/company/CompanyForm')
)

export const LazyCustomerForm = createLazyComponent(
  () => import('../../pages/customers/CustomerForm')
)

export const LazyVendorForm = createLazyComponent(
  () => import('../../pages/vendors/VendorForm')
)

export const LazyItemForm = createLazyComponent(
  () => import('../../pages/inventory/ItemForm')
)

export const LazySalesOrderForm = createLazyComponent(
  () => import('../../pages/sales/SalesOrderForm')
)

export const LazyPurchaseOrderForm = createLazyComponent(
  () => import('../../pages/purchases/PurchaseOrderForm')
)

export const LazyBankAccountForm = createLazyComponent(
  () => import('../../pages/banks/BankAccountForm')
)

export const LazyTaxRateForm = createLazyComponent(
  () => import('../../pages/taxes/TaxRateForm')
)

// Lazy load views
export const LazyCompanyView = createLazyComponent(
  () => import('../../pages/company/CompanyView')
)

export const LazyCustomerView = createLazyComponent(
  () => import('../../pages/customers/CustomerView')
)

export const LazyVendorView = createLazyComponent(
  () => import('../../pages/vendors/VendorView')
)

export const LazyItemView = createLazyComponent(
  () => import('../../pages/inventory/ItemView')
)

export const LazySalesOrderView = createLazyComponent(
  () => import('../../pages/sales/SalesOrderView')
)

export const LazyPurchaseOrderView = createLazyComponent(
  () => import('../../pages/purchases/PurchaseOrderView')
)

export const LazyBankAccountView = createLazyComponent(
  () => import('../../pages/banks/BankAccountView')
)

export const LazyTaxRateView = createLazyComponent(
  () => import('../../pages/taxes/TaxRateView')
)

// Lazy load complex components
export const LazyCharts = createLazyComponent(
  () => import('../dashboard/Charts'),
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="animate-pulse">
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    ))}
  </div>
)

export const LazyReportBuilder = createLazyComponent(
  () => import('../reports/ReportBuilder')
)

export const LazyWorkflowManager = createLazyComponent(
  () => import('../workflow/WorkflowManager')
)

export const LazyDocumentManager = createLazyComponent(
  () => import('../documents/DocumentManager')
)

// Lazy load utilities
export const LazyExport = createLazyComponent(
  () => import('../../utils/export')
)

export const LazyAuditLogger = createLazyComponent(
  () => import('../../utils/audit')
)

export const LazyPermissionManager = createLazyComponent(
  () => import('../../utils/permissions')
)

// Higher-order component for lazy loading with error boundary
export const withLazyLoading = <P extends object>(
  Component: ComponentType<P>,
  fallback?: React.ReactNode
) => {
  return (props: P) => (
    <Suspense fallback={fallback || <DefaultFallback />}>
      <Component {...props} />
    </Suspense>
  )
}

// Lazy loader hook for dynamic imports
export const useLazyImport = () => {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)

  const lazyImport = React.useCallback(
    async (importFunc: () => Promise<any>): Promise<any | null> => {
      try {
        setLoading(true)
        setError(null)
        const module = await importFunc()
        return module
      } catch (err) {
        setError(err as Error)
        return null
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { lazyImport, loading, error }
}

// Preload components for better performance
export const preloadComponents = () => {
  // Preload critical components
  import('../../pages/dashboard/Dashboard')
  import('../../pages/company/Company')
  import('../../pages/customers/Customers')
  
  // Preload forms
  import('../../pages/company/CompanyForm')
  import('../../pages/customers/CustomerForm')
  
  // Preload utilities
  import('../../utils/export')
  import('../../utils/audit')
  import('../../utils/permissions')
}

// Lazy loader for routes
export const LazyRoute: React.FC<{
  children: React.ReactNode
  fallback?: React.ReactNode
}> = ({ children, fallback }) => (
  <Suspense fallback={fallback || <DefaultFallback />}>
    {children}
  </Suspense>
)

export default LazyRoute

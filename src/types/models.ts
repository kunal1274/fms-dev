// Base types
export interface BaseEntity {
  id?: string
  _id?: string
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
  isActive?: boolean
}

export interface Address {
  street?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
  landmark?: string
}

export interface ContactInfo {
  email?: string
  phone?: string
  mobile?: string
  website?: string
}

export interface BankDetails {
  id?: string
  bankName: string
  accountNumber: string
  accountHolderName: string
  ifscCode?: string
  swiftCode?: string
  branchName?: string
  bankType: 'Bank' | 'UPI' | 'Cash' | 'BankAndUpi'
  qrDetails?: string
  isActive?: boolean
}

export interface TaxInfo {
  gstNumber?: string
  panNumber?: string
  tanNumber?: string
  taxExempt?: boolean
  taxRate?: number
}

// Company Types
export interface Company extends BaseEntity {
  companyCode: string
  companyName: string
  businessType: BusinessType
  primaryAddress: Address
  secondaryAddress?: Address
  shippingAddress?: Address
  contactInfo: ContactInfo
  bankDetails: BankDetails[]
  taxInfo: TaxInfo
  currency: Currency
  creditLimit?: number
  outstandingBalance?: number
  paymentTerms?: PaymentTerms
  status: CompanyStatus
  remarks?: string
}

export type BusinessType = 
  | 'Individual'
  | 'Manufacturing'
  | 'ServiceProvider'
  | 'Trading'
  | 'Distributor'
  | 'Retailer'
  | 'Wholesaler'
  | 'Others'

export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP'

export type PaymentTerms = 
  | 'COD'
  | 'Net7D'
  | 'Net15D'
  | 'Net30D'
  | 'Net45D'
  | 'Net60D'
  | 'Net90D'
  | 'Advance'

export type CompanyStatus = 'Active' | 'Inactive' | 'OnHold' | 'Suspended'

// Customer Types
export interface Customer extends BaseEntity {
  customerCode: string
  customerName: string
  businessType: BusinessType
  primaryAddress: Address
  secondaryAddress?: Address
  shippingAddress?: Address
  contactInfo: ContactInfo
  bankDetails: BankDetails[]
  taxInfo: TaxInfo
  currency: Currency
  creditLimit?: number
  outstandingBalance?: number
  paymentTerms?: PaymentTerms
  status: CustomerStatus
  remarks?: string
  companyId?: string
}

export type CustomerStatus = 'Active' | 'Inactive' | 'OnHold' | 'Blacklisted'

// Vendor Types
export interface Vendor extends BaseEntity {
  vendorCode: string
  vendorName: string
  businessType: BusinessType
  primaryAddress: Address
  secondaryAddress?: Address
  shippingAddress?: Address
  contactInfo: ContactInfo
  bankDetails: BankDetails[]
  taxInfo: TaxInfo
  currency: Currency
  creditLimit?: number
  outstandingBalance?: number
  paymentTerms?: PaymentTerms
  status: VendorStatus
  remarks?: string
  companyId?: string
}

export type VendorStatus = 'Active' | 'Inactive' | 'OnHold' | 'Blacklisted'

// Inventory Types
export interface Item extends BaseEntity {
  itemCode: string
  itemName: string
  description?: string
  category: string
  subCategory?: string
  unit: string
  baseUnit?: string
  conversionFactor?: number
  hsnCode?: string
  sku?: string
  barcode?: string
  qrCode?: string
  dimensions?: {
    length?: number
    width?: number
    height?: number
    weight?: number
  }
  pricing: {
    costPrice: number
    sellingPrice: number
    mrp?: number
    margin?: number
  }
  stock: {
    currentStock: number
    minimumStock: number
    maximumStock?: number
    reorderLevel: number
    reorderQuantity: number
  }
  taxInfo: TaxInfo
  status: ItemStatus
  isSerialized?: boolean
  isBatchTracked?: boolean
  companyId?: string
}

export type ItemStatus = 'Active' | 'Inactive' | 'Discontinued'

export interface Category extends BaseEntity {
  categoryCode: string
  categoryName: string
  description?: string
  parentCategoryId?: string
  isActive: boolean
  companyId?: string
}

export interface Warehouse extends BaseEntity {
  warehouseCode: string
  warehouseName: string
  description?: string
  address: Address
  contactInfo: ContactInfo
  capacity?: number
  isActive: boolean
  companyId?: string
}

export interface StockMovement extends BaseEntity {
  itemId: string
  warehouseId: string
  movementType: StockMovementType
  quantity: number
  referenceType?: string
  referenceId?: string
  batchNumber?: string
  serialNumber?: string
  expiryDate?: string
  remarks?: string
  companyId?: string
}

export type StockMovementType = 
  | 'In'
  | 'Out'
  | 'Transfer'
  | 'Adjustment'
  | 'Return'
  | 'Damage'
  | 'Expired'

// Sales Types
export interface SalesOrder extends BaseEntity {
  orderNumber: string
  customerId: string
  orderDate: string
  deliveryDate?: string
  items: SalesOrderItem[]
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  status: SalesOrderStatus
  paymentStatus: PaymentStatus
  shippingAddress?: Address
  remarks?: string
  companyId?: string
}

export interface SalesOrderItem {
  itemId: string
  quantity: number
  unitPrice: number
  discount?: number
  taxRate?: number
  totalAmount: number
}

export type SalesOrderStatus = 
  | 'Draft'
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'
  | 'Returned'

export interface Invoice extends BaseEntity {
  invoiceNumber: string
  salesOrderId?: string
  customerId: string
  invoiceDate: string
  dueDate?: string
  items: InvoiceItem[]
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  paidAmount: number
  status: InvoiceStatus
  paymentStatus: PaymentStatus
  shippingAddress?: Address
  remarks?: string
  companyId?: string
}

export interface InvoiceItem {
  itemId: string
  quantity: number
  unitPrice: number
  discount?: number
  taxRate?: number
  totalAmount: number
}

export type InvoiceStatus = 
  | 'Draft'
  | 'Pending'
  | 'Sent'
  | 'Paid'
  | 'Overdue'
  | 'Cancelled'

export type PaymentStatus = 
  | 'Pending'
  | 'Partial'
  | 'Paid'
  | 'Overdue'
  | 'Cancelled'

// Purchase Types
export interface PurchaseOrder extends BaseEntity {
  orderNumber: string
  vendorId: string
  orderDate: string
  expectedDate?: string
  items: PurchaseOrderItem[]
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  status: PurchaseOrderStatus
  paymentStatus: PaymentStatus
  shippingAddress?: Address
  remarks?: string
  companyId?: string
}

export interface PurchaseOrderItem {
  itemId: string
  quantity: number
  unitPrice: number
  discount?: number
  taxRate?: number
  totalAmount: number
}

export type PurchaseOrderStatus = 
  | 'Draft'
  | 'Pending'
  | 'Approved'
  | 'Processing'
  | 'Received'
  | 'Cancelled'
  | 'Returned'

export interface Receipt extends BaseEntity {
  receiptNumber: string
  purchaseOrderId?: string
  vendorId: string
  receiptDate: string
  items: ReceiptItem[]
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  status: ReceiptStatus
  warehouseId?: string
  remarks?: string
  companyId?: string
}

export interface ReceiptItem {
  itemId: string
  orderedQuantity: number
  receivedQuantity: number
  unitPrice: number
  discount?: number
  taxRate?: number
  totalAmount: number
  batchNumber?: string
  serialNumber?: string
  expiryDate?: string
}

export type ReceiptStatus = 
  | 'Draft'
  | 'Pending'
  | 'Received'
  | 'Partial'
  | 'Completed'
  | 'Cancelled'

// Bank Types
export interface BankAccount extends BaseEntity {
  accountNumber: string
  accountName: string
  bankName: string
  branchName?: string
  ifscCode?: string
  swiftCode?: string
  accountType: BankAccountType
  currency: Currency
  openingBalance: number
  currentBalance: number
  isActive: boolean
  companyId?: string
}

export type BankAccountType = 'Savings' | 'Current' | 'Fixed' | 'Recurring'

export interface BankTransaction extends BaseEntity {
  transactionNumber: string
  bankAccountId: string
  transactionDate: string
  transactionType: BankTransactionType
  amount: number
  balance: number
  description?: string
  referenceNumber?: string
  category?: string
  companyId?: string
}

export type BankTransactionType = 'Credit' | 'Debit' | 'Transfer'

// Tax Types
export interface TaxRate extends BaseEntity {
  taxCode: string
  taxName: string
  taxType: TaxType
  rate: number
  isActive: boolean
  companyId?: string
}

export type TaxType = 'GST' | 'VAT' | 'Sales Tax' | 'Service Tax' | 'Custom'

// Journal Types
export interface JournalEntry extends BaseEntity {
  entryNumber: string
  entryDate: string
  description?: string
  lines: JournalLine[]
  totalDebit: number
  totalCredit: number
  status: JournalStatus
  companyId?: string
}

export interface JournalLine {
  accountId: string
  description?: string
  debit: number
  credit: number
  reference?: string
}

export type JournalStatus = 'Draft' | 'Posted' | 'Cancelled'

// User Types
export interface User extends BaseEntity {
  email: string
  name: string
  role: UserRole
  permissions: Permission[]
  isActive: boolean
  lastLogin?: string
  companyId?: string
}

export type UserRole = 'SuperAdmin' | 'Admin' | 'Manager' | 'User' | 'Viewer'

export interface Permission {
  module: string
  actions: string[]
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  errors?: string[]
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form Types
export interface FormState<T> {
  data: T
  errors: Partial<Record<keyof T, string>>
  isSubmitting: boolean
  isDirty: boolean
}

// Filter Types
export interface FilterOptions {
  search?: string
  status?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Export Types
export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv'
  fields?: string[]
  filters?: FilterOptions
}

// Dashboard Types
export interface DashboardStats {
  totalRevenue: number
  totalSales: number
  totalPurchases: number
  totalCustomers: number
  totalVendors: number
  totalItems: number
  lowStockItems: number
  pendingOrders: number
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string
    borderColor?: string
  }[]
}

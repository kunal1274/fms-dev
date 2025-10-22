// Common types used throughout the application

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type UserRole = 'admin' | 'manager' | 'user' | 'viewer'

export interface Company {
  id: string
  name: string
  code: string
  address: Address
  contact: Contact
  settings: CompanySettings
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Address {
  street: string
  city: string
  state: string
  country: string
  postalCode: string
}

export interface Contact {
  phone: string
  email: string
  website?: string
}

export interface CompanySettings {
  currency: string
  timezone: string
  dateFormat: string
  fiscalYearStart: string
}

export interface Item {
  id: string
  code: string
  name: string
  description?: string
  category: ItemCategory
  unit: string
  price: number
  cost: number
  stock: number
  minStock: number
  maxStock: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ItemCategory {
  id: string
  name: string
  parentId?: string
  children?: ItemCategory[]
}

export interface Customer {
  id: string
  code: string
  name: string
  email: string
  phone: string
  address: Address
  creditLimit: number
  balance: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Vendor {
  id: string
  code: string
  name: string
  email: string
  phone: string
  address: Address
  paymentTerms: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface SaleOrder {
  id: string
  orderNumber: string
  customerId: string
  customer: Customer
  orderDate: string
  dueDate: string
  status: OrderStatus
  subtotal: number
  tax: number
  total: number
  items: SaleOrderItem[]
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface SaleOrderItem {
  id: string
  itemId: string
  item: Item
  quantity: number
  unitPrice: number
  total: number
}

export interface PurchaseOrder {
  id: string
  orderNumber: string
  vendorId: string
  vendor: Vendor
  orderDate: string
  dueDate: string
  status: OrderStatus
  subtotal: number
  tax: number
  total: number
  items: PurchaseOrderItem[]
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface PurchaseOrderItem {
  id: string
  itemId: string
  item: Item
  quantity: number
  unitPrice: number
  total: number
}

export type OrderStatus = 'draft' | 'pending' | 'approved' | 'shipped' | 'delivered' | 'cancelled'

export interface Invoice {
  id: string
  invoiceNumber: string
  customerId: string
  customer: Customer
  invoiceDate: string
  dueDate: string
  status: InvoiceStatus
  subtotal: number
  tax: number
  total: number
  paid: number
  balance: number
  items: InvoiceItem[]
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface InvoiceItem {
  id: string
  itemId: string
  item: Item
  quantity: number
  unitPrice: number
  total: number
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'

export interface BankAccount {
  id: string
  name: string
  accountNumber: string
  bankName: string
  accountType: BankAccountType
  balance: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type BankAccountType = 'checking' | 'savings' | 'credit' | 'loan'

export interface Transaction {
  id: string
  type: TransactionType
  accountId: string
  account: BankAccount
  amount: number
  description: string
  reference?: string
  date: string
  createdAt: string
  updatedAt: string
}

export type TransactionType = 'debit' | 'credit'

export interface Report {
  id: string
  name: string
  type: ReportType
  parameters: Record<string, any>
  schedule?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type ReportType = 'sales' | 'purchase' | 'inventory' | 'financial' | 'custom'

export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
  pagination?: Pagination
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  filterable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (value: any, row: any) => React.ReactNode
}

export interface TableProps {
  columns: TableColumn[]
  data: any[]
  loading?: boolean
  pagination?: Pagination
  onPageChange?: (page: number) => void
  onSort?: (key: string, direction: 'asc' | 'desc') => void
  onFilter?: (filters: Record<string, any>) => void
}

export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'date' | 'checkbox' | 'radio'
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
  validation?: any
}

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

export interface Theme {
  mode: 'light' | 'dark'
  primary: string
  secondary: string
  accent: string
}

export interface AppState {
  user: User | null
  company: Company | null
  theme: Theme
  notifications: Notification[]
  loading: boolean
  error: string | null
}
# ERP Frontend API Documentation

## Overview

This document provides comprehensive documentation for all API integrations in the ERP frontend system. The system uses RTK Query for API state management, providing automatic caching, background updates, and optimistic updates.

## Table of Contents

1. [API Architecture](#api-architecture)
2. [Base Configuration](#base-configuration)
3. [Company API](#company-api)
4. [Customer API](#customer-api)
5. [Vendor API](#vendor-api)
6. [Item API](#item-api)
7. [Sales API](#sales-api)
8. [Purchase API](#purchase-api)
9. [Bank API](#bank-api)
10. [Tax API](#tax-api)
11. [Audit API](#audit-api)
12. [Error Handling](#error-handling)
13. [Caching Strategy](#caching-strategy)
14. [Best Practices](#best-practices)

---

## API Architecture

### RTK Query Setup

The API layer is built using RTK Query, which provides:
- Automatic caching and background updates
- Optimistic updates
- Request deduplication
- Error handling
- Loading states

### Base Configuration

**Location:** `src/store/api.ts`

```typescript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://fms-qkmw.onrender.com/fms/api/v0',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token')
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['User', 'Company', 'Customer', 'Vendor', 'Item', 'Sale', 'Purchase', 'Bank', 'Tax', 'Report'],
  endpoints: () => ({}),
})
```

---

## Company API

### Endpoints

**Location:** `src/store/api/companies.ts`

#### Get Companies
```typescript
getCompanies: builder.query<PaginatedResponse<Company>, CompanyFilter>({
  query: (params) => ({
    url: '/companies',
    params: {
      page: params.page || 1,
      limit: params.limit || 10,
      search: params.search,
      sortBy: params.sortBy || 'name',
      sortOrder: params.sortOrder || 'asc',
      status: params.status,
    },
  }),
  providesTags: ['Company'],
})
```

#### Get Company by ID
```typescript
getCompany: builder.query<ApiResponse<Company>, string>({
  query: (id) => `/companies/${id}`,
  providesTags: (result, error, id) => [{ type: 'Company', id }],
})
```

#### Create Company
```typescript
createCompany: builder.mutation<ApiResponse<Company>, CreateCompanyRequest>({
  query: (data) => ({
    url: '/companies',
    method: 'POST',
    body: data,
  }),
  invalidatesTags: ['Company'],
})
```

#### Update Company
```typescript
updateCompany: builder.mutation<ApiResponse<Company>, UpdateCompanyRequest>({
  query: ({ id, data }) => ({
    url: `/companies/${id}`,
    method: 'PUT',
    body: data,
  }),
  invalidatesTags: (result, error, { id }) => [{ type: 'Company', id }],
})
```

#### Delete Company
```typescript
deleteCompany: builder.mutation<ApiResponse<void>, string>({
  query: (id) => ({
    url: `/companies/${id}`,
    method: 'DELETE',
  }),
  invalidatesTags: ['Company'],
})
```

#### Bulk Delete Companies
```typescript
bulkDeleteCompanies: builder.mutation<ApiResponse<void>, string[]>({
  query: (ids) => ({
    url: '/companies/bulk-delete',
    method: 'POST',
    body: { ids },
  }),
  invalidatesTags: ['Company'],
})
```

#### Export Companies
```typescript
exportCompanies: builder.mutation<Blob, ExportRequest>({
  query: ({ format, filters }) => ({
    url: '/companies/export',
    method: 'POST',
    body: { format, filters },
    responseHandler: (response) => response.blob(),
  }),
})
```

### Usage Example

```typescript
import { useGetCompaniesQuery, useCreateCompanyMutation } from '@/store/api'

const CompanyList = () => {
  const { data, isLoading, error } = useGetCompaniesQuery({
    page: 1,
    limit: 20,
    search: 'test',
    sortBy: 'name',
    sortOrder: 'asc'
  })
  
  const [createCompany] = useCreateCompanyMutation()
  
  const handleCreate = async (companyData) => {
    try {
      await createCompany(companyData).unwrap()
      // Handle success
    } catch (error) {
      // Handle error
    }
  }
  
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
  return (
    <div>
      {data?.data.map(company => (
        <div key={company.id}>{company.name}</div>
      ))}
    </div>
  )
}
```

---

## Customer API

### Endpoints

**Location:** `src/store/api/customers.ts`

#### Get Customers
```typescript
getCustomers: builder.query<PaginatedResponse<Customer>, CustomerFilter>({
  query: (params) => ({
    url: '/customers',
    params: {
      page: params.page || 1,
      limit: params.limit || 10,
      search: params.search,
      sortBy: params.sortBy || 'name',
      sortOrder: params.sortOrder || 'asc',
      status: params.status,
    },
  }),
  providesTags: ['Customer'],
})
```

#### Get Customer by ID
```typescript
getCustomer: builder.query<ApiResponse<Customer>, string>({
  query: (id) => `/customers/${id}`,
  providesTags: (result, error, id) => [{ type: 'Customer', id }],
})
```

#### Create Customer
```typescript
createCustomer: builder.mutation<ApiResponse<Customer>, CreateCustomerRequest>({
  query: (data) => ({
    url: '/customers',
    method: 'POST',
    body: data,
  }),
  invalidatesTags: ['Customer'],
})
```

#### Update Customer
```typescript
updateCustomer: builder.mutation<ApiResponse<Customer>, UpdateCustomerRequest>({
  query: ({ id, data }) => ({
    url: `/customers/${id}`,
    method: 'PUT',
    body: data,
  }),
  invalidatesTags: (result, error, { id }) => [{ type: 'Customer', id }],
})
```

#### Delete Customer
```typescript
deleteCustomer: builder.mutation<ApiResponse<void>, string>({
  query: (id) => ({
    url: `/customers/${id}`,
    method: 'DELETE',
  }),
  invalidatesTags: ['Customer'],
})
```

#### Bulk Delete Customers
```typescript
bulkDeleteCustomers: builder.mutation<ApiResponse<void>, string[]>({
  query: (ids) => ({
    url: '/customers/bulk-delete',
    method: 'POST',
    body: { ids },
  }),
  invalidatesTags: ['Customer'],
})
```

#### Export Customers
```typescript
exportCustomers: builder.mutation<Blob, ExportRequest>({
  query: ({ format, filters }) => ({
    url: '/customers/export',
    method: 'POST',
    body: { format, filters },
    responseHandler: (response) => response.blob(),
  }),
})
```

---

## Vendor API

### Endpoints

**Location:** `src/store/api/vendors.ts`

#### Get Vendors
```typescript
getVendors: builder.query<PaginatedResponse<Vendor>, VendorFilter>({
  query: (params) => ({
    url: '/vendors',
    params: {
      page: params.page || 1,
      limit: params.limit || 10,
      search: params.search,
      sortBy: params.sortBy || 'name',
      sortOrder: params.sortOrder || 'asc',
      status: params.status,
    },
  }),
  providesTags: ['Vendor'],
})
```

#### Get Vendor by ID
```typescript
getVendor: builder.query<ApiResponse<Vendor>, string>({
  query: (id) => `/vendors/${id}`,
  providesTags: (result, error, id) => [{ type: 'Vendor', id }],
})
```

#### Create Vendor
```typescript
createVendor: builder.mutation<ApiResponse<Vendor>, CreateVendorRequest>({
  query: (data) => ({
    url: '/vendors',
    method: 'POST',
    body: data,
  }),
  invalidatesTags: ['Vendor'],
})
```

#### Update Vendor
```typescript
updateVendor: builder.mutation<ApiResponse<Vendor>, UpdateVendorRequest>({
  query: ({ id, data }) => ({
    url: `/vendors/${id}`,
    method: 'PUT',
    body: data,
  }),
  invalidatesTags: (result, error, { id }) => [{ type: 'Vendor', id }],
})
```

#### Delete Vendor
```typescript
deleteVendor: builder.mutation<ApiResponse<void>, string>({
  query: (id) => ({
    url: `/vendors/${id}`,
    method: 'DELETE',
  }),
  invalidatesTags: ['Vendor'],
})
```

#### Bulk Delete Vendors
```typescript
bulkDeleteVendors: builder.mutation<ApiResponse<void>, string[]>({
  query: (ids) => ({
    url: '/vendors/bulk-delete',
    method: 'POST',
    body: { ids },
  }),
  invalidatesTags: ['Vendor'],
})
```

#### Export Vendors
```typescript
exportVendors: builder.mutation<Blob, ExportRequest>({
  query: ({ format, filters }) => ({
    url: '/vendors/export',
    method: 'POST',
    body: { format, filters },
    responseHandler: (response) => response.blob(),
  }),
})
```

---

## Item API

### Endpoints

**Location:** `src/store/api/items.ts`

#### Get Items
```typescript
getItems: builder.query<PaginatedResponse<Item>, ItemFilter>({
  query: (params) => ({
    url: '/items',
    params: {
      page: params.page || 1,
      limit: params.limit || 10,
      search: params.search,
      sortBy: params.sortBy || 'name',
      sortOrder: params.sortOrder || 'asc',
      category: params.category,
      status: params.status,
    },
  }),
  providesTags: ['Item'],
})
```

#### Get Item by ID
```typescript
getItem: builder.query<ApiResponse<Item>, string>({
  query: (id) => `/items/${id}`,
  providesTags: (result, error, id) => [{ type: 'Item', id }],
})
```

#### Create Item
```typescript
createItem: builder.mutation<ApiResponse<Item>, CreateItemRequest>({
  query: (data) => ({
    url: '/items',
    method: 'POST',
    body: data,
  }),
  invalidatesTags: ['Item'],
})
```

#### Update Item
```typescript
updateItem: builder.mutation<ApiResponse<Item>, UpdateItemRequest>({
  query: ({ id, data }) => ({
    url: `/items/${id}`,
    method: 'PUT',
    body: data,
  }),
  invalidatesTags: (result, error, { id }) => [{ type: 'Item', id }],
})
```

#### Delete Item
```typescript
deleteItem: builder.mutation<ApiResponse<void>, string>({
  query: (id) => ({
    url: `/items/${id}`,
    method: 'DELETE',
  }),
  invalidatesTags: ['Item'],
})
```

#### Bulk Delete Items
```typescript
bulkDeleteItems: builder.mutation<ApiResponse<void>, string[]>({
  query: (ids) => ({
    url: '/items/bulk-delete',
    method: 'POST',
    body: { ids },
  }),
  invalidatesTags: ['Item'],
})
```

#### Export Items
```typescript
exportItems: builder.mutation<Blob, ExportRequest>({
  query: ({ format, filters }) => ({
    url: '/items/export',
    method: 'POST',
    body: { format, filters },
    responseHandler: (response) => response.blob(),
  }),
})
```

---

## Sales API

### Endpoints

**Location:** `src/store/api/sales.ts`

#### Get Sales Orders
```typescript
getSalesOrders: builder.query<PaginatedResponse<SalesOrder>, SalesOrderFilter>({
  query: (params) => ({
    url: '/sales',
    params: {
      page: params.page || 1,
      limit: params.limit || 10,
      search: params.search,
      sortBy: params.sortBy || 'orderDate',
      sortOrder: params.sortOrder || 'desc',
      status: params.status,
      customerId: params.customerId,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
    },
  }),
  providesTags: ['Sale'],
})
```

#### Get Sales Order by ID
```typescript
getSalesOrder: builder.query<ApiResponse<SalesOrder>, string>({
  query: (id) => `/sales/${id}`,
  providesTags: (result, error, id) => [{ type: 'Sale', id }],
})
```

#### Create Sales Order
```typescript
createSalesOrder: builder.mutation<ApiResponse<SalesOrder>, CreateSalesOrderRequest>({
  query: (data) => ({
    url: '/sales',
    method: 'POST',
    body: data,
  }),
  invalidatesTags: ['Sale'],
})
```

#### Update Sales Order
```typescript
updateSalesOrder: builder.mutation<ApiResponse<SalesOrder>, UpdateSalesOrderRequest>({
  query: ({ id, data }) => ({
    url: `/sales/${id}`,
    method: 'PUT',
    body: data,
  }),
  invalidatesTags: (result, error, { id }) => [{ type: 'Sale', id }],
})
```

#### Delete Sales Order
```typescript
deleteSalesOrder: builder.mutation<ApiResponse<void>, string>({
  query: (id) => ({
    url: `/sales/${id}`,
    method: 'DELETE',
  }),
  invalidatesTags: ['Sale'],
})
```

#### Bulk Delete Sales Orders
```typescript
bulkDeleteSalesOrders: builder.mutation<ApiResponse<void>, string[]>({
  query: (ids) => ({
    url: '/sales/bulk-delete',
    method: 'POST',
    body: { ids },
  }),
  invalidatesTags: ['Sale'],
})
```

#### Export Sales Orders
```typescript
exportSalesOrders: builder.mutation<Blob, ExportRequest>({
  query: ({ format, filters }) => ({
    url: '/sales/export',
    method: 'POST',
    body: { format, filters },
    responseHandler: (response) => response.blob(),
  }),
})
```

---

## Purchase API

### Endpoints

**Location:** `src/store/api/purchases.ts`

#### Get Purchase Orders
```typescript
getPurchaseOrders: builder.query<PaginatedResponse<PurchaseOrder>, PurchaseOrderFilter>({
  query: (params) => ({
    url: '/purchases',
    params: {
      page: params.page || 1,
      limit: params.limit || 10,
      search: params.search,
      sortBy: params.sortBy || 'orderDate',
      sortOrder: params.sortOrder || 'desc',
      status: params.status,
      vendorId: params.vendorId,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
    },
  }),
  providesTags: ['Purchase'],
})
```

#### Get Purchase Order by ID
```typescript
getPurchaseOrder: builder.query<ApiResponse<PurchaseOrder>, string>({
  query: (id) => `/purchases/${id}`,
  providesTags: (result, error, id) => [{ type: 'Purchase', id }],
})
```

#### Create Purchase Order
```typescript
createPurchaseOrder: builder.mutation<ApiResponse<PurchaseOrder>, CreatePurchaseOrderRequest>({
  query: (data) => ({
    url: '/purchases',
    method: 'POST',
    body: data,
  }),
  invalidatesTags: ['Purchase'],
})
```

#### Update Purchase Order
```typescript
updatePurchaseOrder: builder.mutation<ApiResponse<PurchaseOrder>, UpdatePurchaseOrderRequest>({
  query: ({ id, data }) => ({
    url: `/purchases/${id}`,
    method: 'PUT',
    body: data,
  }),
  invalidatesTags: (result, error, { id }) => [{ type: 'Purchase', id }],
})
```

#### Delete Purchase Order
```typescript
deletePurchaseOrder: builder.mutation<ApiResponse<void>, string>({
  query: (id) => ({
    url: `/purchases/${id}`,
    method: 'DELETE',
  }),
  invalidatesTags: ['Purchase'],
})
```

#### Bulk Delete Purchase Orders
```typescript
bulkDeletePurchaseOrders: builder.mutation<ApiResponse<void>, string[]>({
  query: (ids) => ({
    url: '/purchases/bulk-delete',
    method: 'POST',
    body: { ids },
  }),
  invalidatesTags: ['Purchase'],
})
```

#### Export Purchase Orders
```typescript
exportPurchaseOrders: builder.mutation<Blob, ExportRequest>({
  query: ({ format, filters }) => ({
    url: '/purchases/export',
    method: 'POST',
    body: { format, filters },
    responseHandler: (response) => response.blob(),
  }),
})
```

---

## Bank API

### Endpoints

**Location:** `src/store/api/banks.ts`

#### Get Bank Accounts
```typescript
getBankAccounts: builder.query<PaginatedResponse<BankAccount>, BankAccountFilter>({
  query: (params) => ({
    url: '/banks',
    params: {
      page: params.page || 1,
      limit: params.limit || 10,
      search: params.search,
      sortBy: params.sortBy || 'accountNumber',
      sortOrder: params.sortOrder || 'asc',
      status: params.status,
      accountType: params.accountType,
    },
  }),
  providesTags: ['Bank'],
})
```

#### Get Bank Account by ID
```typescript
getBankAccount: builder.query<ApiResponse<BankAccount>, string>({
  query: (id) => `/banks/${id}`,
  providesTags: (result, error, id) => [{ type: 'Bank', id }],
})
```

#### Create Bank Account
```typescript
createBankAccount: builder.mutation<ApiResponse<BankAccount>, CreateBankAccountRequest>({
  query: (data) => ({
    url: '/banks',
    method: 'POST',
    body: data,
  }),
  invalidatesTags: ['Bank'],
})
```

#### Update Bank Account
```typescript
updateBankAccount: builder.mutation<ApiResponse<BankAccount>, UpdateBankAccountRequest>({
  query: ({ id, data }) => ({
    url: `/banks/${id}`,
    method: 'PUT',
    body: data,
  }),
  invalidatesTags: (result, error, { id }) => [{ type: 'Bank', id }],
})
```

#### Delete Bank Account
```typescript
deleteBankAccount: builder.mutation<ApiResponse<void>, string>({
  query: (id) => ({
    url: `/banks/${id}`,
    method: 'DELETE',
  }),
  invalidatesTags: ['Bank'],
})
```

#### Bulk Delete Bank Accounts
```typescript
bulkDeleteBankAccounts: builder.mutation<ApiResponse<void>, string[]>({
  query: (ids) => ({
    url: '/banks/bulk-delete',
    method: 'POST',
    body: { ids },
  }),
  invalidatesTags: ['Bank'],
})
```

#### Export Bank Accounts
```typescript
exportBankAccounts: builder.mutation<Blob, ExportRequest>({
  query: ({ format, filters }) => ({
    url: '/banks/export',
    method: 'POST',
    body: { format, filters },
    responseHandler: (response) => response.blob(),
  }),
})
```

---

## Tax API

### Endpoints

**Location:** `src/store/api/taxes.ts`

#### Get Tax Rates
```typescript
getTaxRates: builder.query<PaginatedResponse<TaxRate>, TaxRateFilter>({
  query: (params) => ({
    url: '/taxes',
    params: {
      page: params.page || 1,
      limit: params.limit || 10,
      search: params.search,
      sortBy: params.sortBy || 'name',
      sortOrder: params.sortOrder || 'asc',
      status: params.status,
      type: params.type,
    },
  }),
  providesTags: ['Tax'],
})
```

#### Get Tax Rate by ID
```typescript
getTaxRate: builder.query<ApiResponse<TaxRate>, string>({
  query: (id) => `/taxes/${id}`,
  providesTags: (result, error, id) => [{ type: 'Tax', id }],
})
```

#### Create Tax Rate
```typescript
createTaxRate: builder.mutation<ApiResponse<TaxRate>, CreateTaxRateRequest>({
  query: (data) => ({
    url: '/taxes',
    method: 'POST',
    body: data,
  }),
  invalidatesTags: ['Tax'],
})
```

#### Update Tax Rate
```typescript
updateTaxRate: builder.mutation<ApiResponse<TaxRate>, UpdateTaxRateRequest>({
  query: ({ id, data }) => ({
    url: `/taxes/${id}`,
    method: 'PUT',
    body: data,
  }),
  invalidatesTags: (result, error, { id }) => [{ type: 'Tax', id }],
})
```

#### Delete Tax Rate
```typescript
deleteTaxRate: builder.mutation<ApiResponse<void>, string>({
  query: (id) => ({
    url: `/taxes/${id}`,
    method: 'DELETE',
  }),
  invalidatesTags: ['Tax'],
})
```

#### Bulk Delete Tax Rates
```typescript
bulkDeleteTaxRates: builder.mutation<ApiResponse<void>, string[]>({
  query: (ids) => ({
    url: '/taxes/bulk-delete',
    method: 'POST',
    body: { ids },
  }),
  invalidatesTags: ['Tax'],
})
```

#### Export Tax Rates
```typescript
exportTaxRates: builder.mutation<Blob, ExportRequest>({
  query: ({ format, filters }) => ({
    url: '/taxes/export',
    method: 'POST',
    body: { format, filters },
    responseHandler: (response) => response.blob(),
  }),
})
```

---

## Audit API

### Endpoints

**Location:** `src/store/api/audit.ts`

#### Get Audit Logs
```typescript
getAuditLogs: builder.query<PaginatedResponse<AuditLog>, AuditFilter>({
  query: (params) => ({
    url: '/audit',
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
})
```

#### Get Audit Log by ID
```typescript
getAuditLog: builder.query<ApiResponse<AuditLog>, string>({
  query: (id) => `/audit/${id}`,
  providesTags: (result, error, id) => [{ type: 'AuditLog', id }],
})
```

#### Get Audit Statistics
```typescript
getAuditStats: builder.query<ApiResponse<AuditStats>, AuditFilter>({
  query: (params) => ({
    url: '/audit/stats',
    params: {
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
    },
  }),
})
```

#### Get Entity Audit Logs
```typescript
getEntityAuditLogs: builder.query<PaginatedResponse<AuditLog>, { entityType: string; entityId: string; params?: AuditFilter }>({
  query: ({ entityType, entityId, params }) => ({
    url: `/audit/entity/${entityType}/${entityId}`,
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
})
```

#### Export Audit Logs
```typescript
exportAuditLogs: builder.mutation<Blob, { format: 'pdf' | 'excel' | 'csv'; filters?: AuditFilter }>({
  query: ({ format, filters }) => ({
    url: '/audit/export',
    method: 'POST',
    body: { format, filters },
    responseHandler: (response) => response.blob(),
  }),
})
```

#### Create Audit Log
```typescript
createAuditLog: builder.mutation<ApiResponse<AuditLog>, Partial<AuditLog>>({
  query: (auditLog) => ({
    url: '/audit',
    method: 'POST',
    body: auditLog,
  }),
  invalidatesTags: ['AuditLog'],
})
```

---

## Error Handling

### Error Types

```typescript
interface ApiError {
  status: number
  data: {
    message: string
    code?: string
    details?: any
  }
}

interface ValidationError extends ApiError {
  data: {
    message: string
    errors: Array<{
      field: string
      message: string
    }>
  }
}
```

### Error Handling in Components

```typescript
import { useGetCompaniesQuery } from '@/store/api'

const CompanyList = () => {
  const { data, isLoading, error } = useGetCompaniesQuery({ page: 1, limit: 10 })
  
  if (isLoading) return <div>Loading...</div>
  
  if (error) {
    if ('status' in error) {
      // RTK Query error
      const errMsg = 'data' in error ? error.data.message : 'An error occurred'
      return <div>Error: {errMsg}</div>
    } else {
      // Network error
      return <div>Error: {error.message}</div>
    }
  }
  
  return (
    <div>
      {data?.data.map(company => (
        <div key={company.id}>{company.name}</div>
      ))}
    </div>
  )
}
```

### Error Handling in Mutations

```typescript
import { useCreateCompanyMutation } from '@/store/api'

const CompanyForm = () => {
  const [createCompany] = useCreateCompanyMutation()
  
  const handleSubmit = async (formData) => {
    try {
      await createCompany(formData).unwrap()
      // Handle success
    } catch (error) {
      if ('status' in error) {
        // RTK Query error
        const errMsg = 'data' in error ? error.data.message : 'An error occurred'
        console.error('Error:', errMsg)
      } else {
        // Network error
        console.error('Network error:', error.message)
      }
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  )
}
```

---

## Caching Strategy

### Cache Tags

Each API endpoint uses appropriate cache tags for automatic invalidation:

```typescript
// Company API
providesTags: ['Company']
providesTags: (result, error, id) => [{ type: 'Company', id }]

// Invalidation
invalidatesTags: ['Company']
invalidatesTags: (result, error, { id }) => [{ type: 'Company', id }]
```

### Cache Configuration

```typescript
// Base query configuration
baseQuery: fetchBaseQuery({
  baseUrl: 'https://fms-qkmw.onrender.com/fms/api/v0',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token')
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
}),

// Tag types for cache management
tagTypes: ['User', 'Company', 'Customer', 'Vendor', 'Item', 'Sale', 'Purchase', 'Bank', 'Tax', 'Report'],
```

### Cache Invalidation

```typescript
// Automatic invalidation on mutations
createCompany: builder.mutation<ApiResponse<Company>, CreateCompanyRequest>({
  query: (data) => ({
    url: '/companies',
    method: 'POST',
    body: data,
  }),
  invalidatesTags: ['Company'], // Invalidates all Company queries
}),

updateCompany: builder.mutation<ApiResponse<Company>, UpdateCompanyRequest>({
  query: ({ id, data }) => ({
    url: `/companies/${id}`,
    method: 'PUT',
    body: data,
  }),
  invalidatesTags: (result, error, { id }) => [{ type: 'Company', id }], // Invalidates specific company
}),
```

---

## Best Practices

### 1. Query Hooks

```typescript
// Good: Use query hooks for data fetching
const { data, isLoading, error } = useGetCompaniesQuery({
  page: 1,
  limit: 10,
  search: 'test'
})

// Bad: Don't use query hooks for mutations
const { data } = useGetCompaniesQuery({ page: 1, limit: 10 })
```

### 2. Mutation Hooks

```typescript
// Good: Use mutation hooks for data modification
const [createCompany] = useCreateCompanyMutation()

const handleCreate = async (companyData) => {
  try {
    await createCompany(companyData).unwrap()
    // Handle success
  } catch (error) {
    // Handle error
  }
}

// Bad: Don't use mutation hooks for data fetching
const [createCompany] = useCreateCompanyMutation()
```

### 3. Error Handling

```typescript
// Good: Proper error handling
const { data, isLoading, error } = useGetCompaniesQuery({ page: 1, limit: 10 })

if (isLoading) return <div>Loading...</div>
if (error) return <div>Error: {error.message}</div>

// Bad: No error handling
const { data } = useGetCompaniesQuery({ page: 1, limit: 10 })
return <div>{data?.data.map(company => <div key={company.id}>{company.name}</div>)}</div>
```

### 4. Loading States

```typescript
// Good: Handle loading states
const { data, isLoading, error } = useGetCompaniesQuery({ page: 1, limit: 10 })

if (isLoading) return <div>Loading...</div>

// Bad: No loading state handling
const { data } = useGetCompaniesQuery({ page: 1, limit: 10 })
return <div>{data?.data.map(company => <div key={company.id}>{company.name}</div>)}</div>
```

### 5. Optimistic Updates

```typescript
// Good: Use optimistic updates for better UX
const [updateCompany] = useUpdateCompanyMutation()

const handleUpdate = async (id, data) => {
  try {
    await updateCompany({ id, data }).unwrap()
    // Handle success
  } catch (error) {
    // Handle error and revert optimistic update
  }
}

// Bad: No optimistic updates
const [updateCompany] = useUpdateCompanyMutation()

const handleUpdate = async (id, data) => {
  await updateCompany({ id, data }).unwrap()
  // Wait for server response
}
```

### 6. Cache Management

```typescript
// Good: Proper cache invalidation
createCompany: builder.mutation<ApiResponse<Company>, CreateCompanyRequest>({
  query: (data) => ({
    url: '/companies',
    method: 'POST',
    body: data,
  }),
  invalidatesTags: ['Company'], // Invalidates all Company queries
}),

// Bad: No cache invalidation
createCompany: builder.mutation<ApiResponse<Company>, CreateCompanyRequest>({
  query: (data) => ({
    url: '/companies',
    method: 'POST',
    body: data,
  }),
  // No invalidatesTags - cache won't be updated
}),
```

### 7. Type Safety

```typescript
// Good: Use TypeScript interfaces
interface CompanyFilter {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  status?: string
}

const { data } = useGetCompaniesQuery<CompanyFilter>({
  page: 1,
  limit: 10,
  search: 'test'
})

// Bad: No type safety
const { data } = useGetCompaniesQuery({
  page: 1,
  limit: 10,
  search: 'test'
})
```

---

## Conclusion

This API documentation provides a comprehensive guide to using the RTK Query-based API layer in the ERP frontend system. Follow the best practices outlined in this documentation to ensure consistent and maintainable API integration.

For additional support or questions, please refer to the project repository or contact the development team.

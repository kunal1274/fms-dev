# 📚 API Endpoints Reference

## Base URL
```
Development: http://localhost:3000/fms/api/v0
Production: https://your-backend-domain.com/fms/api/v0
```

## Authentication Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/otp-auth/login` | User login | `{ email, password }` | `{ token, user }` |
| POST | `/otp-auth/register` | User registration | `{ email, password, name }` | `{ token, user }` |
| POST | `/otp-auth/refresh` | Refresh token | `{ refreshToken }` | `{ token }` |
| POST | `/otp-auth/logout` | User logout | `{ token }` | `{ message }` |

## Core Business Modules

### Companies
| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/companies` | Get all companies | Query: `page, limit, search` | `{ data: Company[], pagination }` |
| GET | `/companies/:id` | Get company by ID | - | `{ data: Company }` |
| POST | `/companies` | Create company | `Company` | `{ data: Company }` |
| PUT | `/companies/:id` | Update company | `Company` | `{ data: Company }` |
| DELETE | `/companies/:id` | Delete company | - | `{ message }` |
| POST | `/companies/bulk` | Bulk create companies | `{ companies: Company[] }` | `{ data: Company[] }` |
| PUT | `/companies/bulk` | Bulk update companies | `{ companies: Company[] }` | `{ data: Company[] }` |
| DELETE | `/companies/bulk` | Bulk delete companies | `{ ids: string[] }` | `{ message }` |

### Customers
| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/customers` | Get all customers | Query: `page, limit, search` | `{ data: Customer[], pagination }` |
| GET | `/customers/:id` | Get customer by ID | - | `{ data: Customer }` |
| POST | `/customers` | Create customer | `Customer` | `{ data: Customer }` |
| PUT | `/customers/:id` | Update customer | `Customer` | `{ data: Customer }` |
| DELETE | `/customers/:id` | Delete customer | - | `{ message }` |
| POST | `/customers/bulk` | Bulk create customers | `{ customers: Customer[] }` | `{ data: Customer[] }` |
| PUT | `/customers/bulk` | Bulk update customers | `{ customers: Customer[] }` | `{ data: Customer[] }` |
| DELETE | `/customers/bulk` | Bulk delete customers | `{ ids: string[] }` | `{ message }` |

### Vendors
| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/vendors` | Get all vendors | Query: `page, limit, search` | `{ data: Vendor[], pagination }` |
| GET | `/vendors/:id` | Get vendor by ID | - | `{ data: Vendor }` |
| POST | `/vendors` | Create vendor | `Vendor` | `{ data: Vendor }` |
| PUT | `/vendors/:id` | Update vendor | `Vendor` | `{ data: Vendor }` |
| DELETE | `/vendors/:id` | Delete vendor | - | `{ message }` |
| POST | `/vendors/bulk` | Bulk create vendors | `{ vendors: Vendor[] }` | `{ data: Vendor[] }` |
| PUT | `/vendors/bulk` | Bulk update vendors | `{ vendors: Vendor[] }` | `{ data: Vendor[] }` |
| DELETE | `/vendors/bulk` | Bulk delete vendors | `{ ids: string[] }` | `{ message }` |

### Items
| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/items` | Get all items | Query: `page, limit, search` | `{ data: Item[], pagination }` |
| GET | `/items/:id` | Get item by ID | - | `{ data: Item }` |
| POST | `/items` | Create item | `Item` | `{ data: Item }` |
| PUT | `/items/:id` | Update item | `Item` | `{ data: Item }` |
| DELETE | `/items/:id` | Delete item | - | `{ message }` |
| POST | `/items/bulk` | Bulk create items | `{ items: Item[] }` | `{ data: Item[] }` |
| PUT | `/items/bulk` | Bulk update items | `{ items: Item[] }` | `{ data: Item[] }` |
| DELETE | `/items/bulk` | Bulk delete items | `{ ids: string[] }` | `{ message }` |

## Sales & Purchase Orders

### Sales Orders
| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/salesorders` | Get all sales orders | Query: `page, limit, search` | `{ data: SalesOrder[], pagination }` |
| GET | `/salesorders/:id` | Get sales order by ID | - | `{ data: SalesOrder }` |
| POST | `/salesorders` | Create sales order | `SalesOrder` | `{ data: SalesOrder }` |
| PUT | `/salesorders/:id` | Update sales order | `SalesOrder` | `{ data: SalesOrder }` |
| DELETE | `/salesorders/:id` | Delete sales order | - | `{ message }` |
| PATCH | `/salesorders/:id/status` | Update order status | `{ status }` | `{ data: SalesOrder }` |

### Purchase Orders
| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/purchaseorders` | Get all purchase orders | Query: `page, limit, search` | `{ data: PurchaseOrder[], pagination }` |
| GET | `/purchaseorders/:id` | Get purchase order by ID | - | `{ data: PurchaseOrder }` |
| POST | `/purchaseorders` | Create purchase order | `PurchaseOrder` | `{ data: PurchaseOrder }` |
| PUT | `/purchaseorders/:id` | Update purchase order | `PurchaseOrder` | `{ data: PurchaseOrder }` |
| DELETE | `/purchaseorders/:id` | Delete purchase order | - | `{ message }` |
| PATCH | `/purchaseorders/:id/status` | Update order status | `{ status }` | `{ data: PurchaseOrder }` |

## Financial Modules

### Banks
| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/banks` | Get all banks | Query: `page, limit, search` | `{ data: Bank[], pagination }` |
| GET | `/banks/:id` | Get bank by ID | - | `{ data: Bank }` |
| POST | `/banks` | Create bank | `Bank` | `{ data: Bank }` |
| PUT | `/banks/:id` | Update bank | `Bank` | `{ data: Bank }` |
| DELETE | `/banks/:id` | Delete bank | - | `{ message }` |

### Accounts (Chart of Accounts)
| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/accounts` | Get all accounts | Query: `page, limit, search, hierarchy` | `{ data: Account[], pagination }` |
| GET | `/accounts/:id` | Get account by ID | - | `{ data: Account }` |
| POST | `/accounts` | Create account | `Account` | `{ data: Account }` |
| PUT | `/accounts/:id` | Update account | `Account` | `{ data: Account }` |
| DELETE | `/accounts/:id` | Delete account | - | `{ message }` |

### GL Journals
| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/gl-journals` | Get all journal entries | Query: `page, limit, search` | `{ data: JournalEntry[], pagination }` |
| GET | `/gl-journals/:id` | Get journal entry by ID | - | `{ data: JournalEntry }` |
| POST | `/gl-journals` | Create journal entry | `JournalEntry` | `{ data: JournalEntry }` |
| PUT | `/gl-journals/:id` | Update journal entry | `JournalEntry` | `{ data: JournalEntry }` |
| DELETE | `/gl-journals/:id` | Delete journal entry | - | `{ message }` |

## Inventory Management

### Sites
| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/sites` | Get all sites | Query: `page, limit, search` | `{ data: Site[], pagination }` |
| GET | `/sites/:id` | Get site by ID | - | `{ data: Site }` |
| POST | `/sites` | Create site | `Site` | `{ data: Site }` |
| PUT | `/sites/:id` | Update site | `Site` | `{ data: Site }` |
| DELETE | `/sites/:id` | Delete site | - | `{ message }` |

### Warehouses
| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/warehouses` | Get all warehouses | Query: `page, limit, search` | `{ data: Warehouse[], pagination }` |
| GET | `/warehouses/:id` | Get warehouse by ID | - | `{ data: Warehouse }` |
| POST | `/warehouses` | Create warehouse | `Warehouse` | `{ data: Warehouse }` |
| PUT | `/warehouses/:id` | Update warehouse | `Warehouse` | `{ data: Warehouse }` |
| DELETE | `/warehouses/:id` | Delete warehouse | - | `{ message }` |

## Common Query Parameters

### Pagination
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `sort`: Sort field (default: createdAt)
- `order`: Sort order (asc/desc, default: desc)

### Filtering
- `search`: Search term for text fields
- `status`: Filter by status
- `dateFrom`: Filter from date
- `dateTo`: Filter to date

### Example Request
```
GET /fms/api/v0/companies?page=1&limit=20&search=acme&sort=companyName&order=asc
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  },
  "message": "Success"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": { ... }
  }
}
```

## Authentication Headers

All API requests (except login/register) must include:

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## Rate Limiting

- **Limit**: 100 requests per 30 minutes per IP
- **Headers**: 
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset time

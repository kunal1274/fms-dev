import '@testing-library/jest-dom'
import { configure } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { rest } from 'msw'

// Configure testing library
configure({ testIdAttribute: 'data-testid' })

// Mock API server
export const server = setupServer(
  // Companies API
  rest.get('https://fms-qkmw.onrender.com/fms/api/v0/companies', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: [
          {
            id: '1',
            name: 'Test Company',
            email: 'test@company.com',
            phone: '+1234567890',
            address: '123 Test St',
            city: 'Test City',
            state: 'Test State',
            country: 'Test Country',
            postalCode: '12345',
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      })
    )
  }),

  // Customers API
  rest.get('https://fms-qkmw.onrender.com/fms/api/v0/customers', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: [
          {
            id: '1',
            name: 'Test Customer',
            email: 'customer@test.com',
            phone: '+1234567890',
            address: '123 Customer St',
            city: 'Customer City',
            state: 'Customer State',
            country: 'Customer Country',
            postalCode: '12345',
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      })
    )
  }),

  // Vendors API
  rest.get('https://fms-qkmw.onrender.com/fms/api/v0/vendors', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: [
          {
            id: '1',
            name: 'Test Vendor',
            email: 'vendor@test.com',
            phone: '+1234567890',
            address: '123 Vendor St',
            city: 'Vendor City',
            state: 'Vendor State',
            country: 'Vendor Country',
            postalCode: '12345',
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      })
    )
  }),

  // Items API
  rest.get('https://fms-qkmw.onrender.com/fms/api/v0/items', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: [
          {
            id: '1',
            name: 'Test Item',
            code: 'ITEM001',
            description: 'Test item description',
            category: 'Test Category',
            unit: 'pcs',
            unitPrice: 100,
            currentStock: 50,
            minimumStock: 10,
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      })
    )
  }),

  // Sales API
  rest.get('https://fms-qkmw.onrender.com/fms/api/v0/sales', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: [
          {
            id: '1',
            orderNumber: 'SO001',
            customerName: 'Test Customer',
            customerCode: 'CUST001',
            orderDate: '2024-01-01',
            totalAmount: 1000,
            currency: 'INR',
            status: 'Pending',
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      })
    )
  }),

  // Purchases API
  rest.get('https://fms-qkmw.onrender.com/fms/api/v0/purchases', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: [
          {
            id: '1',
            orderNumber: 'PO001',
            vendorName: 'Test Vendor',
            vendorCode: 'VEND001',
            orderDate: '2024-01-01',
            totalAmount: 1000,
            currency: 'INR',
            status: 'Pending',
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      })
    )
  }),

  // Banks API
  rest.get('https://fms-qkmw.onrender.com/fms/api/v0/banks', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: [
          {
            id: '1',
            accountNumber: '1234567890',
            bankName: 'Test Bank',
            accountHolderName: 'Test Account Holder',
            accountType: 'Current',
            currency: 'INR',
            currentBalance: 10000,
            status: 'Active',
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      })
    )
  }),

  // Taxes API
  rest.get('https://fms-qkmw.onrender.com/fms/api/v0/taxes', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: [
          {
            id: '1',
            name: 'GST',
            code: 'GST001',
            rate: 18,
            type: 'GST',
            status: 'Active',
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      })
    )
  }),

  // Audit API
  rest.get('https://fms-qkmw.onrender.com/fms/api/v0/audit', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: [
          {
            id: '1',
            entityType: 'Company',
            entityId: '1',
            action: 'CREATE',
            userId: '1',
            userName: 'Test User',
            userEmail: 'test@user.com',
            timestamp: '2024-01-01T00:00:00Z',
            description: 'Created company: Test Company',
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      })
    )
  }),

  // Error handling
  rest.get('*', (req, res, ctx) => {
    console.warn(`Unhandled request: ${req.method} ${req.url}`)
    return res(ctx.status(404), ctx.json({ error: 'Not found' }))
  })
)

// Setup and teardown
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null
  }
  disconnect() {
    return null
  }
  unobserve() {
    return null
  }
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {
    return null
  }
  disconnect() {
    return null
  }
  unobserve() {
    return null
  }
}

// Mock fetch
global.fetch = jest.fn()

// Mock console methods to reduce noise in tests
const originalError = console.error
const originalWarn = console.warn

beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalError.call(console, ...args)
  }

  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('componentWillReceiveProps') ||
        args[0].includes('componentWillMount'))
    ) {
      return
    }
    originalWarn.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
  console.warn = originalWarn
})

# ERP Frontend Component Documentation

## Overview

This document provides comprehensive documentation for all components in the ERP frontend system. The system is built with React 18, TypeScript, Tailwind CSS, and follows modern best practices for component architecture.

## Table of Contents

1. [UI Components](#ui-components)
2. [Layout Components](#layout-components)
3. [Form Components](#form-components)
4. [Data Components](#data-components)
5. [Business Components](#business-components)
6. [Utility Components](#utility-components)
7. [Performance Components](#performance-components)
8. [Testing Components](#testing-components)

---

## UI Components

### Button

A versatile button component with multiple variants and sizes.

**Location:** `src/components/ui/Button.tsx`

**Props:**
```typescript
interface ButtonProps {
  children: React.ReactNode
  variant?: 'default' | 'outline' | 'destructive' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  icon?: React.ReactNode
  as?: React.ElementType
  className?: string
  onClick?: () => void
}
```

**Usage:**
```tsx
import { Button } from '@/components/ui/Button'

// Basic usage
<Button>Click me</Button>

// With variant
<Button variant="outline">Outline Button</Button>

// With loading state
<Button loading>Loading...</Button>

// With icon
<Button icon={<PlusIcon />}>Add Item</Button>
```

### Card

A container component for grouping related content.

**Location:** `src/components/ui/Card.tsx`

**Props:**
```typescript
interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

interface CardContentProps {
  children: React.ReactNode
  className?: string
}
```

**Usage:**
```tsx
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/Card'

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
</Card>
```

### Modal

A modal dialog component for overlays and forms.

**Location:** `src/components/ui/Modal.tsx`

**Props:**
```typescript
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  children: React.ReactNode
}

interface FormModalProps extends ModalProps {
  onSubmit: (e: React.FormEvent) => void
}
```

**Usage:**
```tsx
import { Modal, FormModal } from '@/components/ui/Modal'

// Basic modal
<Modal isOpen={isOpen} onClose={onClose} title="Modal Title">
  Modal content
</Modal>

// Form modal
<FormModal 
  isOpen={isOpen} 
  onClose={onClose} 
  onSubmit={handleSubmit}
  title="Form Title"
>
  <form>Form content</form>
</FormModal>
```

---

## Layout Components

### DashboardLayout

Main layout component for the dashboard pages.

**Location:** `src/components/layout/DashboardLayout.tsx`

**Props:**
```typescript
interface DashboardLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
}
```

**Usage:**
```tsx
import { DashboardLayout } from '@/components/layout/DashboardLayout'

<DashboardLayout title="Dashboard" description="Main dashboard">
  <DashboardContent />
</DashboardLayout>
```

### MobileLayout

Responsive layout component optimized for mobile devices.

**Location:** `src/components/responsive/MobileLayout.tsx`

**Props:**
```typescript
interface MobileLayoutProps {
  children: React.ReactNode
  currentPage?: string
  onNavigate?: (page: string) => void
}
```

**Usage:**
```tsx
import { MobileLayout } from '@/components/responsive/MobileLayout'

<MobileLayout currentPage="dashboard" onNavigate={handleNavigate}>
  <PageContent />
</MobileLayout>
```

---

## Form Components

### FormField

A form field wrapper with label and error handling.

**Location:** `src/components/ui/Form.tsx`

**Props:**
```typescript
interface FormFieldProps {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
  className?: string
}
```

**Usage:**
```tsx
import { FormField, Input } from '@/components/ui/Form'

<FormField label="Name" error={errors.name?.message} required>
  <Input {...register('name')} placeholder="Enter name" />
</FormField>
```

### Input

A styled input component with validation support.

**Location:** `src/components/ui/Form.tsx`

**Props:**
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  className?: string
}
```

**Usage:**
```tsx
import { Input } from '@/components/ui/Form'

<Input 
  type="text" 
  placeholder="Enter text" 
  error={!!errors.field}
  {...register('field')} 
/>
```

### Select

A styled select component with options.

**Location:** `src/components/ui/Form.tsx`

**Props:**
```typescript
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: Array<{ value: string; label: string }>
  error?: boolean
  className?: string
}
```

**Usage:**
```tsx
import { Select } from '@/components/ui/Form'

<Select 
  options={[
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' }
  ]}
  error={!!errors.field}
  {...register('field')} 
/>
```

---

## Data Components

### DataTable

A comprehensive data table component with sorting, filtering, and pagination.

**Location:** `src/components/ui/DataTable.tsx`

**Props:**
```typescript
interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  title?: string
  description?: string
  onEdit?: (item: T) => void
  onView?: (item: T) => void
  onDelete?: (item: T) => void
  onBulkDelete?: (items: T[]) => void
  onExport?: (items: T[]) => void
  selectable?: boolean
  exportable?: boolean
  searchable?: boolean
  filterable?: boolean
  showPagination?: boolean
  pageSize?: number
  loading?: boolean
  error?: string
  customActions?: CustomAction<T>[]
}

interface Column<T> {
  key: string
  label: string
  sortable?: boolean
  render?: (value: any, item: T) => React.ReactNode
  width?: string
}
```

**Usage:**
```tsx
import { DataTable } from '@/components/ui/DataTable'

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'status', label: 'Status', render: (value) => <StatusBadge status={value} /> }
]

<DataTable
  data={users}
  columns={columns}
  title="Users"
  description="Manage system users"
  onEdit={handleEdit}
  onDelete={handleDelete}
  selectable
  exportable
  searchable
  filterable
  showPagination
  pageSize={20}
/>
```

### ResponsiveTable

A responsive table component that adapts to mobile devices.

**Location:** `src/components/responsive/ResponsiveTable.tsx`

**Props:**
```typescript
interface ResponsiveTableProps<T> {
  data: T[]
  columns: Array<{
    key: string
    label: string
    sortable?: boolean
    render?: (value: any, item: T) => React.ReactNode
    mobileHidden?: boolean
    priority?: number
  }>
  // ... other props similar to DataTable
}
```

**Usage:**
```tsx
import { ResponsiveTable } from '@/components/responsive/ResponsiveTable'

<ResponsiveTable
  data={data}
  columns={columns}
  title="Responsive Table"
  searchable
  filterable
  showPagination
/>
```

---

## Business Components

### CompanyForm

Form component for creating and editing companies.

**Location:** `src/pages/company/CompanyForm.tsx`

**Props:**
```typescript
interface CompanyFormProps {
  company?: Company | null
  onSuccess: () => void
  onCancel: () => void
}
```

**Usage:**
```tsx
import { CompanyForm } from '@/pages/company/CompanyForm'

<CompanyForm
  company={selectedCompany}
  onSuccess={handleSuccess}
  onCancel={handleCancel}
/>
```

### CustomerForm

Form component for creating and editing customers.

**Location:** `src/pages/customers/CustomerForm.tsx`

**Props:**
```typescript
interface CustomerFormProps {
  customer?: Customer | null
  onSuccess: () => void
  onCancel: () => void
}
```

**Usage:**
```tsx
import { CustomerForm } from '@/pages/customers/CustomerForm'

<CustomerForm
  customer={selectedCustomer}
  onSuccess={handleSuccess}
  onCancel={handleCancel}
/>
```

---

## Utility Components

### Loading

Loading state components including spinners and skeletons.

**Location:** `src/components/ui/Loading.tsx`

**Components:**
- `Spinner` - Basic loading spinner
- `DataTableSkeleton` - Skeleton for data tables
- `CardSkeleton` - Skeleton for cards
- `FormSkeleton` - Skeleton for forms

**Usage:**
```tsx
import { Spinner, DataTableSkeleton } from '@/components/ui/Loading'

// Basic spinner
<Spinner />

// Data table skeleton
<DataTableSkeleton />

// Custom skeleton
<CardSkeleton />
```

### Notification

Toast notification component for user feedback.

**Location:** `src/components/ui/Notification.tsx`

**Props:**
```typescript
interface NotificationProps {
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  onClose?: () => void
}
```

**Usage:**
```tsx
import { Notification } from '@/components/ui/Notification'

<Notification
  type="success"
  title="Success"
  message="Operation completed successfully"
  duration={3000}
/>
```

### FileUpload

File upload component with drag and drop support.

**Location:** `src/components/ui/FileUpload.tsx`

**Props:**
```typescript
interface FileUploadProps {
  onFileSelect: (file: File) => void
  accept?: string
  maxSize?: number
  multiple?: boolean
  className?: string
}
```

**Usage:**
```tsx
import { FileUpload } from '@/components/ui/FileUpload'

<FileUpload
  onFileSelect={handleFileSelect}
  accept=".pdf,.doc,.docx"
  maxSize={10 * 1024 * 1024} // 10MB
  multiple={false}
/>
```

---

## Performance Components

### LazyLoader

Components for lazy loading and code splitting.

**Location:** `src/components/performance/LazyLoader.tsx`

**Components:**
- `LazyDashboard` - Lazy loaded dashboard
- `LazyCompanies` - Lazy loaded companies page
- `LazyCustomers` - Lazy loaded customers page
- `withLazyLoading` - HOC for lazy loading

**Usage:**
```tsx
import { LazyDashboard, withLazyLoading } from '@/components/performance/LazyLoader'

// Lazy loaded component
<LazyDashboard />

// HOC for lazy loading
const LazyComponent = withLazyLoading(MyComponent)
```

### useMemoization

Custom hooks for performance optimization.

**Location:** `src/hooks/useMemoization.ts`

**Hooks:**
- `useDebounce` - Debounce values
- `useThrottle` - Throttle values
- `useMemoizedCallback` - Memoized callbacks
- `useMemoizedSearch` - Memoized search
- `useMemoizedFilter` - Memoized filtering

**Usage:**
```tsx
import { useDebounce, useMemoizedSearch } from '@/hooks/useMemoization'

const MyComponent = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  
  const filteredData = useMemoizedSearch(
    data,
    debouncedSearchTerm,
    (item, term) => item.name.toLowerCase().includes(term)
  )
  
  return (
    <div>
      <input 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {filteredData.map(item => <div key={item.id}>{item.name}</div>)}
    </div>
  )
}
```

---

## Testing Components

### Test Setup

Testing utilities and setup for the component library.

**Location:** `src/__tests__/setup.ts`

**Features:**
- MSW (Mock Service Worker) setup
- LocalStorage mocking
- IntersectionObserver mocking
- ResizeObserver mocking
- Console method mocking

**Usage:**
```tsx
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { server } from '../__tests__/setup'

// Test setup is automatically configured
describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })
})
```

---

## API Integration

### RTK Query APIs

API slices for data fetching and caching.

**Location:** `src/store/api/`

**Available APIs:**
- `companiesApi` - Company management
- `customersApi` - Customer management
- `vendorsApi` - Vendor management
- `itemsApi` - Item management
- `salesApi` - Sales management
- `purchasesApi` - Purchase management
- `banksApi` - Bank management
- `taxesApi` - Tax management
- `auditApi` - Audit logging

**Usage:**
```tsx
import { useGetCompaniesQuery, useCreateCompanyMutation } from '@/store/api'

const MyComponent = () => {
  const { data, isLoading, error } = useGetCompaniesQuery({ page: 1, limit: 10 })
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

## Best Practices

### Component Design

1. **Single Responsibility**: Each component should have a single, well-defined purpose
2. **Composition over Inheritance**: Use composition to build complex components
3. **Props Interface**: Always define TypeScript interfaces for props
4. **Default Props**: Provide sensible defaults for optional props
5. **Error Boundaries**: Wrap components in error boundaries for graceful error handling

### Performance

1. **Memoization**: Use React.memo, useMemo, and useCallback appropriately
2. **Lazy Loading**: Implement code splitting for large components
3. **Virtual Scrolling**: Use virtual scrolling for large lists
4. **Debouncing**: Debounce search and filter inputs
5. **Caching**: Implement proper caching strategies

### Accessibility

1. **ARIA Labels**: Provide proper ARIA labels and descriptions
2. **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
3. **Focus Management**: Manage focus properly in modals and forms
4. **Color Contrast**: Ensure sufficient color contrast for text
5. **Screen Reader Support**: Test with screen readers

### Testing

1. **Unit Tests**: Write unit tests for all components
2. **Integration Tests**: Test component interactions
3. **E2E Tests**: Test complete user workflows
4. **Mocking**: Mock external dependencies appropriately
5. **Coverage**: Maintain high test coverage

---

## Migration Guide

### From Old Components

When migrating from old JavaScript components to new TypeScript components:

1. **Update Imports**: Change import paths to new component locations
2. **Type Props**: Add TypeScript interfaces for component props
3. **Update Styling**: Replace old CSS classes with Tailwind classes
4. **Handle Events**: Update event handlers to use new patterns
5. **Test Changes**: Ensure all functionality works as expected

### Example Migration

**Old Component:**
```jsx
import { Button } from '../../Component/Button/Button'

<Button 
  variant="primary" 
  size="large" 
  onClick={handleClick}
>
  Click me
</Button>
```

**New Component:**
```tsx
import { Button } from '@/components/ui/Button'

<Button 
  variant="default" 
  size="lg" 
  onClick={handleClick}
>
  Click me
</Button>
```

---

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure correct import paths and component names
2. **Type Errors**: Check TypeScript interfaces and prop types
3. **Styling Issues**: Verify Tailwind classes are properly configured
4. **Performance Issues**: Use React DevTools to identify bottlenecks
5. **Testing Failures**: Check test setup and mocking configuration

### Getting Help

1. **Documentation**: Refer to this documentation first
2. **Code Examples**: Check existing component implementations
3. **TypeScript**: Use TypeScript compiler for type checking
4. **Linting**: Use ESLint for code quality issues
5. **Testing**: Run tests to identify functionality issues

---

## Conclusion

This component library provides a comprehensive set of reusable components for building modern, accessible, and performant ERP applications. Follow the best practices outlined in this documentation to ensure consistent and maintainable code.

For additional support or questions, please refer to the project repository or contact the development team.

# 🏢 Company Module Documentation

## Overview

The Company Module is a comprehensive solution for managing company information in the FMS ERP system. It provides full CRUD operations, file upload capabilities, and advanced features like search, pagination, and bulk operations.

## Features

### Core Features
- ✅ **Company CRUD Operations** - Create, Read, Update, Delete companies
- ✅ **Advanced Search & Filtering** - Search by name, code, email, etc.
- ✅ **Pagination** - Efficient handling of large datasets
- ✅ **File Upload** - Attach documents and files to companies
- ✅ **Validation** - Comprehensive form validation with Zod
- ✅ **Responsive Design** - Mobile-friendly interface
- ✅ **Real-time Updates** - RTK Query for efficient data management

### Advanced Features
- 🔄 **Bulk Operations** - Select and manage multiple companies
- 📊 **Company Metrics** - Analytics and reporting
- 📤 **Export Functionality** - Export to PDF, Excel, CSV
- 🏦 **Bank Details Management** - Multiple bank accounts per company
- 🧾 **Tax Information** - GST, PAN, TAN details
- 📍 **Multiple Addresses** - Primary, secondary, and shipping addresses

## API Integration

### Backend Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/companies` | Get all companies with pagination |
| `GET` | `/companies/:id` | Get company by ID |
| `POST` | `/companies` | Create new company |
| `PUT` | `/companies/:id` | Update company |
| `DELETE` | `/companies/:id` | Delete company |
| `DELETE` | `/companies/bulk` | Bulk delete companies |
| `GET` | `/companies/metrics` | Get company metrics |
| `POST` | `/companies/export` | Export companies |

### Frontend API Client

The Company module uses RTK Query for efficient API management:

```typescript
// API Hooks
useGetCompaniesQuery()     // Get companies with filters
useGetCompanyQuery(id)     // Get single company
useCreateCompanyMutation()  // Create company
useUpdateCompanyMutation() // Update company
useDeleteCompanyMutation() // Delete company
useBulkDeleteCompaniesMutation() // Bulk delete
useGetCompanyMetricsQuery() // Get metrics
useExportCompaniesMutation() // Export data
```

## Component Architecture

### 1. CompanyList Component
**File**: `src/pages/companies/CompanyList.tsx`

**Features**:
- Grid layout with company cards
- Search and filtering
- Pagination controls
- Bulk selection
- Action buttons (View, Edit, Delete)

**Props**:
```typescript
interface CompanyListProps {
  onAddCompany: () => void
  onEditCompany: (company: Company) => void
  onViewCompany: (company: Company) => void
}
```

### 2. CompanyForm Component
**File**: `src/pages/companies/CompanyForm.tsx`

**Features**:
- Comprehensive form with validation
- File upload support
- Real-time validation
- Create/Edit modes

**Props**:
```typescript
interface CompanyFormProps {
  company?: Company
  onSave: (company: Company) => void
  onCancel: () => void
}
```

### 3. CompanyDetail Component
**File**: `src/pages/companies/CompanyDetail.tsx`

**Features**:
- Complete company information display
- Bank details
- Tax information
- File attachments
- Action buttons

**Props**:
```typescript
interface CompanyDetailProps {
  companyId: string
  onEdit: (company: Company) => void
  onBack: () => void
}
```

### 4. CompaniesPage Component
**File**: `src/pages/companies/CompaniesPage.tsx`

**Features**:
- Main container component
- View mode management
- Navigation handling

## Data Models

### Company Interface
```typescript
interface Company {
  id: string
  companyName: string
  companyCode: string
  email: string
  contactNumber: string
  primaryGSTAddress: string
  secondaryOfficeAddress?: string
  tertiaryShippingAddress?: string
  businessType: string
  currency: string
  website?: string
  remarks?: string
  active: boolean
  bankDetails?: BankDetail[]
  taxInfo?: TaxInfo
  files?: FileAttachment[]
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy?: string
}
```

### Bank Detail Interface
```typescript
interface BankDetail {
  code: string
  type: 'Bank' | 'UPI' | 'BankAndUpi'
  bankNum: string
  name: string
  ifsc: string
  swift?: string
  accountHolderName?: string
  active: boolean
  qrDetails?: string
}
```

### Tax Info Interface
```typescript
interface TaxInfo {
  gstNumber?: string
  panNumber?: string
  tanNumber?: string
}
```

## Form Validation

The Company form uses Zod for comprehensive validation:

```typescript
const companySchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  companyCode: z.string().min(1, 'Company code is required'),
  email: z.string().email('Invalid email address'),
  contactNumber: z.string().min(10, 'Contact number must be at least 10 digits'),
  primaryGSTAddress: z.string().min(1, 'Primary GST address is required'),
  businessType: z.string().min(1, 'Business type is required'),
  currency: z.string().min(1, 'Currency is required'),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  remarks: z.string().optional(),
  active: z.boolean().default(true)
})
```

## Testing

### API Integration Tests
**File**: `test-scripts/company-api-test.js`

**Test Coverage**:
- ✅ CRUD operations
- ✅ Search functionality
- ✅ Pagination
- ✅ Validation
- ✅ Error handling
- ✅ Bulk operations

### Integration Tests
**File**: `test-scripts/company-integration-test.js`

**Test Coverage**:
- ✅ End-to-end API testing
- ✅ Data validation
- ✅ Error scenarios
- ✅ Performance testing

## Usage Examples

### 1. Basic Company Creation
```typescript
const [createCompany] = useCreateCompanyMutation()

const handleCreate = async (companyData: Company) => {
  try {
    const result = await createCompany(companyData).unwrap()
    toast.success('Company created successfully')
  } catch (error) {
    toast.error('Failed to create company')
  }
}
```

### 2. Company Search
```typescript
const { data: companies } = useGetCompaniesQuery({
  search: 'Tech',
  page: 1,
  limit: 10
})
```

### 3. Bulk Operations
```typescript
const [bulkDelete] = useBulkDeleteCompaniesMutation()

const handleBulkDelete = async (companyIds: string[]) => {
  try {
    await bulkDelete(companyIds).unwrap()
    toast.success('Companies deleted successfully')
  } catch (error) {
    toast.error('Failed to delete companies')
  }
}
```

## Error Handling

### API Error Handling
```typescript
try {
  const result = await createCompany(companyData).unwrap()
} catch (error) {
  if (error.status === 422) {
    // Validation errors
    toast.error('Please check your input data')
  } else if (error.status === 500) {
    // Server errors
    toast.error('Server error. Please try again')
  } else {
    // Other errors
    toast.error('An unexpected error occurred')
  }
}
```

### Form Validation Errors
```typescript
const { formState: { errors } } = useForm<CompanyFormData>({
  resolver: zodResolver(companySchema)
})

// Display errors in UI
{errors.companyName && (
  <p className="text-sm text-red-600">{errors.companyName.message}</p>
)}
```

## Performance Optimizations

### 1. RTK Query Caching
- Automatic caching of API responses
- Background refetching
- Optimistic updates
- Cache invalidation

### 2. Pagination
- Efficient data loading
- Virtual scrolling for large datasets
- Lazy loading of images

### 3. Search Debouncing
```typescript
const [searchTerm, setSearchTerm] = useState('')
const debouncedSearchTerm = useDebounce(searchTerm, 300)

const { data } = useGetCompaniesQuery({
  search: debouncedSearchTerm
})
```

## Security Considerations

### 1. Input Validation
- Client-side validation with Zod
- Server-side validation
- XSS protection
- SQL injection prevention

### 2. File Upload Security
- File type validation
- Size limits
- Virus scanning
- Secure storage

### 3. Authentication
- JWT token validation
- Role-based access control
- API endpoint protection

## Deployment

### Environment Variables
```bash
VITE_API_BASE=http://localhost:3000/fms/api/v0
VITE_UPLOAD_MAX_SIZE=10485760
VITE_ALLOWED_FILE_TYPES=pdf,doc,docx,jpg,png
```

### Build Configuration
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
```

## Troubleshooting

### Common Issues

1. **API Connection Issues**
   - Check backend server status
   - Verify API base URL
   - Check CORS configuration

2. **Form Validation Errors**
   - Ensure all required fields are filled
   - Check data types and formats
   - Verify Zod schema configuration

3. **File Upload Issues**
   - Check file size limits
   - Verify file type restrictions
   - Ensure proper MIME type handling

### Debug Mode
```typescript
// Enable RTK Query dev tools
const store = configureStore({
  reducer: {
    companiesApi: companiesApi.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(companiesApi.middleware)
})
```

## Future Enhancements

### Planned Features
- 🔄 **Advanced Analytics** - Company performance metrics
- 📊 **Dashboard Integration** - Company overview dashboard
- 🔔 **Notifications** - Real-time updates and alerts
- 📱 **Mobile App** - Native mobile application
- 🤖 **AI Integration** - Smart company data suggestions
- 🔗 **Third-party Integrations** - CRM and accounting software

### Technical Improvements
- ⚡ **Performance** - Virtual scrolling and lazy loading
- 🔒 **Security** - Enhanced authentication and authorization
- 📈 **Scalability** - Microservices architecture
- 🧪 **Testing** - Comprehensive test coverage
- 📚 **Documentation** - API documentation and guides

## Support

For technical support or questions about the Company module:

1. **Documentation**: Check this guide and API documentation
2. **Issues**: Report bugs and feature requests
3. **Community**: Join our developer community
4. **Support**: Contact our technical support team

---

**Last Updated**: October 2024  
**Version**: 1.0.0  
**Status**: Production Ready ✅

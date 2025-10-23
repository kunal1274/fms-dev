import React, { useState } from 'react'
import { useGetCompaniesQuery, useDeleteCompanyMutation } from '../../store/api/companies'
import { Company } from '../../types/models'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Download,
  Filter,
  MoreHorizontal
} from 'lucide-react'
import { toast } from 'sonner'

interface CompanyListProps {
  onAddCompany: () => void
  onEditCompany: (company: Company) => void
  onViewCompany: (company: Company) => void
}

export const CompanyList: React.FC<CompanyListProps> = ({
  onAddCompany,
  onEditCompany,
  onViewCompany
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])

  // API queries
  const { 
    data: companiesData, 
    isLoading, 
    error, 
    refetch 
  } = useGetCompaniesQuery({
    page,
    limit,
    search: searchTerm || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  const [deleteCompany] = useDeleteCompanyMutation()

  // Handle company deletion
  const handleDeleteCompany = async (companyId: string) => {
    // This will be handled by the parent component with custom dialog
    onDeleteCompany?.(companyId)
  }

  // Handle bulk selection
  const handleSelectCompany = (companyId: string) => {
    setSelectedCompanies(prev => 
      prev.includes(companyId) 
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    )
  }

  const handleSelectAll = () => {
    if (selectedCompanies.length === companiesData?.data.length) {
      setSelectedCompanies([])
    } else {
      setSelectedCompanies(companiesData?.data.map(company => company.id) || [])
    }
  }

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setPage(1) // Reset to first page when searching
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Failed to load companies</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    )
  }

  const companies = companiesData?.data || []
  const totalPages = Math.ceil((companiesData?.pagination?.total || 0) / limit)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
          <p className="text-gray-600">Manage your company information</p>
        </div>
        <Button onClick={onAddCompany} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Company
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <Card key={company.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {company.companyName}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {company.companyCode}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={company.active ? "default" : "secondary"}>
                    {company.active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSelectCompany(company.id)}
                    className={selectedCompanies.includes(company.id) ? 'bg-blue-100' : ''}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Email:</span>
                  <span className="text-sm text-gray-600">{company.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Phone:</span>
                  <span className="text-sm text-gray-600">{company.contactNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Business:</span>
                  <span className="text-sm text-gray-600">{company.businessType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Currency:</span>
                  <span className="text-sm text-gray-600">{company.currency}</span>
                </div>
              </div>

              {company.remarks && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {company.remarks}
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewCompany(company)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditCompany(company)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteCompany(company.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {companies.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Plus className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first company'}
          </p>
          {!searchTerm && (
            <Button onClick={onAddCompany}>
              Add Company
            </Button>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, companiesData?.pagination?.total || 0)} of {companiesData?.pagination?.total || 0} companies
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="px-3 py-1 text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedCompanies.length > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-2 flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {selectedCompanies.length} selected
          </span>
          <Button variant="outline" size="sm">
            Export Selected
          </Button>
          <Button variant="outline" size="sm" className="text-red-600">
            Delete Selected
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelectedCompanies([])}>
            Clear
          </Button>
        </div>
      )}
    </div>
  )
}

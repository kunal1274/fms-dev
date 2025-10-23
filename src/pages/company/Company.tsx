import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { DataTable } from '../../components/ui/DataTable'
import { Modal, FormModal } from '../../components/ui/Modal'
import { DataTableSkeleton } from '../../components/ui/Loading'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { PlusIcon } from '@heroicons/react/24/outline'
import { useGetCompaniesQuery, useDeleteCompanyMutation, useBulkDeleteCompaniesMutation } from '../../store/api/companies'
import type { Company, Column } from '../../types/models'
import CompanyForm from './CompanyForm'
import CompanyView from './CompanyView'
import { toast } from 'react-hot-toast'

const Company: React.FC = () => {
  const [view, setView] = useState<'list' | 'form' | 'view'>('list')
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false)
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null)
  const [companiesToDelete, setCompaniesToDelete] = useState<Company[]>([])
  const [isDeleting, setIsDeleting] = useState(false)

  const { data: companiesResponse, isLoading, error } = useGetCompaniesQuery({
    page: 1,
    limit: 50,
  })

  // Debug logging
  console.log('🔍 Company Component Debug:', {
    companiesResponse,
    isLoading,
    error,
    companies: companiesResponse?.data || [],
    count: companiesResponse?.count || 0
  })

  const [deleteCompany] = useDeleteCompanyMutation()
  const [bulkDeleteCompanies] = useBulkDeleteCompaniesMutation()

  const companies = companiesResponse?.data || []
  const pagination = companiesResponse?.pagination

  const handleAddNew = () => {
    setSelectedCompany(null)
    setIsFormModalOpen(true)
  }

  const handleEdit = (company: Company) => {
    setSelectedCompany(company)
    setIsFormModalOpen(true)
  }

  const handleView = (company: Company) => {
    setSelectedCompany(company)
    setIsViewModalOpen(true)
  }

  const handleDelete = (company: Company) => {
    setCompanyToDelete(company)
    setIsDeleteDialogOpen(true)
  }

  const handleBulkDelete = (selectedCompanies: Company[]) => {
    setCompaniesToDelete(selectedCompanies)
    setIsBulkDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!companyToDelete) return
    
    setIsDeleting(true)
    try {
      await deleteCompany(companyToDelete.id || companyToDelete._id || '').unwrap()
      toast.success(`${companyToDelete.companyName} deleted successfully`)
      setIsDeleteDialogOpen(false)
      setCompanyToDelete(null)
    } catch (error) {
      console.error('Failed to delete company:', error)
      toast.error('Failed to delete company')
    } finally {
      setIsDeleting(false)
    }
  }

  const confirmBulkDelete = async () => {
    if (companiesToDelete.length === 0) return
    
    setIsDeleting(true)
    try {
      const ids = companiesToDelete.map(company => company.id || company._id || '').filter(Boolean)
      await bulkDeleteCompanies(ids).unwrap()
      toast.success(`${companiesToDelete.length} companies deleted successfully`)
      setIsBulkDeleteDialogOpen(false)
      setCompaniesToDelete([])
    } catch (error) {
      console.error('Failed to delete companies:', error)
      toast.error('Failed to delete companies')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleExport = (selectedCompanies: Company[]) => {
    // TODO: Implement export functionality
    console.log('Export companies:', selectedCompanies)
  }

  const columns: Column<Company>[] = [
    {
      key: 'companyCode',
      label: 'Code',
      sortable: true,
      width: '120px',
    },
    {
      key: 'companyName',
      label: 'Company Name',
      sortable: true,
      render: (value, company) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{value}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{company.businessType}</div>
        </div>
      ),
    },
    {
      key: 'contactInfo.email',
      label: 'Email',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">{value || '-'}</span>
      ),
    },
    {
      key: 'contactInfo.phone',
      label: 'Phone',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">{value || '-'}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            value === 'Active'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : value === 'Inactive'
              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {value ? new Date(value).toLocaleDateString() : '-'}
        </span>
      ),
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Company Management</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your company information and settings
            </p>
          </div>
          <Button disabled>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Company
          </Button>
        </div>
        <DataTableSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Company Management</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your company information and settings
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600 dark:text-red-400">
              Failed to load companies. Please try again.
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Company Management</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your company information and settings
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Company
        </Button>
      </div>

      <DataTable
        data={companies}
        columns={columns}
        title="Companies"
        description="Manage your company information and settings"
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        onExport={handleExport}
        selectable
        exportable
        searchable
        filterable
        showPagination
        pageSize={20}
      />

      {/* Form Modal */}
      <FormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={(e) => {
          e.preventDefault()
          // Form submission is handled by CompanyForm component
        }}
        title={selectedCompany ? 'Edit Company' : 'Add New Company'}
        description={selectedCompany ? 'Update company information' : 'Create a new company'}
        submitText={selectedCompany ? 'Update Company' : 'Create Company'}
        cancelText="Cancel"
        size="xl"
      >
        <CompanyForm
          company={selectedCompany}
          onSuccess={() => setIsFormModalOpen(false)}
          onCancel={() => setIsFormModalOpen(false)}
        />
      </FormModal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Company Details"
        size="lg"
      >
        {selectedCompany && (
          <CompanyView
            company={selectedCompany}
            onEdit={() => {
              setIsViewModalOpen(false)
              setSelectedCompany(selectedCompany)
              setIsFormModalOpen(true)
            }}
          />
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setCompanyToDelete(null)
        }}
        onConfirm={confirmDelete}
        title="Delete Company"
        message={`Are you sure you want to delete "${companyToDelete?.companyName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isBulkDeleteDialogOpen}
        onClose={() => {
          setIsBulkDeleteDialogOpen(false)
          setCompaniesToDelete([])
        }}
        onConfirm={confirmBulkDelete}
        title="Delete Companies"
        message={`Are you sure you want to delete ${companiesToDelete.length} selected companies? This action cannot be undone.`}
        confirmText="Delete All"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}

export default Company
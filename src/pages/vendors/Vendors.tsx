import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { DataTable } from '../../components/ui/DataTable'
import { Modal, FormModal } from '../../components/ui/Modal'
import { DataTableSkeleton } from '../../components/ui/Loading'
import { PlusIcon } from '@heroicons/react/24/outline'
import { useGetVendorsQuery, useDeleteVendorMutation, useBulkDeleteVendorsMutation } from '../../store/api'
import type { Vendor, Column } from '../../types/models'
import VendorForm from './VendorForm'
import VendorView from './VendorView'

const Vendors: React.FC = () => {
  const [view, setView] = useState<'list' | 'form' | 'view'>('list')
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  const { data: vendorsResponse, isLoading, error } = useGetVendorsQuery({
    page: 1,
    limit: 50,
  })

  const [deleteVendor] = useDeleteVendorMutation()
  const [bulkDeleteVendors] = useBulkDeleteVendorsMutation()

  const vendors = vendorsResponse?.data || []
  const pagination = vendorsResponse?.pagination

  const handleAddNew = () => {
    setSelectedVendor(null)
    setIsFormModalOpen(true)
  }

  const handleEdit = (vendor: Vendor) => {
    setSelectedVendor(vendor)
    setIsFormModalOpen(true)
  }

  const handleView = (vendor: Vendor) => {
    setSelectedVendor(vendor)
    setIsViewModalOpen(true)
  }

  const handleDelete = async (vendor: Vendor) => {
    if (window.confirm(`Are you sure you want to delete ${vendor.vendorName}?`)) {
      try {
        await deleteVendor(vendor.id || vendor._id || '').unwrap()
      } catch (error) {
        console.error('Failed to delete vendor:', error)
      }
    }
  }

  const handleBulkDelete = async (selectedVendors: Vendor[]) => {
    if (window.confirm(`Are you sure you want to delete ${selectedVendors.length} vendors?`)) {
      try {
        const ids = selectedVendors.map(vendor => vendor.id || vendor._id || '').filter(Boolean)
        await bulkDeleteVendors(ids).unwrap()
      } catch (error) {
        console.error('Failed to delete vendors:', error)
      }
    }
  }

  const handleExport = (selectedVendors: Vendor[]) => {
    // TODO: Implement export functionality
    console.log('Export vendors:', selectedVendors)
  }

  const columns: Column<Vendor>[] = [
    {
      key: 'vendorCode',
      label: 'Code',
      sortable: true,
      width: '120px',
    },
    {
      key: 'vendorName',
      label: 'Vendor Name',
      sortable: true,
      render: (value, vendor) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{value}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{vendor.businessType}</div>
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Vendor Management</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your vendor information and relationships
            </p>
          </div>
          <Button disabled>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Vendor
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Vendor Management</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your vendor information and relationships
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600 dark:text-red-400">
              Failed to load vendors. Please try again.
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Vendor Management</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your vendor information and relationships
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Vendor
        </Button>
      </div>

      <DataTable
        data={vendors}
        columns={columns}
        title="Vendors"
        description="Manage your vendor information and relationships"
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
          // Handle form submission
          setIsFormModalOpen(false)
        }}
        title={selectedVendor ? 'Edit Vendor' : 'Add New Vendor'}
        description={selectedVendor ? 'Update vendor information' : 'Create a new vendor'}
        size="lg"
      >
        <VendorForm
          vendor={selectedVendor}
          onSuccess={() => setIsFormModalOpen(false)}
          onCancel={() => setIsFormModalOpen(false)}
        />
      </FormModal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Vendor Details"
        size="lg"
      >
        {selectedVendor && (
          <VendorView
            vendor={selectedVendor}
            onEdit={() => {
              setIsViewModalOpen(false)
              setSelectedVendor(selectedVendor)
              setIsFormModalOpen(true)
            }}
          />
        )}
      </Modal>
    </div>
  )
}

export default Vendors

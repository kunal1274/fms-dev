import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { DataTable } from '../../components/ui/DataTable'
import { Modal, FormModal } from '../../components/ui/Modal'
import { DataTableSkeleton } from '../../components/ui/Loading'
import { PlusIcon } from '@heroicons/react/24/outline'
import { useGetCustomersQuery, useDeleteCustomerMutation, useBulkDeleteCustomersMutation } from '../../store/api'
import type { Customer, Column } from '../../types/models'
import CustomerForm from './CustomerForm'
import CustomerView from './CustomerView'

const Customers: React.FC = () => {
  const [view, setView] = useState<'list' | 'form' | 'view'>('list')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  const { data: customersResponse, isLoading, error } = useGetCustomersQuery({
    page: 1,
    limit: 50,
  })

  const [deleteCustomer] = useDeleteCustomerMutation()
  const [bulkDeleteCustomers] = useBulkDeleteCustomersMutation()

  const customers = customersResponse?.data || []
  const pagination = customersResponse?.pagination

  const handleAddNew = () => {
    setSelectedCustomer(null)
    setIsFormModalOpen(true)
  }

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsFormModalOpen(true)
  }

  const handleView = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsViewModalOpen(true)
  }

  const handleDelete = async (customer: Customer) => {
    if (window.confirm(`Are you sure you want to delete ${customer.customerName}?`)) {
      try {
        await deleteCustomer(customer.id || customer._id || '').unwrap()
      } catch (error) {
        console.error('Failed to delete customer:', error)
      }
    }
  }

  const handleBulkDelete = async (selectedCustomers: Customer[]) => {
    if (window.confirm(`Are you sure you want to delete ${selectedCustomers.length} customers?`)) {
      try {
        const ids = selectedCustomers.map(customer => customer.id || customer._id || '').filter(Boolean)
        await bulkDeleteCustomers(ids).unwrap()
      } catch (error) {
        console.error('Failed to delete customers:', error)
      }
    }
  }

  const handleExport = (selectedCustomers: Customer[]) => {
    // TODO: Implement export functionality
    console.log('Export customers:', selectedCustomers)
  }

  const columns: Column<Customer>[] = [
    {
      key: 'customerCode',
      label: 'Code',
      sortable: true,
      width: '120px',
    },
    {
      key: 'customerName',
      label: 'Customer Name',
      sortable: true,
      render: (value, customer) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{value}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{customer.businessType}</div>
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Customer Management</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your customer information and relationships
            </p>
          </div>
          <Button disabled>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Customer
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Customer Management</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your customer information and relationships
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600 dark:text-red-400">
              Failed to load customers. Please try again.
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Customer Management</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your customer information and relationships
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      <DataTable
        data={customers}
        columns={columns}
        title="Customers"
        description="Manage your customer information and relationships"
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
        title={selectedCustomer ? 'Edit Customer' : 'Add New Customer'}
        description={selectedCustomer ? 'Update customer information' : 'Create a new customer'}
        size="lg"
      >
        <CustomerForm
          customer={selectedCustomer}
          onSuccess={() => setIsFormModalOpen(false)}
          onCancel={() => setIsFormModalOpen(false)}
        />
      </FormModal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Customer Details"
        size="lg"
      >
        {selectedCustomer && (
          <CustomerView
            customer={selectedCustomer}
            onEdit={() => {
              setIsViewModalOpen(false)
              setSelectedCustomer(selectedCustomer)
              setIsFormModalOpen(true)
            }}
          />
        )}
      </Modal>
    </div>
  )
}

export default Customers

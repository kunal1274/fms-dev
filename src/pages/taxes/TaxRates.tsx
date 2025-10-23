import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { DataTable } from '../../components/ui/DataTable'
import { Modal, FormModal } from '../../components/ui/Modal'
import { DataTableSkeleton } from '../../components/ui/Loading'
import { PlusIcon } from '@heroicons/react/24/outline'
import { useGetTaxRatesQuery, useDeleteTaxRateMutation, useBulkDeleteTaxRatesMutation } from '../../store/api'
import type { TaxRate, Column } from '../../types/models'
import TaxRateForm from './TaxRateForm'
import TaxRateView from './TaxRateView'

const TaxRates: React.FC = () => {
  const [view, setView] = useState<'list' | 'form' | 'view'>('list')
  const [selectedRate, setSelectedRate] = useState<TaxRate | null>(null)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  const { data: ratesResponse, isLoading, error } = useGetTaxRatesQuery({
    page: 1,
    limit: 50,
  })

  const [deleteRate] = useDeleteTaxRateMutation()
  const [bulkDeleteRates] = useBulkDeleteTaxRatesMutation()

  const rates = ratesResponse?.data || []
  const pagination = ratesResponse?.pagination

  const handleAddNew = () => {
    setSelectedRate(null)
    setIsFormModalOpen(true)
  }

  const handleEdit = (rate: TaxRate) => {
    setSelectedRate(rate)
    setIsFormModalOpen(true)
  }

  const handleView = (rate: TaxRate) => {
    setSelectedRate(rate)
    setIsViewModalOpen(true)
  }

  const handleDelete = async (rate: TaxRate) => {
    if (window.confirm(`Are you sure you want to delete tax rate ${rate.name}?`)) {
      try {
        await deleteRate(rate.id || rate._id || '').unwrap()
      } catch (error) {
        console.error('Failed to delete tax rate:', error)
      }
    }
  }

  const handleBulkDelete = async (selectedRates: TaxRate[]) => {
    if (window.confirm(`Are you sure you want to delete ${selectedRates.length} tax rates?`)) {
      try {
        const ids = selectedRates.map(rate => rate.id || rate._id || '').filter(Boolean)
        await bulkDeleteRates(ids).unwrap()
      } catch (error) {
        console.error('Failed to delete tax rates:', error)
      }
    }
  }

  const handleExport = (selectedRates: TaxRate[]) => {
    // TODO: Implement export functionality
    console.log('Export tax rates:', selectedRates)
  }

  const columns: Column<TaxRate>[] = [
    {
      key: 'name',
      label: 'Tax Name',
      sortable: true,
      render: (value, rate) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{value}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{rate.code}</div>
        </div>
      ),
    },
    {
      key: 'rate',
      label: 'Rate (%)',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {value ? `${value}%` : '-'}
        </span>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">{value || '-'}</span>
      ),
    },
    {
      key: 'effectiveFrom',
      label: 'Effective From',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {value ? new Date(value).toLocaleDateString() : '-'}
        </span>
      ),
    },
    {
      key: 'effectiveTo',
      label: 'Effective To',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {value ? new Date(value).toLocaleDateString() : '-'}
        </span>
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tax Rates</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your tax rates and tax configurations
            </p>
          </div>
          <Button disabled>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Tax Rate
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tax Rates</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your tax rates and tax configurations
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600 dark:text-red-400">
              Failed to load tax rates. Please try again.
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tax Rates</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your tax rates and tax configurations
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Tax Rate
        </Button>
      </div>

      <DataTable
        data={rates}
        columns={columns}
        title="Tax Rates"
        description="Manage your tax rates and tax configurations"
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
        title={selectedRate ? 'Edit Tax Rate' : 'Add New Tax Rate'}
        description={selectedRate ? 'Update tax rate information' : 'Create a new tax rate'}
        size="lg"
      >
        <TaxRateForm
          rate={selectedRate}
          onSuccess={() => setIsFormModalOpen(false)}
          onCancel={() => setIsFormModalOpen(false)}
        />
      </FormModal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Tax Rate Details"
        size="lg"
      >
        {selectedRate && (
          <TaxRateView
            rate={selectedRate}
            onEdit={() => {
              setIsViewModalOpen(false)
              setSelectedRate(selectedRate)
              setIsFormModalOpen(true)
            }}
          />
        )}
      </Modal>
    </div>
  )
}

export default TaxRates

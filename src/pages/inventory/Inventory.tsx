import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { DataTable } from '../../components/ui/DataTable'
import { Modal, FormModal } from '../../components/ui/Modal'
import { DataTableSkeleton } from '../../components/ui/Loading'
import { PlusIcon } from '@heroicons/react/24/outline'
import { useGetItemsQuery, useDeleteItemMutation, useBulkDeleteItemsMutation } from '../../store/api'
import type { Item, Column } from '../../types/models'
import ItemForm from './ItemForm'
import ItemView from './ItemView'

const Inventory: React.FC = () => {
  const [view, setView] = useState<'list' | 'form' | 'view'>('list')
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  const { data: itemsResponse, isLoading, error } = useGetItemsQuery({
    page: 1,
    limit: 50,
  })

  const [deleteItem] = useDeleteItemMutation()
  const [bulkDeleteItems] = useBulkDeleteItemsMutation()

  const items = itemsResponse?.data || []
  const pagination = itemsResponse?.pagination

  const handleAddNew = () => {
    setSelectedItem(null)
    setIsFormModalOpen(true)
  }

  const handleEdit = (item: Item) => {
    setSelectedItem(item)
    setIsFormModalOpen(true)
  }

  const handleView = (item: Item) => {
    setSelectedItem(item)
    setIsViewModalOpen(true)
  }

  const handleDelete = async (item: Item) => {
    if (window.confirm(`Are you sure you want to delete ${item.itemName}?`)) {
      try {
        await deleteItem(item.id || item._id || '').unwrap()
      } catch (error) {
        console.error('Failed to delete item:', error)
      }
    }
  }

  const handleBulkDelete = async (selectedItems: Item[]) => {
    if (window.confirm(`Are you sure you want to delete ${selectedItems.length} items?`)) {
      try {
        const ids = selectedItems.map(item => item.id || item._id || '').filter(Boolean)
        await bulkDeleteItems(ids).unwrap()
      } catch (error) {
        console.error('Failed to delete items:', error)
      }
    }
  }

  const handleExport = (selectedItems: Item[]) => {
    // TODO: Implement export functionality
    console.log('Export items:', selectedItems)
  }

  const columns: Column<Item>[] = [
    {
      key: 'itemCode',
      label: 'Code',
      sortable: true,
      width: '120px',
    },
    {
      key: 'itemName',
      label: 'Item Name',
      sortable: true,
      render: (value, item) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{value}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{item.category}</div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">{value || '-'}</span>
      ),
    },
    {
      key: 'currentStock',
      label: 'Stock',
      sortable: true,
      render: (value, item) => (
        <div className="text-center">
          <div className="font-medium text-gray-900 dark:text-white">{value || 0}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{item.unit}</div>
        </div>
      ),
    },
    {
      key: 'unitPrice',
      label: 'Unit Price',
      sortable: true,
      render: (value, item) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {value ? `${item.currency} ${value.toFixed(2)}` : '-'}
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Inventory Management</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your inventory items and stock levels
            </p>
          </div>
          <Button disabled>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Item
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Inventory Management</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your inventory items and stock levels
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600 dark:text-red-400">
              Failed to load items. Please try again.
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Inventory Management</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your inventory items and stock levels
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      <DataTable
        data={items}
        columns={columns}
        title="Inventory Items"
        description="Manage your inventory items and stock levels"
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
        title={selectedItem ? 'Edit Item' : 'Add New Item'}
        description={selectedItem ? 'Update item information' : 'Create a new inventory item'}
        size="lg"
      >
        <ItemForm
          item={selectedItem}
          onSuccess={() => setIsFormModalOpen(false)}
          onCancel={() => setIsFormModalOpen(false)}
        />
      </FormModal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Item Details"
        size="lg"
      >
        {selectedItem && (
          <ItemView
            item={selectedItem}
            onEdit={() => {
              setIsViewModalOpen(false)
              setSelectedItem(selectedItem)
              setIsFormModalOpen(true)
            }}
          />
        )}
      </Modal>
    </div>
  )
}

export default Inventory
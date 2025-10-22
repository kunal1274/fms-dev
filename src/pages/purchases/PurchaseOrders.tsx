import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { DataTable } from '../../components/ui/DataTable'
import { Modal, FormModal } from '../../components/ui/Modal'
import { DataTableSkeleton } from '../../components/ui/Loading'
import { PlusIcon } from '@heroicons/react/24/outline'
import { useGetPurchaseOrdersQuery, useDeletePurchaseOrderMutation, useBulkDeletePurchaseOrdersMutation } from '../../store/api'
import type { PurchaseOrder, Column } from '../../types/models'
import PurchaseOrderForm from './PurchaseOrderForm'
import PurchaseOrderView from './PurchaseOrderView'

const PurchaseOrders: React.FC = () => {
  const [view, setView] = useState<'list' | 'form' | 'view'>('list')
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  const { data: ordersResponse, isLoading, error } = useGetPurchaseOrdersQuery({
    page: 1,
    limit: 50,
  })

  const [deleteOrder] = useDeletePurchaseOrderMutation()
  const [bulkDeleteOrders] = useBulkDeletePurchaseOrdersMutation()

  const orders = ordersResponse?.data || []
  const pagination = ordersResponse?.pagination

  const handleAddNew = () => {
    setSelectedOrder(null)
    setIsFormModalOpen(true)
  }

  const handleEdit = (order: PurchaseOrder) => {
    setSelectedOrder(order)
    setIsFormModalOpen(true)
  }

  const handleView = (order: PurchaseOrder) => {
    setSelectedOrder(order)
    setIsViewModalOpen(true)
  }

  const handleDelete = async (order: PurchaseOrder) => {
    if (window.confirm(`Are you sure you want to delete order ${order.orderNumber}?`)) {
      try {
        await deleteOrder(order.id || order._id || '').unwrap()
      } catch (error) {
        console.error('Failed to delete order:', error)
      }
    }
  }

  const handleBulkDelete = async (selectedOrders: PurchaseOrder[]) => {
    if (window.confirm(`Are you sure you want to delete ${selectedOrders.length} orders?`)) {
      try {
        const ids = selectedOrders.map(order => order.id || order._id || '').filter(Boolean)
        await bulkDeleteOrders(ids).unwrap()
      } catch (error) {
        console.error('Failed to delete orders:', error)
      }
    }
  }

  const handleExport = (selectedOrders: PurchaseOrder[]) => {
    // TODO: Implement export functionality
    console.log('Export orders:', selectedOrders)
  }

  const columns: Column<PurchaseOrder>[] = [
    {
      key: 'orderNumber',
      label: 'Order #',
      sortable: true,
      width: '120px',
    },
    {
      key: 'vendorName',
      label: 'Vendor',
      sortable: true,
      render: (value, order) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{value}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{order.vendorCode}</div>
        </div>
      ),
    },
    {
      key: 'orderDate',
      label: 'Order Date',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {value ? new Date(value).toLocaleDateString() : '-'}
        </span>
      ),
    },
    {
      key: 'totalAmount',
      label: 'Total Amount',
      sortable: true,
      render: (value, order) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {value ? `${order.currency} ${value.toFixed(2)}` : '-'}
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
            value === 'Completed'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : value === 'Pending'
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              : value === 'Cancelled'
              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Purchase Orders</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your purchase orders and vendor transactions
            </p>
          </div>
          <Button disabled>
            <PlusIcon className="h-4 w-4 mr-2" />
            New Order
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Purchase Orders</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your purchase orders and vendor transactions
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600 dark:text-red-400">
              Failed to load purchase orders. Please try again.
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Purchase Orders</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your purchase orders and vendor transactions
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <PlusIcon className="h-4 w-4 mr-2" />
          New Order
        </Button>
      </div>

      <DataTable
        data={orders}
        columns={columns}
        title="Purchase Orders"
        description="Manage your purchase orders and vendor transactions"
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
        title={selectedOrder ? 'Edit Purchase Order' : 'Create New Purchase Order'}
        description={selectedOrder ? 'Update purchase order information' : 'Create a new purchase order'}
        size="xl"
      >
        <PurchaseOrderForm
          order={selectedOrder}
          onSuccess={() => setIsFormModalOpen(false)}
          onCancel={() => setIsFormModalOpen(false)}
        />
      </FormModal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Purchase Order Details"
        size="xl"
      >
        {selectedOrder && (
          <PurchaseOrderView
            order={selectedOrder}
            onEdit={() => {
              setIsViewModalOpen(false)
              setSelectedOrder(selectedOrder)
              setIsFormModalOpen(true)
            }}
          />
        )}
      </Modal>
    </div>
  )
}

export default PurchaseOrders

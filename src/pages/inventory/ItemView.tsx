import React from 'react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { PencilIcon } from '@heroicons/react/24/outline'
import type { Item } from '../../types/models'

interface ItemViewProps {
  item: Item
  onEdit: () => void
}

const ItemView: React.FC<ItemViewProps> = ({ item, onEdit }) => {
  const formatDimensions = (dimensions: any) => {
    if (!dimensions) return '-'
    const parts = []
    if (dimensions.length) parts.push(`L: ${dimensions.length}cm`)
    if (dimensions.width) parts.push(`W: ${dimensions.width}cm`)
    if (dimensions.height) parts.push(`H: ${dimensions.height}cm`)
    if (dimensions.weight) parts.push(`Weight: ${dimensions.weight}kg`)
    return parts.length > 0 ? parts.join(', ') : '-'
  }

  const getStockStatus = (currentStock: number, minimumStock: number) => {
    if (currentStock <= 0) return { status: 'Out of Stock', color: 'text-red-600 dark:text-red-400' }
    if (currentStock <= minimumStock) return { status: 'Low Stock', color: 'text-yellow-600 dark:text-yellow-400' }
    return { status: 'In Stock', color: 'text-green-600 dark:text-green-400' }
  }

  const stockStatus = getStockStatus(item.currentStock || 0, item.minimumStock || 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {item.itemName}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {item.itemCode} • {item.category}
          </p>
        </div>
        <Button onClick={onEdit}>
          <PencilIcon className="h-4 w-4 mr-2" />
          Edit Item
        </Button>
      </div>

      {/* Status Badge */}
      <div className="flex gap-2">
        <span
          className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
            item.status === 'Active'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : item.status === 'Inactive'
              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              : item.status === 'Discontinued'
              ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
          }`}
        >
          {item.status}
        </span>
        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${stockStatus.color}`}>
          {stockStatus.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Item Code
              </label>
              <p className="text-gray-900 dark:text-white">{item.itemCode}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Category
              </label>
              <p className="text-gray-900 dark:text-white">{item.category}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Sub Category
              </label>
              <p className="text-gray-900 dark:text-white">{item.subCategory || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Unit
              </label>
              <p className="text-gray-900 dark:text-white">{item.unit}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Description
              </label>
              <p className="text-gray-900 dark:text-white">{item.description || '-'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Information */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Unit Price
              </label>
              <p className="text-gray-900 dark:text-white">
                {item.unitPrice ? `${item.currency} ${item.unitPrice.toFixed(2)}` : '-'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Cost Price
              </label>
              <p className="text-gray-900 dark:text-white">
                {item.costPrice ? `${item.currency} ${item.costPrice.toFixed(2)}` : '-'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Currency
              </label>
              <p className="text-gray-900 dark:text-white">{item.currency}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Tax Rate
              </label>
              <p className="text-gray-900 dark:text-white">
                {item.taxRate ? `${item.taxRate}%` : '-'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stock Information */}
        <Card>
          <CardHeader>
            <CardTitle>Stock Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Current Stock
              </label>
              <p className="text-gray-900 dark:text-white">{item.currentStock || 0} {item.unit}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Minimum Stock
              </label>
              <p className="text-gray-900 dark:text-white">{item.minimumStock || 0} {item.unit}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Maximum Stock
              </label>
              <p className="text-gray-900 dark:text-white">{item.maximumStock || 0} {item.unit}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Reorder Level
              </label>
              <p className="text-gray-900 dark:text-white">{item.reorderLevel || 0} {item.unit}</p>
            </div>
          </CardContent>
        </Card>

        {/* Dimensions */}
        <Card>
          <CardHeader>
            <CardTitle>Dimensions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-900 dark:text-white">
              {formatDimensions(item.dimensions)}
            </p>
          </CardContent>
        </Card>

        {/* Supplier Information */}
        {item.supplierInfo && (
          <Card>
            <CardHeader>
              <CardTitle>Supplier Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Supplier Name
                </label>
                <p className="text-gray-900 dark:text-white">{item.supplierInfo.supplierName || '-'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Supplier Code
                </label>
                <p className="text-gray-900 dark:text-white">{item.supplierInfo.supplierCode || '-'}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tracking Information */}
        <Card>
          <CardHeader>
            <CardTitle>Tracking Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Serialized
              </label>
              <p className="text-gray-900 dark:text-white">
                {item.isSerialized ? 'Yes' : 'No'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Batch Tracked
              </label>
              <p className="text-gray-900 dark:text-white">
                {item.isBatchTracked ? 'Yes' : 'No'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Remarks */}
        {item.remarks && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Remarks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-900 dark:text-white">{item.remarks}</p>
            </CardContent>
          </Card>
        )}

        {/* System Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Created At
                </label>
                <p className="text-gray-900 dark:text-white">
                  {item.createdAt ? new Date(item.createdAt).toLocaleString() : '-'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Updated At
                </label>
                <p className="text-gray-900 dark:text-white">
                  {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : '-'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Active
                </label>
                <p className="text-gray-900 dark:text-white">
                  {item.isActive ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ItemView

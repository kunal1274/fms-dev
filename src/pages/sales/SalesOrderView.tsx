import React from 'react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { PencilIcon } from '@heroicons/react/24/outline'
import type { SalesOrder } from '../../types/models'

interface SalesOrderViewProps {
  order: SalesOrder
  onEdit: () => void
}

const SalesOrderView: React.FC<SalesOrderViewProps> = ({ order, onEdit }) => {
  const formatAddress = (address: any) => {
    if (!address) return '-'
    const parts = [
      address.street,
      address.city,
      address.state,
      address.country,
      address.postalCode,
    ].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : '-'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'Cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'Processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'Shipped':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'Delivered':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Order #{order.orderNumber}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {order.customerName} • {order.currency} {order.totalAmount?.toFixed(2)}
          </p>
        </div>
        <Button onClick={onEdit}>
          <PencilIcon className="h-4 w-4 mr-2" />
          Edit Order
        </Button>
      </div>

      {/* Status Badge */}
      <div>
        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Information */}
        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Order Number
              </label>
              <p className="text-gray-900 dark:text-white">{order.orderNumber}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Customer
              </label>
              <p className="text-gray-900 dark:text-white">{order.customerName}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{order.customerCode}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Order Date
              </label>
              <p className="text-gray-900 dark:text-white">
                {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : '-'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Delivery Date
              </label>
              <p className="text-gray-900 dark:text-white">
                {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : '-'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Payment Terms
              </label>
              <p className="text-gray-900 dark:text-white">{order.paymentTerms || '-'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Subtotal
              </label>
              <p className="text-gray-900 dark:text-white">
                {order.currency} {order.subtotal?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Tax Amount
              </label>
              <p className="text-gray-900 dark:text-white">
                {order.currency} {order.taxAmount?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Discount Amount
              </label>
              <p className="text-gray-900 dark:text-white">
                {order.currency} {order.discountAmount?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="border-t pt-4">
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Amount
              </label>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {order.currency} {order.totalAmount?.toFixed(2) || '0.00'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {order.items?.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.itemName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {item.itemCode}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {order.currency} {item.unitPrice?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {order.currency} {item.totalPrice?.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Address */}
        {order.shippingAddress && (
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-900 dark:text-white">
                {formatAddress(order.shippingAddress)}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {order.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-900 dark:text-white">{order.notes}</p>
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
                  {order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Updated At
                </label>
                <p className="text-gray-900 dark:text-white">
                  {order.updatedAt ? new Date(order.updatedAt).toLocaleString() : '-'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Active
                </label>
                <p className="text-gray-900 dark:text-white">
                  {order.isActive ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SalesOrderView

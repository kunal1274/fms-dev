import React from 'react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { PencilIcon } from '@heroicons/react/24/outline'
import type { Customer } from '../../types/models'

interface CustomerViewProps {
  customer: Customer
  onEdit: () => void
}

const CustomerView: React.FC<CustomerViewProps> = ({ customer, onEdit }) => {
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

  const formatBankDetails = (bankDetails: any[]) => {
    if (!bankDetails || bankDetails.length === 0) return '-'
    return bankDetails.map((bank, index) => (
      <div key={index} className="mb-2 p-3 bg-gray-50 dark:bg-gray-800 rounded">
        <div className="font-medium">{bank.bankName}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {bank.accountNumber} - {bank.accountHolderName}
        </div>
        {bank.ifscCode && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            IFSC: {bank.ifscCode}
          </div>
        )}
        {bank.branchName && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Branch: {bank.branchName}
          </div>
        )}
      </div>
    ))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {customer.customerName}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {customer.customerCode} • {customer.businessType}
          </p>
        </div>
        <Button onClick={onEdit}>
          <PencilIcon className="h-4 w-4 mr-2" />
          Edit Customer
        </Button>
      </div>

      {/* Status Badge */}
      <div>
        <span
          className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
            customer.status === 'Active'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : customer.status === 'Inactive'
              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              : customer.status === 'Blacklisted'
              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
          }`}
        >
          {customer.status}
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
                Customer Code
              </label>
              <p className="text-gray-900 dark:text-white">{customer.customerCode}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Business Type
              </label>
              <p className="text-gray-900 dark:text-white">{customer.businessType}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Currency
              </label>
              <p className="text-gray-900 dark:text-white">{customer.currency}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Payment Terms
              </label>
              <p className="text-gray-900 dark:text-white">{customer.paymentTerms || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Credit Limit
              </label>
              <p className="text-gray-900 dark:text-white">
                {customer.creditLimit ? `${customer.currency} ${customer.creditLimit.toLocaleString()}` : '-'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Outstanding Balance
              </label>
              <p className="text-gray-900 dark:text-white">
                {customer.outstandingBalance ? `${customer.currency} ${customer.outstandingBalance.toLocaleString()}` : '-'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Email
              </label>
              <p className="text-gray-900 dark:text-white">{customer.contactInfo?.email || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Phone
              </label>
              <p className="text-gray-900 dark:text-white">{customer.contactInfo?.phone || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Mobile
              </label>
              <p className="text-gray-900 dark:text-white">{customer.contactInfo?.mobile || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Website
              </label>
              <p className="text-gray-900 dark:text-white">
                {customer.contactInfo?.website ? (
                  <a
                    href={customer.contactInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {customer.contactInfo.website}
                  </a>
                ) : '-'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Primary Address */}
        <Card>
          <CardHeader>
            <CardTitle>Primary Address</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-900 dark:text-white">
              {formatAddress(customer.primaryAddress)}
            </p>
          </CardContent>
        </Card>

        {/* Secondary Address */}
        {customer.secondaryAddress && (
          <Card>
            <CardHeader>
              <CardTitle>Secondary Address</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-900 dark:text-white">
                {formatAddress(customer.secondaryAddress)}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Shipping Address */}
        {customer.shippingAddress && (
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-900 dark:text-white">
                {formatAddress(customer.shippingAddress)}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Tax Information */}
        <Card>
          <CardHeader>
            <CardTitle>Tax Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                GST Number
              </label>
              <p className="text-gray-900 dark:text-white">{customer.taxInfo?.gstNumber || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                PAN Number
              </label>
              <p className="text-gray-900 dark:text-white">{customer.taxInfo?.panNumber || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                TAN Number
              </label>
              <p className="text-gray-900 dark:text-white">{customer.taxInfo?.tanNumber || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Tax Rate
              </label>
              <p className="text-gray-900 dark:text-white">
                {customer.taxInfo?.taxRate ? `${customer.taxInfo.taxRate}%` : '-'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Bank Details */}
        <Card>
          <CardHeader>
            <CardTitle>Bank Details</CardTitle>
          </CardHeader>
          <CardContent>
            {formatBankDetails(customer.bankDetails)}
          </CardContent>
        </Card>

        {/* Remarks */}
        {customer.remarks && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Remarks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-900 dark:text-white">{customer.remarks}</p>
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
                  {customer.createdAt ? new Date(customer.createdAt).toLocaleString() : '-'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Updated At
                </label>
                <p className="text-gray-900 dark:text-white">
                  {customer.updatedAt ? new Date(customer.updatedAt).toLocaleString() : '-'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Active
                </label>
                <p className="text-gray-900 dark:text-white">
                  {customer.isActive ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CustomerView

import React from 'react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { PencilIcon } from '@heroicons/react/24/outline'
import type { BankAccount } from '../../types/models'

interface BankAccountViewProps {
  account: BankAccount
  onEdit: () => void
}

const BankAccountView: React.FC<BankAccountViewProps> = ({ account, onEdit }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'Inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'Closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      case 'Suspended':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
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
            {account.bankName}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {account.accountNumber} • {account.accountHolderName}
          </p>
        </div>
        <Button onClick={onEdit}>
          <PencilIcon className="h-4 w-4 mr-2" />
          Edit Account
        </Button>
      </div>

      {/* Status Badge */}
      <div className="flex gap-2">
        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(account.status)}`}>
          {account.status}
        </span>
        {account.isPrimary && (
          <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Primary Account
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Account Number
              </label>
              <p className="text-gray-900 dark:text-white">{account.accountNumber}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Bank Name
              </label>
              <p className="text-gray-900 dark:text-white">{account.bankName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Account Holder
              </label>
              <p className="text-gray-900 dark:text-white">{account.accountHolderName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Account Type
              </label>
              <p className="text-gray-900 dark:text-white">{account.accountType}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Currency
              </label>
              <p className="text-gray-900 dark:text-white">{account.currency}</p>
            </div>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Current Balance
              </label>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {account.currency} {account.currentBalance?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Minimum Balance
              </label>
              <p className="text-gray-900 dark:text-white">
                {account.currency} {account.minimumBalance?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Available Balance
              </label>
              <p className="text-gray-900 dark:text-white">
                {account.currency} {((account.currentBalance || 0) - (account.minimumBalance || 0)).toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Bank Details */}
        <Card>
          <CardHeader>
            <CardTitle>Bank Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                IFSC Code
              </label>
              <p className="text-gray-900 dark:text-white">{account.ifscCode || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                SWIFT Code
              </label>
              <p className="text-gray-900 dark:text-white">{account.swiftCode || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Branch Name
              </label>
              <p className="text-gray-900 dark:text-white">{account.branchName || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Branch Address
              </label>
              <p className="text-gray-900 dark:text-white">{account.branchAddress || '-'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Account Dates */}
        <Card>
          <CardHeader>
            <CardTitle>Account Dates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Opening Date
              </label>
              <p className="text-gray-900 dark:text-white">
                {account.openingDate ? new Date(account.openingDate).toLocaleDateString() : '-'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Closing Date
              </label>
              <p className="text-gray-900 dark:text-white">
                {account.closingDate ? new Date(account.closingDate).toLocaleDateString() : '-'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Created At
              </label>
              <p className="text-gray-900 dark:text-white">
                {account.createdAt ? new Date(account.createdAt).toLocaleString() : '-'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Updated At
              </label>
              <p className="text-gray-900 dark:text-white">
                {account.updatedAt ? new Date(account.updatedAt).toLocaleString() : '-'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Remarks */}
        {account.remarks && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Remarks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-900 dark:text-white">{account.remarks}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default BankAccountView

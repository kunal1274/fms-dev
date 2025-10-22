import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { DataTable } from '../../components/ui/DataTable'
import { Modal, FormModal } from '../../components/ui/Modal'
import { DataTableSkeleton } from '../../components/ui/Loading'
import { PlusIcon } from '@heroicons/react/24/outline'
import { useGetBankAccountsQuery, useDeleteBankAccountMutation, useBulkDeleteBankAccountsMutation } from '../../store/api'
import type { BankAccount, Column } from '../../types/models'
import BankAccountForm from './BankAccountForm'
import BankAccountView from './BankAccountView'

const BankAccounts: React.FC = () => {
  const [view, setView] = useState<'list' | 'form' | 'view'>('list')
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  const { data: accountsResponse, isLoading, error } = useGetBankAccountsQuery({
    page: 1,
    limit: 50,
  })

  const [deleteAccount] = useDeleteBankAccountMutation()
  const [bulkDeleteAccounts] = useBulkDeleteBankAccountsMutation()

  const accounts = accountsResponse?.data || []
  const pagination = accountsResponse?.pagination

  const handleAddNew = () => {
    setSelectedAccount(null)
    setIsFormModalOpen(true)
  }

  const handleEdit = (account: BankAccount) => {
    setSelectedAccount(account)
    setIsFormModalOpen(true)
  }

  const handleView = (account: BankAccount) => {
    setSelectedAccount(account)
    setIsViewModalOpen(true)
  }

  const handleDelete = async (account: BankAccount) => {
    if (window.confirm(`Are you sure you want to delete account ${account.accountNumber}?`)) {
      try {
        await deleteAccount(account.id || account._id || '').unwrap()
      } catch (error) {
        console.error('Failed to delete account:', error)
      }
    }
  }

  const handleBulkDelete = async (selectedAccounts: BankAccount[]) => {
    if (window.confirm(`Are you sure you want to delete ${selectedAccounts.length} accounts?`)) {
      try {
        const ids = selectedAccounts.map(account => account.id || account._id || '').filter(Boolean)
        await bulkDeleteAccounts(ids).unwrap()
      } catch (error) {
        console.error('Failed to delete accounts:', error)
      }
    }
  }

  const handleExport = (selectedAccounts: BankAccount[]) => {
    // TODO: Implement export functionality
    console.log('Export accounts:', selectedAccounts)
  }

  const columns: Column<BankAccount>[] = [
    {
      key: 'accountNumber',
      label: 'Account #',
      sortable: true,
      width: '150px',
    },
    {
      key: 'bankName',
      label: 'Bank Name',
      sortable: true,
      render: (value, account) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{value}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{account.accountHolderName}</div>
        </div>
      ),
    },
    {
      key: 'accountType',
      label: 'Type',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">{value || '-'}</span>
      ),
    },
    {
      key: 'currentBalance',
      label: 'Balance',
      sortable: true,
      render: (value, account) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {value ? `${account.currency} ${value.toFixed(2)}` : '-'}
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bank Accounts</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your bank accounts and financial transactions
            </p>
          </div>
          <Button disabled>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Account
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bank Accounts</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your bank accounts and financial transactions
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600 dark:text-red-400">
              Failed to load bank accounts. Please try again.
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bank Accounts</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your bank accounts and financial transactions
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Account
        </Button>
      </div>

      <DataTable
        data={accounts}
        columns={columns}
        title="Bank Accounts"
        description="Manage your bank accounts and financial transactions"
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
        title={selectedAccount ? 'Edit Bank Account' : 'Add New Bank Account'}
        description={selectedAccount ? 'Update bank account information' : 'Create a new bank account'}
        size="lg"
      >
        <BankAccountForm
          account={selectedAccount}
          onSuccess={() => setIsFormModalOpen(false)}
          onCancel={() => setIsFormModalOpen(false)}
        />
      </FormModal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Bank Account Details"
        size="lg"
      >
        {selectedAccount && (
          <BankAccountView
            account={selectedAccount}
            onEdit={() => {
              setIsViewModalOpen(false)
              setSelectedAccount(selectedAccount)
              setIsFormModalOpen(true)
            }}
          />
        )}
      </Modal>
    </div>
  )
}

export default BankAccounts

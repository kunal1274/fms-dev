import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PlusIcon } from '@heroicons/react/24/outline'

const Finance: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Financial Management</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage accounts, transactions, and financial reports
          </p>
        </div>
        <Button>
          <PlusIcon className="h-4 w-4 mr-2" />
          New Transaction
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Financial Overview</CardTitle>
          <CardDescription>
            Bank accounts, transactions, and financial reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center text-gray-500 dark:text-gray-400">
            Financial management interface will be implemented here
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Finance
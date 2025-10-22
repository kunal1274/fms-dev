import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { PlusIcon } from '@heroicons/react/24/outline'

const Purchase: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Purchase Management</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage purchase orders, receipts, and vendors
          </p>
        </div>
        <Button>
          <PlusIcon className="h-4 w-4 mr-2" />
          New Purchase
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Purchase Overview</CardTitle>
          <CardDescription>
            Purchase orders, receipts, and vendor management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center text-gray-500 dark:text-gray-400">
            Purchase management interface will be implemented here
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Purchase
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PlusIcon } from '@heroicons/react/24/outline'

const Company: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Company Management</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your company information and settings
          </p>
        </div>
        <Button>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Company
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>
            View and edit your company details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center text-gray-500 dark:text-gray-400">
            Company management interface will be implemented here
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Company
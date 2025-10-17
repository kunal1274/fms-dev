import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PlusIcon } from '@heroicons/react/24/outline'

const Reports: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Generate reports and view business analytics
          </p>
        </div>
        <Button>
          <PlusIcon className="h-4 w-4 mr-2" />
          New Report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Builder</CardTitle>
          <CardDescription>
            Create custom reports and analytics dashboards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center text-gray-500 dark:text-gray-400">
            Report builder interface will be implemented here
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Reports
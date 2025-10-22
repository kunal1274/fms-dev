import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { RefreshIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline'
import DashboardWidgets from '../../components/dashboard/DashboardWidgets'
import Charts from '../../components/dashboard/Charts'
import { useGetCompaniesQuery, useGetCustomersQuery, useGetVendorsQuery, useGetItemsQuery } from '../../store/api'

const Dashboard: React.FC = () => {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch data for dashboard widgets
  const { data: companiesData, isLoading: companiesLoading } = useGetCompaniesQuery({ page: 1, limit: 1 })
  const { data: customersData, isLoading: customersLoading } = useGetCustomersQuery({ page: 1, limit: 1 })
  const { data: vendorsData, isLoading: vendorsLoading } = useGetVendorsQuery({ page: 1, limit: 1 })
  const { data: itemsData, isLoading: itemsLoading } = useGetItemsQuery({ page: 1, limit: 1 })

  const isLoading = companiesLoading || customersLoading || vendorsLoading || itemsLoading

  // Mock data for demonstration
  const dashboardData = {
    totalCompanies: companiesData?.pagination?.total || 0,
    totalCustomers: customersData?.pagination?.total || 0,
    totalVendors: vendorsData?.pagination?.total || 0,
    totalItems: itemsData?.pagination?.total || 0,
    totalSales: 125000,
    totalPurchases: 85000,
    pendingOrders: 12,
    lowStockItems: 8,
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLastUpdated(new Date())
    setIsRefreshing(false)
  }

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date())
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Welcome to your ERP dashboard. Here's an overview of your business.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshIcon className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Widgets */}
      <DashboardWidgets data={dashboardData} isLoading={isLoading} />

      {/* Charts Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h2>
          <div className="flex items-center space-x-2">
            <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
            <span className="text-sm text-green-600 dark:text-green-400">+12% this month</span>
          </div>
        </div>
        <Charts isLoading={isLoading} />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales Orders</CardTitle>
            <CardDescription>
              Latest sales orders and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { id: 'SO-001', customer: 'ABC Corp', amount: '$2,500', status: 'Completed' },
                { id: 'SO-002', customer: 'XYZ Ltd', amount: '$1,800', status: 'Processing' },
                { id: 'SO-003', customer: 'DEF Inc', amount: '$3,200', status: 'Pending' },
                { id: 'SO-004', customer: 'GHI Co', amount: '$950', status: 'Shipped' },
              ].map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{order.id}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">{order.amount}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.status === 'Completed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : order.status === 'Processing'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : order.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low Stock Items</CardTitle>
            <CardDescription>
              Items that need restocking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Laptop Pro 15"', current: 5, minimum: 10, category: 'Electronics' },
                { name: 'Office Chair', current: 3, minimum: 8, category: 'Furniture' },
                { name: 'Wireless Mouse', current: 12, minimum: 20, category: 'Electronics' },
                { name: 'Desk Lamp', current: 2, minimum: 5, category: 'Furniture' },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {item.current}/{item.minimum}
                    </p>
                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${(item.current / item.minimum) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <span className="text-sm font-medium">New Sale</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <span className="text-sm font-medium">New Purchase</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <span className="text-sm font-medium">Add Customer</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <span className="text-sm font-medium">Add Vendor</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard
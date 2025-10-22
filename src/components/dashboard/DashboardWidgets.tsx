import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { 
  BuildingOfficeIcon, 
  UserGroupIcon, 
  TruckIcon, 
  CubeIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

interface DashboardWidgetsProps {
  data?: {
    totalCompanies: number
    totalCustomers: number
    totalVendors: number
    totalItems: number
    totalSales: number
    totalPurchases: number
    pendingOrders: number
    lowStockItems: number
  }
  isLoading?: boolean
}

const DashboardWidgets: React.FC<DashboardWidgetsProps> = ({ data, isLoading = false }) => {
  const widgets = [
    {
      title: 'Total Companies',
      value: data?.totalCompanies || 0,
      icon: BuildingOfficeIcon,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      title: 'Total Customers',
      value: data?.totalCustomers || 0,
      icon: UserGroupIcon,
      color: 'bg-green-500',
      change: '+8%',
      changeType: 'positive' as const,
    },
    {
      title: 'Total Vendors',
      value: data?.totalVendors || 0,
      icon: TruckIcon,
      color: 'bg-purple-500',
      change: '+5%',
      changeType: 'positive' as const,
    },
    {
      title: 'Total Items',
      value: data?.totalItems || 0,
      icon: CubeIcon,
      color: 'bg-orange-500',
      change: '+15%',
      changeType: 'positive' as const,
    },
    {
      title: 'Total Sales',
      value: data?.totalSales || 0,
      icon: CurrencyDollarIcon,
      color: 'bg-emerald-500',
      change: '+22%',
      changeType: 'positive' as const,
    },
    {
      title: 'Total Purchases',
      value: data?.totalPurchases || 0,
      icon: ChartBarIcon,
      color: 'bg-indigo-500',
      change: '+18%',
      changeType: 'positive' as const,
    },
    {
      title: 'Pending Orders',
      value: data?.pendingOrders || 0,
      icon: ExclamationTriangleIcon,
      color: 'bg-yellow-500',
      change: '-3%',
      changeType: 'negative' as const,
    },
    {
      title: 'Low Stock Items',
      value: data?.lowStockItems || 0,
      icon: CheckCircleIcon,
      color: 'bg-red-500',
      change: '+2%',
      changeType: 'negative' as const,
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="ml-4 flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {widgets.map((widget, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${widget.color}`}>
                <widget.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {widget.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {widget.value.toLocaleString()}
                </p>
                <p className={`text-sm ${
                  widget.changeType === 'positive' 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {widget.change} from last month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default DashboardWidgets

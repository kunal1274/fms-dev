import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  ShoppingBagIcon,
  CubeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline'

const Dashboard: React.FC = () => {
  const stats = [
    {
      name: 'Total Revenue',
      value: '$45,231.89',
      change: '+20.1%',
      changeType: 'positive',
      icon: CurrencyDollarIcon,
    },
    {
      name: 'Total Sales',
      value: '2,350',
      change: '+15.3%',
      changeType: 'positive',
      icon: ShoppingCartIcon,
    },
    {
      name: 'Total Purchases',
      value: '1,234',
      change: '-2.4%',
      changeType: 'negative',
      icon: ShoppingBagIcon,
    },
    {
      name: 'Inventory Items',
      value: '5,432',
      change: '+8.2%',
      changeType: 'positive',
      icon: CubeIcon,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Welcome back! Here's what's happening with your business today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon
                    className="h-8 w-8 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {stat.value}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.changeType === 'positive' ? (
                          <ArrowTrendingUpIcon className="h-4 w-4 flex-shrink-0 self-center" />
                        ) : (
                          <ArrowTrendingDownIcon className="h-4 w-4 flex-shrink-0 self-center" />
                        )}
                        <span className="sr-only">
                          {stat.changeType === 'positive' ? 'Increased' : 'Decreased'} by
                        </span>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>
              Monthly revenue for the past 12 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
              Chart component will be implemented here
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest transactions and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">
                    New sale order #SO-001 created
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    2 minutes ago
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">
                    Inventory updated for Item #IT-001
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    15 minutes ago
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 bg-yellow-400 rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">
                    Purchase order #PO-001 approved
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    1 hour ago
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
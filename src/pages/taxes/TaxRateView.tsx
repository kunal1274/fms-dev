import React from 'react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { PencilIcon } from '@heroicons/react/24/outline'
import type { TaxRate } from '../../types/models'

interface TaxRateViewProps {
  rate: TaxRate
  onEdit: () => void
}

const TaxRateView: React.FC<TaxRateViewProps> = ({ rate, onEdit }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'Inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'Expired':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      case 'Suspended':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const isCurrentlyEffective = () => {
    const now = new Date()
    const effectiveFrom = rate.effectiveFrom ? new Date(rate.effectiveFrom) : null
    const effectiveTo = rate.effectiveTo ? new Date(rate.effectiveTo) : null
    
    if (!effectiveFrom) return false
    if (effectiveTo && now > effectiveTo) return false
    if (now < effectiveFrom) return false
    
    return true
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {rate.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {rate.code} • {rate.rate}% • {rate.type}
          </p>
        </div>
        <Button onClick={onEdit}>
          <PencilIcon className="h-4 w-4 mr-2" />
          Edit Tax Rate
        </Button>
      </div>

      {/* Status Badges */}
      <div className="flex gap-2">
        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(rate.status)}`}>
          {rate.status}
        </span>
        {rate.isDefault && (
          <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Default Tax Rate
          </span>
        )}
        {isCurrentlyEffective() && (
          <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Currently Effective
          </span>
        )}
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
                Tax Name
              </label>
              <p className="text-gray-900 dark:text-white">{rate.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Tax Code
              </label>
              <p className="text-gray-900 dark:text-white">{rate.code}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Tax Rate
              </label>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {rate.rate}%
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Tax Type
              </label>
              <p className="text-gray-900 dark:text-white">{rate.type}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Description
              </label>
              <p className="text-gray-900 dark:text-white">{rate.description || '-'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Effective Dates */}
        <Card>
          <CardHeader>
            <CardTitle>Effective Dates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Effective From
              </label>
              <p className="text-gray-900 dark:text-white">
                {rate.effectiveFrom ? new Date(rate.effectiveFrom).toLocaleDateString() : '-'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Effective To
              </label>
              <p className="text-gray-900 dark:text-white">
                {rate.effectiveTo ? new Date(rate.effectiveTo).toLocaleDateString() : 'No expiry'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Duration
              </label>
              <p className="text-gray-900 dark:text-white">
                {rate.effectiveFrom && rate.effectiveTo
                  ? `${Math.ceil((new Date(rate.effectiveTo).getTime() - new Date(rate.effectiveFrom).getTime()) / (1000 * 60 * 60 * 24))} days`
                  : rate.effectiveFrom
                  ? 'Ongoing'
                  : '-'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Status
              </label>
              <p className="text-gray-900 dark:text-white">{rate.status}</p>
            </div>
          </CardContent>
        </Card>

        {/* Applicable To */}
        {rate.applicableTo && rate.applicableTo.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Applicable To</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {rate.applicableTo.map((item, index) => (
                  <span
                    key={index}
                    className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Exemptions */}
        {rate.exemptions && rate.exemptions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Exemptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {rate.exemptions.map((exemption, index) => (
                  <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                    • {exemption}
                  </div>
                ))}
              </div>
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
                  {rate.createdAt ? new Date(rate.createdAt).toLocaleString() : '-'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Updated At
                </label>
                <p className="text-gray-900 dark:text-white">
                  {rate.updatedAt ? new Date(rate.updatedAt).toLocaleString() : '-'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Active
                </label>
                <p className="text-gray-900 dark:text-white">
                  {rate.isActive ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Remarks */}
        {rate.remarks && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Remarks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-900 dark:text-white">{rate.remarks}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default TaxRateView

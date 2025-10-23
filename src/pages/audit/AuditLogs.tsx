import React, { useState } from 'react'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { DataTable } from '../../components/ui/DataTable'
import { Modal } from '../../components/ui/Modal'
import { DocumentArrowDownIcon, EyeIcon, FunnelIcon } from '@heroicons/react/24/outline'
import { useGetAuditLogsQuery, useGetAuditStatsQuery, useExportAuditLogsMutation } from '../../store/api'
import type { AuditLog } from '../../types/audit'

const AuditLogs: React.FC = () => {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    entityType: '',
    action: '',
    dateFrom: '',
    dateTo: '',
    search: '',
  })

  const { data: logsResponse, isLoading, error } = useGetAuditLogsQuery(filters)
  const { data: statsResponse } = useGetAuditStatsQuery({
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
  })
  const [exportLogs] = useExportAuditLogsMutation()

  const logs = logsResponse?.data || []
  const stats = statsResponse?.data

  const handleView = (log: AuditLog) => {
    setSelectedLog(log)
    setIsViewModalOpen(true)
  }

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      const blob = await exportLogs({ format, filters }).unwrap()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const handleBulkExport = (selectedLogs: AuditLog[]) => {
    // TODO: Implement bulk export
    console.log('Bulk export logs:', selectedLogs)
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'DELETE':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'VIEW':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      case 'EXPORT':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'LOGIN':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
      case 'LOGOUT':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const columns = [
    {
      key: 'timestamp',
      label: 'Timestamp',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(value).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      sortable: true,
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(value)}`}>
          {value}
        </span>
      ),
    },
    {
      key: 'entityType',
      label: 'Entity',
      sortable: true,
      render: (value: string, log: AuditLog) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{value}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">ID: {log.entityId}</div>
        </div>
      ),
    },
    {
      key: 'userName',
      label: 'User',
      sortable: true,
      render: (value: string, log: AuditLog) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{value}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{log.userEmail}</div>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (value: string) => (
        <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
          {value || '-'}
        </span>
      ),
    },
    {
      key: 'ipAddress',
      label: 'IP Address',
      render: (value: string) => (
        <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
          {value || '-'}
        </span>
      ),
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Audit Logs</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Track all system activities and changes
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Audit Logs</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Track all system activities and changes
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600 dark:text-red-400">
              Failed to load audit logs. Please try again.
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Audit Logs</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Track all system activities and changes
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => handleExport('pdf')}>
            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport('excel')}>
            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
            CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-500">
                  <FunnelIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Logs</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalLogs}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-500">
                  <FunnelIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Actions</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Object.keys(stats.logsByAction).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-500">
                  <FunnelIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Entities</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Object.keys(stats.logsByEntity).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-orange-500">
                  <FunnelIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Users</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Object.keys(stats.logsByUser).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Audit Logs Table */}
      <DataTable
        data={logs}
        columns={columns}
        title="Audit Logs"
        description="Track all system activities and changes"
        onView={handleView}
        onBulkDelete={handleBulkExport}
        onExport={handleBulkExport}
        selectable
        exportable
        searchable
        filterable
        showPagination
        pageSize={20}
        customActions={[
          {
            label: 'View Details',
            icon: EyeIcon,
            onClick: handleView,
          },
        ]}
      />

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Audit Log Details"
        size="lg"
      >
        {selectedLog && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Action</label>
                <p className="text-gray-900 dark:text-white">{selectedLog.action}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Timestamp</label>
                <p className="text-gray-900 dark:text-white">
                  {new Date(selectedLog.timestamp).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Entity Type</label>
                <p className="text-gray-900 dark:text-white">{selectedLog.entityType}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Entity ID</label>
                <p className="text-gray-900 dark:text-white">{selectedLog.entityId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">User</label>
                <p className="text-gray-900 dark:text-white">{selectedLog.userName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedLog.userEmail}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">IP Address</label>
                <p className="text-gray-900 dark:text-white font-mono">{selectedLog.ipAddress}</p>
              </div>
            </div>

            {selectedLog.description && (
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</label>
                <p className="text-gray-900 dark:text-white">{selectedLog.description}</p>
              </div>
            )}

            {selectedLog.changes && selectedLog.changes.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Changes</label>
                <div className="mt-2 space-y-2">
                  {selectedLog.changes.map((change, index) => (
                    <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="font-medium text-gray-900 dark:text-white">{change.field}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="text-red-600 dark:text-red-400">- {JSON.stringify(change.oldValue)}</span>
                        <br />
                        <span className="text-green-600 dark:text-green-400">+ {JSON.stringify(change.newValue)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedLog.metadata && (
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Metadata</label>
                <pre className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm overflow-auto">
                  {JSON.stringify(selectedLog.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AuditLogs

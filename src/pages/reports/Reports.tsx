import React, { useState } from 'react'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { DataTable } from '../../components/ui/DataTable'
import { Modal } from '../../components/ui/Modal'
import { PlusIcon, DocumentTextIcon, ChartBarIcon, TableCellsIcon } from '@heroicons/react/24/outline'
import ReportBuilder from '../../components/reports/ReportBuilder'

interface Report {
  id: string
  name: string
  type: string
  description: string
  createdAt: string
  lastRun: string
  status: 'active' | 'inactive'
}

const Reports: React.FC = () => {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false)
  const [, setSelectedReport] = useState<Report | null>(null)

  // Mock data for demonstration
  const reports: Report[] = [
    {
      id: '1',
      name: 'Monthly Sales Report',
      type: 'sales',
      description: 'Comprehensive monthly sales analysis',
      createdAt: '2024-01-15',
      lastRun: '2024-01-20',
      status: 'active',
    },
    {
      id: '2',
      name: 'Inventory Status Report',
      type: 'inventory',
      description: 'Current inventory levels and stock status',
      createdAt: '2024-01-10',
      lastRun: '2024-01-19',
      status: 'active',
    },
    {
      id: '3',
      name: 'Customer Analysis Report',
      type: 'customers',
      description: 'Customer performance and behavior analysis',
      createdAt: '2024-01-05',
      lastRun: '2024-01-18',
      status: 'inactive',
    },
    {
      id: '4',
      name: 'Financial Summary Report',
      type: 'financial',
      description: 'Complete financial overview and metrics',
      createdAt: '2024-01-01',
      lastRun: '2024-01-17',
      status: 'active',
    },
  ]

  const columns: any[] = [
    {
      key: 'name',
      label: 'Report Name',
      sortable: true,
      render: (value: any, report: any) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{value}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{report.description}</div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (value: any) => (
        <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{value}</span>
      ),
    },
    {
      key: 'lastRun',
      label: 'Last Run',
      sortable: true,
      render: (value: any) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: any) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            value === 'active'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
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
      render: (value: any) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    },
  ]

  const handleCreateReport = () => {
    setIsBuilderOpen(true)
  }

  const handleEditReport = (report: Report) => {
    setSelectedReport(report)
    setIsBuilderOpen(true)
  }

  const handleViewReport = (report: Report) => {
    setSelectedReport(report)
    // TODO: Implement report viewing
  }

  const handleDeleteReport = (report: Report) => {
    if (window.confirm(`Are you sure you want to delete report "${report.name}"?`)) {
      // TODO: Implement report deletion
      console.log('Delete report:', report.id)
    }
  }

  const handleGenerateReport = (config: any) => {
    console.log('Generate report:', config)
    setIsBuilderOpen(false)
  }

  const handlePreviewReport = (config: any) => {
    console.log('Preview report:', config)
  }

  const handleExportReport = (config: any, format: string) => {
    console.log('Export report:', config, format)
  }

  const handleBulkDelete = (selectedReports: Report[]) => {
    if (window.confirm(`Are you sure you want to delete ${selectedReports.length} reports?`)) {
      // TODO: Implement bulk deletion
      console.log('Bulk delete reports:', selectedReports.map(r => r.id))
    }
  }

  const handleExport = (selectedReports: Report[]) => {
    // TODO: Implement export functionality
    console.log('Export reports:', selectedReports)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Create and manage your business reports
          </p>
        </div>
        <Button onClick={handleCreateReport}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Report
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-500">
                <DocumentTextIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="font-medium text-gray-900 dark:text-white">Sales Reports</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Generate sales analysis</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-500">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="font-medium text-gray-900 dark:text-white">Analytics</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">View business analytics</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-500">
                <TableCellsIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="font-medium text-gray-900 dark:text-white">Data Export</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Export data tables</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <DataTable
        data={reports}
        columns={columns}
        title="Saved Reports"
        description="Manage your saved reports and templates"
        onEdit={handleEditReport}
        onView={handleViewReport}
        onDelete={handleDeleteReport}
        onBulkDelete={handleBulkDelete}
        onExport={handleExport}
        selectable
        exportable
        searchable
        filterable
        showPagination
        pageSize={10}
      />

      {/* Report Builder Modal */}
      <Modal
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        title="Report Builder"
        size="xl"
      >
        <ReportBuilder
          onGenerateReport={handleGenerateReport}
          onPreviewReport={handlePreviewReport}
          onExportReport={handleExportReport}
        />
      </Modal>
    </div>
  )
}

export default Reports
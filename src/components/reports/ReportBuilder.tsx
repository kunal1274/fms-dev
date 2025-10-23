import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { FormField, Input, Select, FormGroup, FormRow } from '../ui/Form'
import { PlusIcon, TrashIcon, EyeIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline'

interface ReportBuilderProps {
  onGenerateReport: (config: ReportConfig) => void
  onPreviewReport: (config: ReportConfig) => void
  onExportReport: (config: ReportConfig, format: 'pdf' | 'excel' | 'csv') => void
}

interface ReportConfig {
  name: string
  description: string
  type: string
  dateRange: {
    from: string
    to: string
  }
  filters: Array<{
    field: string
    operator: string
    value: string
  }>
  columns: string[]
  groupBy: string[]
  sortBy: string[]
  format: 'pdf' | 'excel' | 'csv'
}

const ReportBuilder: React.FC<ReportBuilderProps> = ({
  onGenerateReport,
  onPreviewReport,
  onExportReport,
}) => {
  const [config, setConfig] = useState<ReportConfig>({
    name: '',
    description: '',
    type: 'sales',
    dateRange: {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      to: new Date().toISOString().split('T')[0],
    },
    filters: [],
    columns: [],
    groupBy: [],
    sortBy: [],
    format: 'pdf',
  })

  const reportTypes = [
    { value: 'sales', label: 'Sales Report' },
    { value: 'purchases', label: 'Purchase Report' },
    { value: 'inventory', label: 'Inventory Report' },
    { value: 'customers', label: 'Customer Report' },
    { value: 'vendors', label: 'Vendor Report' },
    { value: 'financial', label: 'Financial Report' },
  ]

  const operators = [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'not_contains', label: 'Not Contains' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'between', label: 'Between' },
  ]

  const availableColumns = {
    sales: [
      { value: 'orderNumber', label: 'Order Number' },
      { value: 'customerName', label: 'Customer Name' },
      { value: 'orderDate', label: 'Order Date' },
      { value: 'totalAmount', label: 'Total Amount' },
      { value: 'status', label: 'Status' },
    ],
    purchases: [
      { value: 'orderNumber', label: 'Order Number' },
      { value: 'vendorName', label: 'Vendor Name' },
      { value: 'orderDate', label: 'Order Date' },
      { value: 'totalAmount', label: 'Total Amount' },
      { value: 'status', label: 'Status' },
    ],
    inventory: [
      { value: 'itemCode', label: 'Item Code' },
      { value: 'itemName', label: 'Item Name' },
      { value: 'category', label: 'Category' },
      { value: 'currentStock', label: 'Current Stock' },
      { value: 'unitPrice', label: 'Unit Price' },
    ],
  }

  const addFilter = () => {
    setConfig(prev => ({
      ...prev,
      filters: [...prev.filters, { field: '', operator: 'equals', value: '' }],
    }))
  }

  const removeFilter = (index: number) => {
    setConfig(prev => ({
      ...prev,
      filters: prev.filters.filter((_, i) => i !== index),
    }))
  }

  const updateFilter = (index: number, field: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      filters: prev.filters.map((filter, i) =>
        i === index ? { ...filter, [field]: value } : filter
      ),
    }))
  }

  const toggleColumn = (column: string) => {
    setConfig(prev => ({
      ...prev,
      columns: prev.columns.includes(column)
        ? prev.columns.filter(c => c !== column)
        : [...prev.columns, column],
    }))
  }

  const handleGenerate = () => {
    onGenerateReport(config)
  }

  const handlePreview = () => {
    onPreviewReport(config)
  }

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    onExportReport({ ...config, format }, format)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Report Builder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <FormGroup>
            <FormRow>
              <FormField label="Report Name" required>
                <Input
                  value={config.name}
                  onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter report name"
                />
              </FormField>
              <FormField label="Report Type" required>
                <Select
                  value={config.type}
                  onChange={(e) => setConfig(prev => ({ ...prev, type: e.target.value }))}
                  options={reportTypes}
                  placeholder="Select report type"
                />
              </FormField>
            </FormRow>
            <FormField label="Description">
              <Input
                value={config.description}
                onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter report description"
              />
            </FormField>
          </FormGroup>

          {/* Date Range */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Date Range</h3>
            <FormGroup>
              <FormRow>
                <FormField label="From Date" required>
                  <Input
                    type="date"
                    value={config.dateRange.from}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, from: e.target.value }
                    }))}
                  />
                </FormField>
                <FormField label="To Date" required>
                  <Input
                    type="date"
                    value={config.dateRange.to}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, to: e.target.value }
                    }))}
                  />
                </FormField>
              </FormRow>
            </FormGroup>
          </div>

          {/* Filters */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filters</h3>
              <Button variant="outline" size="sm" onClick={addFilter}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Filter
              </Button>
            </div>
            <div className="space-y-4">
              {config.filters.map((filter, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <Select
                    value={filter.field}
                    onChange={(e) => updateFilter(index, 'field', e.target.value)}
                    options={availableColumns[config.type as keyof typeof availableColumns] || []}
                    placeholder="Select field"
                  />
                  <Select
                    value={filter.operator}
                    onChange={(e) => updateFilter(index, 'operator', e.target.value)}
                    options={operators}
                    placeholder="Select operator"
                  />
                  <Input
                    value={filter.value}
                    onChange={(e) => updateFilter(index, 'value', e.target.value)}
                    placeholder="Enter value"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeFilter(index)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Columns */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Columns</h3>
            <div className="grid grid-cols-2 gap-4">
              {(availableColumns[config.type as keyof typeof availableColumns] || []).map((column) => (
                <div key={column.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.columns.includes(column.value)}
                    onChange={() => toggleColumn(column.value)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    {column.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button variant="outline" onClick={handlePreview}>
              <EyeIcon className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button onClick={handleGenerate}>
              Generate Report
            </Button>
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
        </CardContent>
      </Card>
    </div>
  )
}

export default ReportBuilder

import React, { useState } from 'react'
import { Card, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline'

interface ResponsiveTableProps<T> {
  data: T[]
  columns: Array<{
    key: string
    label: string
    sortable?: boolean
    render?: (value: any, item: T) => React.ReactNode
    mobileHidden?: boolean
    priority?: number // 1 = highest priority for mobile
  }>
  title?: string
  description?: string
  onEdit?: (item: T) => void
  onView?: (item: T) => void
  onDelete?: (item: T) => void
  onBulkDelete?: (items: T[]) => void
  onExport?: (items: T[]) => void
  selectable?: boolean
  exportable?: boolean
  searchable?: boolean
  filterable?: boolean
  showPagination?: boolean
  pageSize?: number
  customActions?: Array<{
    label: string
    icon: React.ComponentType<any>
    onClick: (item: T) => void
  }>
}

const ResponsiveTable = <T extends Record<string, any>>({
  data,
  columns,
  title,
  description,
  onEdit,
  onView,
  onDelete,
  onBulkDelete,
  onExport,
  selectable = false,
  exportable = false,
  searchable = false,
  filterable = false,
  showPagination = true,
  pageSize = 20,
  customActions = [],
}: ResponsiveTableProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItems, setSelectedItems] = useState<T[]>([])
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [isMobileView, setIsMobileView] = useState(false)

  // Filter data based on search term
  const filteredData = data.filter(item =>
    Object.values(item).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0

    const aValue = a[sortColumn]
    const bValue = b[sortColumn]

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedData = sortedData.slice(startIndex, startIndex + pageSize)

  // Get mobile columns (highest priority, not hidden)
  const mobileColumns = columns
    .filter(col => !col.mobileHidden)
    .sort((a, b) => (a.priority || 999) - (b.priority || 999))
    .slice(0, 3) // Show only 3 columns on mobile

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
  }

  const handleSelectAll = () => {
    if (selectedItems.length === paginatedData.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(paginatedData)
    }
  }

  const handleSelectItem = (item: T) => {
    if (selectedItems.includes(item)) {
      setSelectedItems(selectedItems.filter(selected => selected !== item))
    } else {
      setSelectedItems([...selectedItems, item])
    }
  }

  const handleBulkAction = (action: (items: T[]) => void) => {
    if (selectedItems.length > 0) {
      action(selectedItems)
      setSelectedItems([])
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      {(title || description) && (
        <div>
          {title && (
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
          )}
          {description && (
            <p className="mt-1 text-gray-600 dark:text-gray-400">{description}</p>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        {searchable && (
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {/* View Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMobileView(!isMobileView)}
            className="md:hidden"
          >
            {isMobileView ? 'Table' : 'Cards'}
          </Button>

          {/* Filter */}
          {filterable && (
            <Button variant="outline" size="sm">
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filter
            </Button>
          )}

          {/* Export */}
          {exportable && selectedItems.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction(onExport || (() => {}))}
            >
              Export ({selectedItems.length})
            </Button>
          )}

          {/* Bulk Delete */}
          {onBulkDelete && selectedItems.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleBulkAction(onBulkDelete)}
            >
              Delete ({selectedItems.length})
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Card View */}
      {isMobileView ? (
        <div className="space-y-4">
          {paginatedData.map((item, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {mobileColumns.map((column) => (
                    <div key={column.key} className="mb-2">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {column.label}:
                      </span>
                      <div className="text-gray-900 dark:text-white">
                        {column.render 
                          ? column.render(item[column.key], item)
                          : String(item[column.key] || '-')
                        }
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  {onView && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(item)}
                    >
                      View
                    </Button>
                  )}
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(item)}
                    >
                      Edit
                    </Button>
                  )}
                  <Button variant="ghost" size="sm">
                    <EllipsisVerticalIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* Desktop Table View */
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    {selectable && (
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedItems.length === paginatedData.length}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                    )}
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                          column.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : ''
                        }`}
                        onClick={() => column.sortable && handleSort(column.key)}
                      >
                        <div className="flex items-center">
                          {column.label}
                          {column.sortable && sortColumn === column.key && (
                            <span className="ml-1">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                    {(onEdit || onView || onDelete || customActions.length > 0) && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      {selectable && (
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item)}
                            onChange={() => handleSelectItem(item)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                      )}
                      {columns.map((column) => (
                        <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                          {column.render 
                            ? column.render(item[column.key], item)
                            : <span className="text-sm text-gray-900 dark:text-white">
                                {String(item[column.key] || '-')}
                              </span>
                          }
                        </td>
                      ))}
                      {(onEdit || onView || onDelete || customActions.length > 0) && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            {onView && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onView(item)}
                              >
                                View
                              </Button>
                            )}
                            {onEdit && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(item)}
                              >
                                Edit
                              </Button>
                            )}
                            {onDelete && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDelete(item)}
                                className="text-red-600 hover:text-red-700"
                              >
                                Delete
                              </Button>
                            )}
                            {customActions.map((action, actionIndex) => (
                              <Button
                                key={actionIndex}
                                variant="ghost"
                                size="sm"
                                onClick={() => action.onClick(item)}
                              >
                                <action.icon className="h-4 w-4" />
                              </Button>
                            ))}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing {startIndex + 1} to {Math.min(startIndex + pageSize, sortedData.length)} of {sortedData.length} results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ResponsiveTable

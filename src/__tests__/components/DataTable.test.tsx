import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DataTable } from '../../components/ui/DataTable'

interface TestItem {
  id: string
  name: string
  email: string
  status: string
}

const mockData: TestItem[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', status: 'Active' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'Inactive' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', status: 'Active' },
]

const mockColumns = [
  {
    key: 'name',
    label: 'Name',
    sortable: true,
  },
  {
    key: 'email',
    label: 'Email',
    sortable: true,
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    render: (value: string) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        value === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {value}
      </span>
    ),
  },
]

describe('DataTable Component', () => {
  it('renders table with data', () => {
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        title="Test Table"
        description="Test table description"
      />
    )

    expect(screen.getByText('Test Table')).toBeInTheDocument()
    expect(screen.getByText('Test table description')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
  })

  it('renders column headers', () => {
    render(<DataTable data={mockData} columns={mockColumns} />)
    
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
  })

  it('handles sorting', async () => {
    render(<DataTable data={mockData} columns={mockColumns} />)
    
    const nameHeader = screen.getByText('Name')
    fireEvent.click(nameHeader)
    
    await waitFor(() => {
      const rows = screen.getAllByRole('row')
      // First data row should be Bob Johnson (alphabetically first)
      expect(rows[1]).toHaveTextContent('Bob Johnson')
    })
  })

  it('handles search functionality', async () => {
    render(<DataTable data={mockData} columns={mockColumns} searchable />)
    
    const searchInput = screen.getByPlaceholderText(/search/i)
    fireEvent.change(searchInput, { target: { value: 'John' } })
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
    })
  })

  it('handles pagination', () => {
    const largeData = Array.from({ length: 25 }, (_, i) => ({
      id: `${i + 1}`,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      status: 'Active',
    }))

    render(
      <DataTable
        data={largeData}
        columns={mockColumns}
        showPagination
        pageSize={10}
      />
    )

    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument()
    expect(screen.getByText('Showing 1 to 10 of 25 results')).toBeInTheDocument()
  })

  it('handles row selection', () => {
    const handleBulkDelete = jest.fn()
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        selectable
        onBulkDelete={handleBulkDelete}
      />
    )

    const selectAllCheckbox = screen.getByRole('checkbox', { name: /select all/i })
    fireEvent.click(selectAllCheckbox)

    expect(selectAllCheckbox).toBeChecked()
  })

  it('handles edit action', () => {
    const handleEdit = jest.fn()
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        onEdit={handleEdit}
      />
    )

    const editButtons = screen.getAllByText('Edit')
    fireEvent.click(editButtons[0])

    expect(handleEdit).toHaveBeenCalledWith(mockData[0])
  })

  it('handles delete action', () => {
    const handleDelete = jest.fn()
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        onDelete={handleDelete}
      />
    )

    const deleteButtons = screen.getAllByText('Delete')
    fireEvent.click(deleteButtons[0])

    expect(handleDelete).toHaveBeenCalledWith(mockData[0])
  })

  it('handles view action', () => {
    const handleView = jest.fn()
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        onView={handleView}
      />
    )

    const viewButtons = screen.getAllByText('View')
    fireEvent.click(viewButtons[0])

    expect(handleView).toHaveBeenCalledWith(mockData[0])
  })

  it('renders custom actions', () => {
    const handleCustomAction = jest.fn()
    const customActions = [
      {
        label: 'Custom Action',
        icon: () => <span data-testid="custom-icon">Icon</span>,
        onClick: handleCustomAction,
      },
    ]

    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        customActions={customActions}
      />
    )

    expect(screen.getAllByTestId('custom-icon')).toHaveLength(mockData.length)
  })

  it('handles empty data', () => {
    render(<DataTable data={[]} columns={mockColumns} />)
    
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  it('handles loading state', () => {
    render(<DataTable data={[]} columns={mockColumns} loading />)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('handles error state', () => {
    render(<DataTable data={[]} columns={mockColumns} error="Test error" />)
    
    expect(screen.getByText('Test error')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        className="custom-table"
      />
    )

    const table = screen.getByRole('table')
    expect(table).toHaveClass('custom-table')
  })

  it('handles export functionality', () => {
    const handleExport = jest.fn()
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        exportable
        onExport={handleExport}
      />
    )

    const exportButton = screen.getByText(/export/i)
    fireEvent.click(exportButton)

    expect(handleExport).toHaveBeenCalledWith(mockData)
  })

  it('handles filtering', () => {
    render(<DataTable data={mockData} columns={mockColumns} filterable />)
    
    expect(screen.getByText(/filter/i)).toBeInTheDocument()
  })

  it('renders with custom page size', () => {
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        showPagination
        pageSize={2}
      />
    )

    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()
    expect(screen.getByText('Showing 1 to 2 of 3 results')).toBeInTheDocument()
  })
})

import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

export interface ExportOptions {
  filename?: string
  title?: string
  columns: Array<{
    key: string
    label: string
    width?: number
  }>
  data: any[]
  format: 'pdf' | 'excel' | 'csv'
}

export const exportToExcel = (options: ExportOptions) => {
  const { filename = 'export', columns, data } = options

  // Prepare data for Excel
  const excelData = data.map((row) => {
    const excelRow: any = {}
    columns.forEach((col) => {
      excelRow[col.label] = getNestedValue(row, col.key)
    })
    return excelRow
  })

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(excelData)

  // Set column widths
  const colWidths = columns.map((col) => ({
    wch: col.width || 15,
  }))
  worksheet['!cols'] = colWidths

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data')

  // Generate and download file
  XLSX.writeFile(workbook, `${filename}.xlsx`)
}

export const exportToCSV = (options: ExportOptions) => {
  const { filename = 'export', columns, data } = options

  // Prepare CSV headers
  const headers = columns.map((col) => col.label).join(',')

  // Prepare CSV data
  const csvData = data.map((row) => {
    return columns
      .map((col) => {
        const value = getNestedValue(row, col.key)
        // Escape commas and quotes in CSV
        return typeof value === 'string' && (value.includes(',') || value.includes('"'))
          ? `"${value.replace(/"/g, '""')}"`
          : value
      })
      .join(',')
  })

  // Combine headers and data
  const csvContent = [headers, ...csvData].join('\n')

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const exportToPDF = (options: ExportOptions) => {
  const { filename = 'export', title = 'Export', columns, data } = options

  // Create new PDF document
  const doc = new jsPDF('l', 'mm', 'a4') // landscape orientation

  // Add title
  doc.setFontSize(16)
  doc.text(title, 14, 22)

  // Add export date
  doc.setFontSize(10)
  doc.text(`Exported on: ${new Date().toLocaleDateString()}`, 14, 30)

  // Prepare table data
  const tableData = data.map((row) => {
    return columns.map((col) => getNestedValue(row, col.key))
  })

  // Prepare table columns
  const tableColumns = columns.map((col) => ({
    title: col.label,
    dataKey: col.key,
  }))

  // Add table to PDF
  ;(doc as any).autoTable({
    head: [columns.map((col) => col.label)],
    body: tableData,
    startY: 40,
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [66, 139, 202],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: columns.reduce((acc, col, index) => {
      acc[index] = { cellWidth: col.width || 'auto' }
      return acc
    }, {} as any),
    margin: { top: 40 },
  })

  // Save the PDF
  doc.save(`${filename}.pdf`)
}

export const exportData = (options: ExportOptions) => {
  switch (options.format) {
    case 'excel':
      exportToExcel(options)
      break
    case 'csv':
      exportToCSV(options)
      break
    case 'pdf':
      exportToPDF(options)
      break
    default:
      throw new Error(`Unsupported export format: ${options.format}`)
  }
}

// Helper function to get nested object values
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : ''
  }, obj)
}

// Format data for export
export const formatDataForExport = (data: any[], columns: any[]) => {
  return data.map((row) => {
    const formattedRow: any = {}
    columns.forEach((col) => {
      const value = getNestedValue(row, col.key)
      
      // Format based on column type
      if (col.type === 'date' && value) {
        formattedRow[col.key] = new Date(value).toLocaleDateString()
      } else if (col.type === 'currency' && value) {
        formattedRow[col.key] = `$${parseFloat(value).toFixed(2)}`
      } else if (col.type === 'number' && value) {
        formattedRow[col.key] = parseFloat(value).toFixed(2)
      } else if (col.type === 'boolean' && value !== undefined) {
        formattedRow[col.key] = value ? 'Yes' : 'No'
      } else {
        formattedRow[col.key] = value || ''
      }
    })
    return formattedRow
  })
}

export default exportData

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { DataTable } from '../ui/DataTable'
import { Modal, FormModal } from '../ui/Modal'
import { FileUpload } from '../ui/FileUpload'
import { 
  PlusIcon, 
  DocumentIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  DocumentArrowDownIcon,
  ShareIcon,
  TagIcon
} from '@heroicons/react/24/outline'
import type { Column } from '../../types/models'

interface Document {
  id: string
  name: string
  type: string
  size: number
  version: string
  uploadedBy: string
  uploadedAt: string
  tags: string[]
  category: string
  status: 'active' | 'archived' | 'deleted'
}

interface DocumentManagerProps {
  documents?: Document[]
  onUploadDocument: (file: File, metadata: DocumentMetadata) => void
  onUpdateDocument: (documentId: string, metadata: DocumentMetadata) => void
  onDeleteDocument: (documentId: string) => void
  onDownloadDocument: (documentId: string) => void
  onShareDocument: (documentId: string, permissions: SharePermissions) => void
}

interface DocumentMetadata {
  name: string
  description: string
  category: string
  tags: string[]
  isPublic: boolean
}

interface SharePermissions {
  canView: boolean
  canEdit: boolean
  canDownload: boolean
  users: string[]
}

const DocumentManager: React.FC<DocumentManagerProps> = ({
  documents = [],
  onUploadDocument,
  onUpdateDocument,
  onDeleteDocument,
  onDownloadDocument,
  onShareDocument,
}) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const categories = [
    { value: 'contracts', label: 'Contracts' },
    { value: 'invoices', label: 'Invoices' },
    { value: 'receipts', label: 'Receipts' },
    { value: 'reports', label: 'Reports' },
    { value: 'policies', label: 'Policies' },
    { value: 'forms', label: 'Forms' },
    { value: 'others', label: 'Others' },
  ]

  const columns: Column<Document>[] = [
    {
      key: 'name',
      label: 'Document Name',
      sortable: true,
      render: (value, document) => (
        <div className="flex items-center">
          <DocumentIcon className="h-5 w-5 text-gray-400 mr-3" />
          <div>
            <div className="font-medium text-gray-900 dark:text-white">{value}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {document.type} • {formatFileSize(document.size)}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{value}</span>
      ),
    },
    {
      key: 'version',
      label: 'Version',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">v{value}</span>
      ),
    },
    {
      key: 'uploadedBy',
      label: 'Uploaded By',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">{value}</span>
      ),
    },
    {
      key: 'uploadedAt',
      label: 'Uploaded',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'tags',
      label: 'Tags',
      render: (value) => (
        <div className="flex flex-wrap gap-1">
          {value.slice(0, 2).map((tag, index) => (
            <span
              key={index}
              className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full"
            >
              {tag}
            </span>
          ))}
          {value.length > 2 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              +{value.length - 2} more
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            value === 'active'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : value === 'archived'
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}
        >
          {value}
        </span>
      ),
    },
  ]

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleUpload = () => {
    setIsUploadModalOpen(true)
  }

  const handleView = (document: Document) => {
    setSelectedDocument(document)
    setIsViewModalOpen(true)
  }

  const handleEdit = (document: Document) => {
    setSelectedDocument(document)
    setIsEditModalOpen(true)
  }

  const handleDelete = (document: Document) => {
    if (window.confirm(`Are you sure you want to delete "${document.name}"?`)) {
      onDeleteDocument(document.id)
    }
  }

  const handleDownload = (document: Document) => {
    onDownloadDocument(document.id)
  }

  const handleShare = (document: Document) => {
    setSelectedDocument(document)
    setIsShareModalOpen(true)
  }

  const handleBulkDelete = (selectedDocuments: Document[]) => {
    if (window.confirm(`Are you sure you want to delete ${selectedDocuments.length} documents?`)) {
      selectedDocuments.forEach(doc => onDeleteDocument(doc.id))
    }
  }

  const handleExport = (selectedDocuments: Document[]) => {
    // TODO: Implement export functionality
    console.log('Export documents:', selectedDocuments)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Document Manager</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your documents and files
          </p>
        </div>
        <Button onClick={handleUpload}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-500">
                <DocumentIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Documents</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{documents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-500">
                <DocumentIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {documents.filter(d => d.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-500">
                <DocumentIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Archived</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {documents.filter(d => d.status === 'archived').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-500">
                <DocumentIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Size</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatFileSize(documents.reduce((sum, doc) => sum + doc.size, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents Table */}
      <DataTable
        data={documents}
        columns={columns}
        title="Documents"
        description="Manage your documents and files"
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
        onExport={handleExport}
        selectable
        exportable
        searchable
        filterable
        showPagination
        pageSize={20}
        customActions={[
          {
            label: 'Download',
            icon: DocumentArrowDownIcon,
            onClick: handleDownload,
          },
          {
            label: 'Share',
            icon: ShareIcon,
            onClick: handleShare,
          },
        ]}
      />

      {/* Upload Modal */}
      <FormModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSubmit={(e) => {
          e.preventDefault()
          if (uploadedFile) {
            const metadata: DocumentMetadata = {
              name: uploadedFile.name,
              description: '',
              category: 'others',
              tags: [],
              isPublic: false,
            }
            onUploadDocument(uploadedFile, metadata)
            setIsUploadModalOpen(false)
            setUploadedFile(null)
          }
        }}
        title="Upload Document"
        description="Upload a new document to the system"
        size="lg"
      >
        <div className="space-y-6">
          <FileUpload
            onFileSelect={setUploadedFile}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
            maxSize={10 * 1024 * 1024} // 10MB
          />
          {uploadedFile && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Selected file: {uploadedFile.name} ({formatFileSize(uploadedFile.size)})
              </p>
            </div>
          )}
        </div>
      </FormModal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Document Details"
        size="lg"
      >
        {selectedDocument && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <DocumentIcon className="h-12 w-12 text-gray-400" />
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {selectedDocument.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedDocument.type} • {formatFileSize(selectedDocument.size)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</label>
                <p className="text-gray-900 dark:text-white capitalize">{selectedDocument.category}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Version</label>
                <p className="text-gray-900 dark:text-white">v{selectedDocument.version}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Uploaded By</label>
                <p className="text-gray-900 dark:text-white">{selectedDocument.uploadedBy}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Uploaded At</label>
                <p className="text-gray-900 dark:text-white">
                  {new Date(selectedDocument.uploadedAt).toLocaleString()}
                </p>
              </div>
            </div>

            {selectedDocument.tags.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Tags</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedDocument.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button variant="outline" onClick={() => handleDownload(selectedDocument)}>
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" onClick={() => handleShare(selectedDocument)}>
                <ShareIcon className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button onClick={() => handleEdit(selectedDocument)}>
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default DocumentManager

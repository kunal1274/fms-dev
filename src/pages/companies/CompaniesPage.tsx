import React, { useState } from 'react'
import { Company } from '../../types/models'
import { CompanyList } from './CompanyList'
import { CompanyForm } from './CompanyForm'
import { CompanyDetail } from './CompanyDetail'

type ViewMode = 'list' | 'add' | 'edit' | 'view'

export const CompaniesPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)

  // Handle navigation
  const handleAddCompany = () => {
    setSelectedCompany(null)
    setViewMode('add')
  }

  const handleEditCompany = (company: Company) => {
    setSelectedCompany(company)
    setViewMode('edit')
  }

  const handleViewCompany = (company: Company) => {
    setSelectedCompany(company)
    setViewMode('view')
  }

  const handleSaveCompany = (company: Company) => {
    setSelectedCompany(company)
    setViewMode('view')
  }

  const handleCancel = () => {
    setSelectedCompany(null)
    setViewMode('list')
  }

  const handleBackToList = () => {
    setSelectedCompany(null)
    setViewMode('list')
  }

  // Render appropriate component based on view mode
  const renderContent = () => {
    switch (viewMode) {
      case 'list':
        return (
          <CompanyList
            onAddCompany={handleAddCompany}
            onEditCompany={handleEditCompany}
            onViewCompany={handleViewCompany}
          />
        )
      
      case 'add':
        return (
          <CompanyForm
            onSave={handleSaveCompany}
            onCancel={handleCancel}
          />
        )
      
      case 'edit':
        return (
          <CompanyForm
            company={selectedCompany}
            onSave={handleSaveCompany}
            onCancel={handleCancel}
          />
        )
      
      case 'view':
        return (
          <CompanyDetail
            companyId={selectedCompany?.id || ''}
            onEdit={handleEditCompany}
            onBack={handleBackToList}
          />
        )
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </div>
    </div>
  )
}

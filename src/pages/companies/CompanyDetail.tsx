import React from 'react'
import { useGetCompanyQuery } from '../../store/api/companies'
import { Company } from '../../types/models'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { 
  ArrowLeft, 
  Edit, 
  Download, 
  Share,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Calendar,
  FileText,
  Banknote,
  Tag,
  Activity
} from 'lucide-react'

interface CompanyDetailProps {
  companyId: string
  onEdit: (company: Company) => void
  onBack: () => void
}

export const CompanyDetail: React.FC<CompanyDetailProps> = ({
  companyId,
  onEdit,
  onBack
}) => {
  const { data: companyData, isLoading, error } = useGetCompanyQuery(companyId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !companyData?.data) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Failed to load company details</p>
        <Button onClick={onBack}>Go Back</Button>
      </div>
    )
  }

  const company = companyData.data

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{company.companyName}</h1>
            <p className="text-gray-600">{company.companyCode}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onEdit(company)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-2">
        <Badge variant={company.active ? "default" : "secondary"}>
          <Activity className="h-3 w-3 mr-1" />
          {company.active ? 'Active' : 'Inactive'}
        </Badge>
        <Badge variant="outline">
          <Tag className="h-3 w-3 mr-1" />
          {company.businessType}
        </Badge>
        <Badge variant="outline">
          <Banknote className="h-3 w-3 mr-1" />
          {company.currency}
        </Badge>
      </div>

      {/* Company Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Company Name</label>
                <p className="text-sm text-gray-900 mt-1">{company.companyName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Company Code</label>
                <p className="text-sm text-gray-900 mt-1">{company.companyCode}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Business Type</label>
                <p className="text-sm text-gray-900 mt-1">{company.businessType}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Currency</label>
                <p className="text-sm text-gray-900 mt-1">{company.currency}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </label>
              <p className="text-sm text-gray-900 mt-1">{company.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone
              </label>
              <p className="text-sm text-gray-900 mt-1">{company.contactNumber}</p>
            </div>
            {company.website && (
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Website
                </label>
                <a 
                  href={company.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 mt-1 block"
                >
                  {company.website}
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Address Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <label className="text-sm font-medium text-gray-700">Primary GST Address</label>
            <p className="text-sm text-gray-900 mt-1 whitespace-pre-line">
              {company.primaryGSTAddress}
            </p>
          </div>
          {company.secondaryOfficeAddress && (
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-700">Secondary Office Address</label>
              <p className="text-sm text-gray-900 mt-1 whitespace-pre-line">
                {company.secondaryOfficeAddress}
              </p>
            </div>
          )}
          {company.tertiaryShippingAddress && (
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-700">Shipping Address</label>
              <p className="text-sm text-gray-900 mt-1 whitespace-pre-line">
                {company.tertiaryShippingAddress}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bank Details */}
      {company.bankDetails && company.bankDetails.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5" />
              Bank Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {company.bankDetails.map((bank, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Bank Name</label>
                      <p className="text-sm text-gray-900 mt-1">{bank.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Account Number</label>
                      <p className="text-sm text-gray-900 mt-1">{bank.bankNum}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">IFSC Code</label>
                      <p className="text-sm text-gray-900 mt-1">{bank.ifsc}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Account Holder</label>
                      <p className="text-sm text-gray-900 mt-1">{bank.accountHolderName}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Badge variant={bank.active ? "default" : "secondary"}>
                      {bank.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tax Information */}
      {company.taxInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Tax Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {company.taxInfo.gstNumber && (
                <div>
                  <label className="text-sm font-medium text-gray-700">GST Number</label>
                  <p className="text-sm text-gray-900 mt-1">{company.taxInfo.gstNumber}</p>
                </div>
              )}
              {company.taxInfo.panNumber && (
                <div>
                  <label className="text-sm font-medium text-gray-700">PAN Number</label>
                  <p className="text-sm text-gray-900 mt-1">{company.taxInfo.panNumber}</p>
                </div>
              )}
              {company.taxInfo.tanNumber && (
                <div>
                  <label className="text-sm font-medium text-gray-700">TAN Number</label>
                  <p className="text-sm text-gray-900 mt-1">{company.taxInfo.tanNumber}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Additional Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {company.remarks && (
            <div>
              <label className="text-sm font-medium text-gray-700">Remarks</label>
              <p className="text-sm text-gray-900 mt-1 whitespace-pre-line">
                {company.remarks}
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Created
              </label>
              <p className="text-sm text-gray-900 mt-1">
                {new Date(company.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Last Updated
              </label>
              <p className="text-sm text-gray-900 mt-1">
                {new Date(company.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Files */}
      {company.files && company.files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Attached Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {company.files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">{file.name}</span>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import { useCreateCompanyMutation, useUpdateCompanyMutation } from '../../store/api/companies'
import { Company } from '../../types/models'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { 
  Save, 
  X, 
  Upload,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileText
} from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

// Validation schema
const companySchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  companyCode: z.string().min(1, 'Company code is required'),
  email: z.string().email('Invalid email address'),
  contactNumber: z.string().min(10, 'Contact number must be at least 10 digits'),
  primaryGSTAddress: z.string().min(1, 'Primary GST address is required'),
  businessType: z.string().min(1, 'Business type is required'),
  currency: z.string().min(1, 'Currency is required'),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  remarks: z.string().optional(),
  active: z.boolean().default(true)
})

type CompanyFormData = z.infer<typeof companySchema>

interface CompanyFormProps {
  company?: Company
  onSave: (company: Company) => void
  onCancel: () => void
}

export const CompanyForm: React.FC<CompanyFormProps> = ({
  company,
  onSave,
  onCancel
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  const [createCompany] = useCreateCompanyMutation()
  const [updateCompany] = useUpdateCompanyMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      companyName: company?.companyName || '',
      companyCode: company?.companyCode || '',
      email: company?.email || '',
      contactNumber: company?.contactNumber || '',
      primaryGSTAddress: company?.primaryGSTAddress || '',
      businessType: company?.businessType || 'Trading',
      currency: company?.currency || 'INR',
      website: company?.website || '',
      remarks: company?.remarks || '',
      active: company?.active ?? true
    }
  })

  const isEditMode = !!company
  const watchedValues = watch()

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadedFiles(prev => [...prev, ...files])
    toast.success(`${files.length} file(s) uploaded`)
  }

  // Handle form submission
  const onSubmit = async (data: CompanyFormData) => {
    setIsSubmitting(true)
    
    try {
      const companyData = {
        ...data,
        files: uploadedFiles.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type
        }))
      }

      if (isEditMode && company) {
        const result = await updateCompany({ 
          id: company.id, 
          data: companyData 
        }).unwrap()
        toast.success('Company updated successfully')
        onSave(result.data)
      } else {
        const result = await createCompany(companyData).unwrap()
        toast.success('Company created successfully')
        onSave(result.data)
      }
    } catch (error) {
      toast.error(isEditMode ? 'Failed to update company' : 'Failed to create company')
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset form when company changes
  useEffect(() => {
    if (company) {
      reset({
        companyName: company.companyName,
        companyCode: company.companyCode,
        email: company.email,
        contactNumber: company.contactNumber,
        primaryGSTAddress: company.primaryGSTAddress,
        businessType: company.businessType,
        currency: company.currency,
        website: company.website || '',
        remarks: company.remarks || '',
        active: company.active
      })
    }
  }, [company, reset])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit Company' : 'Add New Company'}
          </h1>
          <p className="text-gray-600">
            {isEditMode ? 'Update company information' : 'Enter company details'}
          </p>
        </div>
        <Button variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  {...register('companyName')}
                  placeholder="Enter company name"
                  className={errors.companyName ? 'border-red-500' : ''}
                />
                {errors.companyName && (
                  <p className="text-sm text-red-600">{errors.companyName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyCode">Company Code *</Label>
                <Input
                  id="companyCode"
                  {...register('companyCode')}
                  placeholder="Enter company code"
                  className={errors.companyCode ? 'border-red-500' : ''}
                />
                {errors.companyCode && (
                  <p className="text-sm text-red-600">{errors.companyCode.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessType">Business Type *</Label>
                <Select
                  value={watchedValues.businessType}
                  onValueChange={(value) => setValue('businessType', value)}
                >
                  <SelectTrigger className={errors.businessType ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Trading">Trading</SelectItem>
                    <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="Services">Services</SelectItem>
                    <SelectItem value="Retail">Retail</SelectItem>
                    <SelectItem value="Wholesale">Wholesale</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.businessType && (
                  <p className="text-sm text-red-600">{errors.businessType.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency *</Label>
                <Select
                  value={watchedValues.currency}
                  onValueChange={(value) => setValue('currency', value)}
                >
                  <SelectTrigger className={errors.currency ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR (Indian Rupee)</SelectItem>
                    <SelectItem value="USD">USD (US Dollar)</SelectItem>
                    <SelectItem value="EUR">EUR (Euro)</SelectItem>
                    <SelectItem value="GBP">GBP (British Pound)</SelectItem>
                    <SelectItem value="JPY">JPY (Japanese Yen)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.currency && (
                  <p className="text-sm text-red-600">{errors.currency.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="Enter email address"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number *</Label>
                <Input
                  id="contactNumber"
                  {...register('contactNumber')}
                  placeholder="Enter contact number"
                  className={errors.contactNumber ? 'border-red-500' : ''}
                />
                {errors.contactNumber && (
                  <p className="text-sm text-red-600">{errors.contactNumber.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                {...register('website')}
                placeholder="https://www.example.com"
                className={errors.website ? 'border-red-500' : ''}
              />
              {errors.website && (
                <p className="text-sm text-red-600">{errors.website.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Address Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="primaryGSTAddress">Primary GST Address *</Label>
              <Textarea
                id="primaryGSTAddress"
                {...register('primaryGSTAddress')}
                placeholder="Enter complete address for GST purposes"
                rows={3}
                className={errors.primaryGSTAddress ? 'border-red-500' : ''}
              />
              {errors.primaryGSTAddress && (
                <p className="text-sm text-red-600">{errors.primaryGSTAddress.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Additional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                {...register('remarks')}
                placeholder="Enter any additional remarks or notes"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="active"
                {...register('active')}
                className="rounded border-gray-300"
              />
              <Label htmlFor="active">Active Company</Label>
            </div>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              File Attachments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Drag and drop files here, or click to select
              </p>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <Label htmlFor="file-upload" className="cursor-pointer">
                <Button variant="outline" size="sm">
                  Choose Files
                </Button>
              </Label>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Uploaded Files:</p>
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">{file.name}</span>
                    <Badge variant="secondary">{file.type}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {isEditMode ? 'Updating...' : 'Creating...'}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {isEditMode ? 'Update Company' : 'Create Company'}
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

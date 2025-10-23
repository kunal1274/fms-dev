import React, { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../../components/ui/Button'
import { FormField, Input, Textarea, Select, FormGroup, FormRow } from '../../components/ui/Form'
import { useCreateCompanyMutation, useUpdateCompanyMutation } from '../../store/api'
import type { Company, BusinessType, Currency, PaymentTerms, CompanyStatus } from '../../types/models'
import toast from 'react-hot-toast'

// Validation schema
const companySchema = z.object({
  companyCode: z.string().min(1, 'Company code is required'),
  companyName: z.string().min(1, 'Company name is required'),
  businessType: z.string().min(1, 'Business type is required'),
  primaryAddress: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
    landmark: z.string().optional(),
  }),
  secondaryAddress: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
    landmark: z.string().optional(),
  }).optional(),
  shippingAddress: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
    landmark: z.string().optional(),
  }).optional(),
  contactInfo: z.object({
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    phone: z.string().optional(),
    mobile: z.string().optional(),
    website: z.string().optional(),
  }),
  bankDetails: z.array(z.object({
    bankName: z.string().min(1, 'Bank name is required'),
    accountNumber: z.string().min(1, 'Account number is required'),
    accountHolderName: z.string().min(1, 'Account holder name is required'),
    ifscCode: z.string().optional(),
    swiftCode: z.string().optional(),
    branchName: z.string().optional(),
    bankType: z.string().min(1, 'Bank type is required'),
    qrDetails: z.string().optional(),
  })).min(1, 'At least one bank detail is required'),
  taxInfo: z.object({
    gstNumber: z.string().optional(),
    panNumber: z.string().optional(),
    tanNumber: z.string().optional(),
    taxExempt: z.boolean().optional(),
    taxRate: z.number().optional(),
  }),
  currency: z.string().min(1, 'Currency is required'),
  creditLimit: z.number().optional(),
  paymentTerms: z.string().optional(),
  status: z.string().min(1, 'Status is required'),
  remarks: z.string().optional(),
})

type CompanyFormData = z.infer<typeof companySchema>

interface CompanyFormProps {
  company?: Company | null
  onSuccess: () => void
  onCancel: () => void
}

const businessTypes: { value: BusinessType; label: string }[] = [
  { value: 'Individual', label: 'Individual' },
  { value: 'Manufacturing', label: 'Manufacturing' },
  { value: 'ServiceProvider', label: 'Service Provider' },
  { value: 'Trading', label: 'Trading' },
  { value: 'Distributor', label: 'Distributor' },
  { value: 'Retailer', label: 'Retailer' },
  { value: 'Wholesaler', label: 'Wholesaler' },
  { value: 'Others', label: 'Others' },
]

const currencies: { value: Currency; label: string }[] = [
  { value: 'INR', label: 'INR' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
]

const paymentTermsOptions: { value: PaymentTerms; label: string }[] = [
  { value: 'COD', label: 'Cash on Delivery' },
  { value: 'Net7D', label: 'Net 7 Days' },
  { value: 'Net15D', label: 'Net 15 Days' },
  { value: 'Net30D', label: 'Net 30 Days' },
  { value: 'Net45D', label: 'Net 45 Days' },
  { value: 'Net60D', label: 'Net 60 Days' },
  { value: 'Net90D', label: 'Net 90 Days' },
  { value: 'Advance', label: 'Advance Payment' },
]

const statusOptions: { value: CompanyStatus; label: string }[] = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
  { value: 'OnHold', label: 'On Hold' },
  { value: 'Suspended', label: 'Suspended' },
]

const bankTypes: { value: string; label: string }[] = [
  { value: 'Bank', label: 'Bank' },
  { value: 'UPI', label: 'UPI' },
  { value: 'Cash', label: 'Cash' },
  { value: 'BankAndUpi', label: 'Bank & UPI' },
]

const CompanyForm: React.FC<CompanyFormProps> = ({ company, onSuccess, onCancel }) => {
  const [createCompany, { isLoading: isCreating }] = useCreateCompanyMutation()
  const [updateCompany, { isLoading: isUpdating }] = useUpdateCompanyMutation()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
    reset,
    watch,
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      companyCode: '',
      companyName: '',
      businessType: '',
      primaryAddress: {
        street: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
        landmark: '',
      },
      secondaryAddress: {
        street: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
        landmark: '',
      },
      shippingAddress: {
        street: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
        landmark: '',
      },
      contactInfo: {
        email: '',
        phone: '',
        mobile: '',
        website: '',
      },
      bankDetails: [
        {
          bankName: '',
          accountNumber: '',
          accountHolderName: '',
          ifscCode: '',
          swiftCode: '',
          branchName: '',
          bankType: '',
          qrDetails: '',
        },
      ],
      taxInfo: {
        gstNumber: '',
        panNumber: '',
        tanNumber: '',
        taxExempt: false,
        taxRate: 0,
      },
      currency: 'INR',
      creditLimit: 0,
      paymentTerms: '',
      status: 'Active',
      remarks: '',
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'bankDetails',
  })

  useEffect(() => {
    if (company) {
      reset({
        companyCode: company.companyCode || '',
        companyName: company.companyName || '',
        businessType: company.businessType || '',
        primaryAddress: company.primaryAddress || {},
        secondaryAddress: company.secondaryAddress || {},
        shippingAddress: company.shippingAddress || {},
        contactInfo: company.contactInfo || {},
        bankDetails: company.bankDetails?.length ? company.bankDetails : [
          {
            bankName: '',
            accountNumber: '',
            accountHolderName: '',
            ifscCode: '',
            swiftCode: '',
            branchName: '',
            bankType: '',
            qrDetails: '',
          },
        ],
        taxInfo: company.taxInfo || {},
        currency: company.currency || 'INR',
        creditLimit: company.creditLimit || 0,
        paymentTerms: company.paymentTerms || '',
        status: company.status || 'Active',
        remarks: company.remarks || '',
      })
    }
  }, [company, reset])

  const onSubmit = async (data: CompanyFormData) => {
    try {
      if (company) {
        await updateCompany({
          id: company.id || company._id || '',
          data,
        }).unwrap()
        toast.success('Company updated successfully')
      } else {
        await createCompany(data).unwrap()
        toast.success('Company created successfully')
      }
      onSuccess()
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to save company')
    }
  }

  const isLoading = isCreating || isUpdating

  return (
    <form id="modal-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormGroup>
        <FormRow>
          <FormField label="Company Code" error={errors.companyCode?.message} required>
            <Input
              {...register('companyCode')}
              placeholder="Enter company code"
              error={!!errors.companyCode}
            />
          </FormField>
          <FormField label="Company Name" error={errors.companyName?.message} required>
            <Input
              {...register('companyName')}
              placeholder="Enter company name"
              error={!!errors.companyName}
            />
          </FormField>
        </FormRow>

        <FormRow>
          <FormField label="Business Type" error={errors.businessType?.message} required>
            <Select
              {...register('businessType')}
              options={businessTypes}
              placeholder="Select business type"
              error={!!errors.businessType}
            />
          </FormField>
          <FormField label="Status" error={errors.status?.message} required>
            <Select
              {...register('status')}
              options={statusOptions}
              placeholder="Select status"
              error={!!errors.status}
            />
          </FormField>
        </FormRow>

        <FormRow>
          <FormField label="Currency" error={errors.currency?.message} required>
            <Select
              {...register('currency')}
              options={currencies}
              placeholder="Select currency"
              error={!!errors.currency}
            />
          </FormField>
          <FormField label="Payment Terms" error={errors.paymentTerms?.message}>
            <Select
              {...register('paymentTerms')}
              options={paymentTermsOptions}
              placeholder="Select payment terms"
              error={!!errors.paymentTerms}
            />
          </FormField>
        </FormRow>

        <FormRow>
          <FormField label="Credit Limit" error={errors.creditLimit?.message}>
            <Input
              type="number"
              {...register('creditLimit', { valueAsNumber: true })}
              placeholder="Enter credit limit"
              error={!!errors.creditLimit}
            />
          </FormField>
        </FormRow>
      </FormGroup>

      {/* Primary Address */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Primary Address</h3>
        <FormGroup>
          <FormField label="Street" error={errors.primaryAddress?.street?.message}>
            <Input
              {...register('primaryAddress.street')}
              placeholder="Enter street address"
              error={!!errors.primaryAddress?.street}
            />
          </FormField>
          <FormRow>
            <FormField label="City" error={errors.primaryAddress?.city?.message}>
              <Input
                {...register('primaryAddress.city')}
                placeholder="Enter city"
                error={!!errors.primaryAddress?.city}
              />
            </FormField>
            <FormField label="State" error={errors.primaryAddress?.state?.message}>
              <Input
                {...register('primaryAddress.state')}
                placeholder="Enter state"
                error={!!errors.primaryAddress?.state}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Country" error={errors.primaryAddress?.country?.message}>
              <Input
                {...register('primaryAddress.country')}
                placeholder="Enter country"
                error={!!errors.primaryAddress?.country}
              />
            </FormField>
            <FormField label="Postal Code" error={errors.primaryAddress?.postalCode?.message}>
              <Input
                {...register('primaryAddress.postalCode')}
                placeholder="Enter postal code"
                error={!!errors.primaryAddress?.postalCode}
              />
            </FormField>
          </FormRow>
        </FormGroup>
      </div>

      {/* Contact Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Contact Information</h3>
        <FormGroup>
          <FormRow>
            <FormField label="Email" error={errors.contactInfo?.email?.message}>
              <Input
                type="email"
                {...register('contactInfo.email')}
                placeholder="Enter email address"
                error={!!errors.contactInfo?.email}
              />
            </FormField>
            <FormField label="Phone" error={errors.contactInfo?.phone?.message}>
              <Input
                {...register('contactInfo.phone')}
                placeholder="Enter phone number"
                error={!!errors.contactInfo?.phone}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Mobile" error={errors.contactInfo?.mobile?.message}>
              <Input
                {...register('contactInfo.mobile')}
                placeholder="Enter mobile number"
                error={!!errors.contactInfo?.mobile}
              />
            </FormField>
            <FormField label="Website" error={errors.contactInfo?.website?.message}>
              <Input
                {...register('contactInfo.website')}
                placeholder="Enter website URL"
                error={!!errors.contactInfo?.website}
              />
            </FormField>
          </FormRow>
        </FormGroup>
      </div>

      {/* Bank Details */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Bank Details</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({
              bankName: '',
              accountNumber: '',
              accountHolderName: '',
              ifscCode: '',
              swiftCode: '',
              branchName: '',
              bankType: '',
              qrDetails: '',
            })}
          >
            Add Bank
          </Button>
        </div>
        {fields.map((field, index) => (
          <div key={field.id} className="border rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium text-gray-900 dark:text-white">Bank {index + 1}</h4>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  Remove
                </Button>
              )}
            </div>
            <FormGroup>
              <FormRow>
                <FormField label="Bank Name" error={errors.bankDetails?.[index]?.bankName?.message} required>
                  <Input
                    {...register(`bankDetails.${index}.bankName`)}
                    placeholder="Enter bank name"
                    error={!!errors.bankDetails?.[index]?.bankName}
                  />
                </FormField>
                <FormField label="Bank Type" error={errors.bankDetails?.[index]?.bankType?.message} required>
                  <Select
                    {...register(`bankDetails.${index}.bankType`)}
                    options={bankTypes}
                    placeholder="Select bank type"
                    error={!!errors.bankDetails?.[index]?.bankType}
                  />
                </FormField>
              </FormRow>
              <FormRow>
                <FormField label="Account Number" error={errors.bankDetails?.[index]?.accountNumber?.message} required>
                  <Input
                    {...register(`bankDetails.${index}.accountNumber`)}
                    placeholder="Enter account number"
                    error={!!errors.bankDetails?.[index]?.accountNumber}
                  />
                </FormField>
                <FormField label="Account Holder Name" error={errors.bankDetails?.[index]?.accountHolderName?.message} required>
                  <Input
                    {...register(`bankDetails.${index}.accountHolderName`)}
                    placeholder="Enter account holder name"
                    error={!!errors.bankDetails?.[index]?.accountHolderName}
                  />
                </FormField>
              </FormRow>
              <FormRow>
                <FormField label="IFSC Code" error={errors.bankDetails?.[index]?.ifscCode?.message}>
                  <Input
                    {...register(`bankDetails.${index}.ifscCode`)}
                    placeholder="Enter IFSC code"
                    error={!!errors.bankDetails?.[index]?.ifscCode}
                  />
                </FormField>
                <FormField label="Branch Name" error={errors.bankDetails?.[index]?.branchName?.message}>
                  <Input
                    {...register(`bankDetails.${index}.branchName`)}
                    placeholder="Enter branch name"
                    error={!!errors.bankDetails?.[index]?.branchName}
                  />
                </FormField>
              </FormRow>
            </FormGroup>
          </div>
        ))}
      </div>

      {/* Tax Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Tax Information</h3>
        <FormGroup>
          <FormRow>
            <FormField label="GST Number" error={errors.taxInfo?.gstNumber?.message}>
              <Input
                {...register('taxInfo.gstNumber')}
                placeholder="Enter GST number"
                error={!!errors.taxInfo?.gstNumber}
              />
            </FormField>
            <FormField label="PAN Number" error={errors.taxInfo?.panNumber?.message}>
              <Input
                {...register('taxInfo.panNumber')}
                placeholder="Enter PAN number"
                error={!!errors.taxInfo?.panNumber}
              />
            </FormField>
          </FormRow>
          <FormField label="TAN Number" error={errors.taxInfo?.tanNumber?.message}>
            <Input
              {...register('taxInfo.tanNumber')}
              placeholder="Enter TAN number"
              error={!!errors.taxInfo?.tanNumber}
            />
          </FormField>
        </FormGroup>
      </div>

      {/* Remarks */}
      <FormField label="Remarks" error={errors.remarks?.message}>
        <Textarea
          {...register('remarks')}
          placeholder="Enter any additional remarks"
          error={!!errors.remarks}
          rows={3}
        />
      </FormField>

      {/* Form Actions - Removed duplicate buttons as FormModal provides them */}
    </form>
  )
}

export default CompanyForm

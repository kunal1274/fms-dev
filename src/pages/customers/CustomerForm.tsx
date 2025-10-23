import React, { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../../components/ui/Button'
import { FormField, Input, Textarea, Select, FormGroup, FormRow } from '../../components/ui/Form'
import { useCreateCustomerMutation, useUpdateCustomerMutation } from '../../store/api'
import type { Customer, BusinessType, Currency, PaymentTerms, CustomerStatus } from '../../types/models'
import toast from 'react-hot-toast'

// Validation schema
const customerSchema = z.object({
  customerCode: z.string().min(1, 'Customer code is required'),
  customerName: z.string().min(1, 'Customer name is required'),
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

type CustomerFormData = z.infer<typeof customerSchema>

interface CustomerFormProps {
  customer?: Customer | null
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

const statusOptions: { value: CustomerStatus; label: string }[] = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
  { value: 'OnHold', label: 'On Hold' },
  { value: 'Blacklisted', label: 'Blacklisted' },
]

const bankTypes: { value: string; label: string }[] = [
  { value: 'Bank', label: 'Bank' },
  { value: 'UPI', label: 'UPI' },
  { value: 'Cash', label: 'Cash' },
  { value: 'BankAndUpi', label: 'Bank & UPI' },
]

const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onSuccess, onCancel }) => {
  const [createCustomer, { isLoading: isCreating }] = useCreateCustomerMutation()
  const [updateCustomer, { isLoading: isUpdating }] = useUpdateCustomerMutation()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
    reset,
    watch,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      customerCode: '',
      customerName: '',
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
    if (customer) {
      reset({
        customerCode: customer.customerCode || '',
        customerName: customer.customerName || '',
        businessType: customer.businessType || '',
        primaryAddress: customer.primaryAddress || {},
        secondaryAddress: customer.secondaryAddress || {},
        shippingAddress: customer.shippingAddress || {},
        contactInfo: customer.contactInfo || {},
        bankDetails: customer.bankDetails?.length ? customer.bankDetails : [
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
        taxInfo: customer.taxInfo || {},
        currency: customer.currency || 'INR',
        creditLimit: customer.creditLimit || 0,
        paymentTerms: customer.paymentTerms || '',
        status: customer.status || 'Active',
        remarks: customer.remarks || '',
      })
    }
  }, [customer, reset])

  const onSubmit = async (data: CustomerFormData) => {
    try {
      if (customer) {
        await updateCustomer({
          id: customer.id || customer._id || '',
          data,
        }).unwrap()
        toast.success('Customer updated successfully')
      } else {
        await createCustomer(data).unwrap()
        toast.success('Customer created successfully')
      }
      onSuccess()
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to save customer')
    }
  }

  const isLoading = isCreating || isUpdating

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormGroup>
        <FormRow>
          <FormField label="Customer Code" error={errors.customerCode?.message} required>
            <Input
              {...register('customerCode')}
              placeholder="Enter customer code"
              error={!!errors.customerCode}
            />
          </FormField>
          <FormField label="Customer Name" error={errors.customerName?.message} required>
            <Input
              {...register('customerName')}
              placeholder="Enter customer name"
              error={!!errors.customerName}
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

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : customer ? 'Update Customer' : 'Create Customer'}
        </Button>
      </div>
    </form>
  )
}

export default CustomerForm

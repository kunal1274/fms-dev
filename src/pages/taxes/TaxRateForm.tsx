import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../../components/ui/Button'
import { FormField, Input, Textarea, Select, FormGroup, FormRow } from '../../components/ui/Form'
import { useCreateTaxRateMutation, useUpdateTaxRateMutation } from '../../store/api'
import type { TaxRate } from '../../types/models'
import toast from 'react-hot-toast'

// Validation schema
const taxRateSchema = z.object({
  name: z.string().min(1, 'Tax name is required'),
  code: z.string().min(1, 'Tax code is required'),
  rate: z.number().min(0, 'Tax rate must be positive').max(100, 'Tax rate cannot exceed 100%'),
  type: z.string().min(1, 'Tax type is required'),
  description: z.string().optional(),
  effectiveFrom: z.string().min(1, 'Effective from date is required'),
  effectiveTo: z.string().optional(),
  status: z.string().min(1, 'Status is required'),
  isDefault: z.boolean().optional(),
  applicableTo: z.array(z.string()).optional(),
  exemptions: z.array(z.string()).optional(),
  remarks: z.string().optional(),
})

type TaxRateFormData = z.infer<typeof taxRateSchema>

interface TaxRateFormProps {
  rate?: TaxRate | null
  onSuccess: () => void
  onCancel: () => void
}

const taxTypes: { value: string; label: string }[] = [
  { value: 'GST', label: 'GST (Goods and Services Tax)' },
  { value: 'VAT', label: 'VAT (Value Added Tax)' },
  { value: 'Sales Tax', label: 'Sales Tax' },
  { value: 'Service Tax', label: 'Service Tax' },
  { value: 'Income Tax', label: 'Income Tax' },
  { value: 'Corporate Tax', label: 'Corporate Tax' },
  { value: 'Customs Duty', label: 'Customs Duty' },
  { value: 'Excise Duty', label: 'Excise Duty' },
  { value: 'Others', label: 'Others' },
]

const statusOptions: { value: string; label: string }[] = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
  { value: 'Expired', label: 'Expired' },
  { value: 'Suspended', label: 'Suspended' },
]

const applicableToOptions: { value: string; label: string }[] = [
  { value: 'Sales', label: 'Sales' },
  { value: 'Purchase', label: 'Purchase' },
  { value: 'Service', label: 'Service' },
  { value: 'Goods', label: 'Goods' },
  { value: 'All', label: 'All' },
]

const TaxRateForm: React.FC<TaxRateFormProps> = ({ rate, onSuccess, onCancel }) => {
  const [createRate, { isLoading: isCreating }] = useCreateTaxRateMutation()
  const [updateRate, { isLoading: isUpdating }] = useUpdateTaxRateMutation()

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
  } = useForm<TaxRateFormData>({
    resolver: zodResolver(taxRateSchema),
    defaultValues: {
      name: '',
      code: '',
      rate: 0,
      type: '',
      description: '',
      effectiveFrom: new Date().toISOString().split('T')[0],
      effectiveTo: '',
      status: 'Active',
      isDefault: false,
      applicableTo: [],
      exemptions: [],
      remarks: '',
    },
  })

  useEffect(() => {
    if (rate) {
      reset({
        name: rate.name || '',
        code: rate.code || '',
        rate: rate.rate || 0,
        type: rate.type || '',
        description: rate.description || '',
        effectiveFrom: rate.effectiveFrom ? new Date(rate.effectiveFrom).toISOString().split('T')[0] : '',
        effectiveTo: rate.effectiveTo ? new Date(rate.effectiveTo).toISOString().split('T')[0] : '',
        status: rate.status || 'Active',
        isDefault: rate.isDefault || false,
        applicableTo: rate.applicableTo || [],
        exemptions: rate.exemptions || [],
        remarks: rate.remarks || '',
      })
    }
  }, [rate, reset])

  const onSubmit = async (data: TaxRateFormData) => {
    try {
      if (rate) {
        await updateRate({
          id: rate.id || rate._id || '',
          data,
        }).unwrap()
        toast.success('Tax rate updated successfully')
      } else {
        await createRate(data).unwrap()
        toast.success('Tax rate created successfully')
      }
      onSuccess()
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to save tax rate')
    }
  }

  const isLoading = isCreating || isUpdating

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormGroup>
        <FormRow>
          <FormField label="Tax Name" error={errors.name?.message} required>
            <Input
              {...register('name')}
              placeholder="Enter tax name"
              error={!!errors.name}
            />
          </FormField>
          <FormField label="Tax Code" error={errors.code?.message} required>
            <Input
              {...register('code')}
              placeholder="Enter tax code"
              error={!!errors.code}
            />
          </FormField>
        </FormRow>

        <FormRow>
          <FormField label="Tax Rate (%)" error={errors.rate?.message} required>
            <Input
              type="number"
              step="0.01"
              min="0"
              max="100"
              {...register('rate', { valueAsNumber: true })}
              placeholder="Enter tax rate percentage"
              error={!!errors.rate}
            />
          </FormField>
          <FormField label="Tax Type" error={errors.type?.message} required>
            <Select
              {...register('type')}
              options={taxTypes}
              placeholder="Select tax type"
              error={!!errors.type}
            />
          </FormField>
        </FormRow>

        <FormRow>
          <FormField label="Effective From" error={errors.effectiveFrom?.message} required>
            <Input
              type="date"
              {...register('effectiveFrom')}
              error={!!errors.effectiveFrom}
            />
          </FormField>
          <FormField label="Effective To" error={errors.effectiveTo?.message}>
            <Input
              type="date"
              {...register('effectiveTo')}
              error={!!errors.effectiveTo}
            />
          </FormField>
        </FormRow>

        <FormRow>
          <FormField label="Status" error={errors.status?.message} required>
            <Select
              {...register('status')}
              options={statusOptions}
              placeholder="Select status"
              error={!!errors.status}
            />
          </FormField>
          <FormField label="Default Tax Rate" error={errors.isDefault?.message}>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...register('isDefault')}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label className="text-sm text-gray-700 dark:text-gray-300">
                Mark as default tax rate
              </label>
            </div>
          </FormField>
        </FormRow>
      </FormGroup>

      {/* Description */}
      <FormField label="Description" error={errors.description?.message}>
        <Textarea
          {...register('description')}
          placeholder="Enter tax description"
          error={!!errors.description}
          rows={3}
        />
      </FormField>

      {/* Applicable To */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Applicable To</h3>
        <div className="grid grid-cols-2 gap-4">
          {applicableToOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...register('applicableTo')}
                value={option.value}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label className="text-sm text-gray-700 dark:text-gray-300">
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Exemptions */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Exemptions</h3>
        <FormField label="Exemption Details" error={errors.exemptions?.message}>
          <Textarea
            {...register('exemptions')}
            placeholder="Enter exemption details (one per line)"
            error={!!errors.exemptions}
            rows={4}
          />
        </FormField>
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
          {isLoading ? 'Saving...' : rate ? 'Update Tax Rate' : 'Create Tax Rate'}
        </Button>
      </div>
    </form>
  )
}

export default TaxRateForm

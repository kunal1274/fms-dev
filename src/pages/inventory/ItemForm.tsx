import React, { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../../components/ui/Button'
import { FormField, Input, Textarea, Select, FormGroup, FormRow } from '../../components/ui/Form'
import { useCreateItemMutation, useUpdateItemMutation } from '../../store/api'
import type { Item, ItemCategory, Currency, ItemStatus } from '../../types/models'
import toast from 'react-hot-toast'

// Validation schema
const itemSchema = z.object({
  itemCode: z.string().min(1, 'Item code is required'),
  itemName: z.string().min(1, 'Item name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  subCategory: z.string().optional(),
  unit: z.string().min(1, 'Unit is required'),
  unitPrice: z.number().min(0, 'Unit price must be positive'),
  costPrice: z.number().min(0, 'Cost price must be positive').optional(),
  currentStock: z.number().min(0, 'Stock cannot be negative'),
  minimumStock: z.number().min(0, 'Minimum stock cannot be negative').optional(),
  maximumStock: z.number().min(0, 'Maximum stock cannot be negative').optional(),
  reorderLevel: z.number().min(0, 'Reorder level cannot be negative').optional(),
  currency: z.string().min(1, 'Currency is required'),
  taxRate: z.number().min(0, 'Tax rate cannot be negative').optional(),
  status: z.string().min(1, 'Status is required'),
  isSerialized: z.boolean().optional(),
  isBatchTracked: z.boolean().optional(),
  dimensions: z.object({
    length: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    weight: z.number().optional(),
  }).optional(),
  supplierInfo: z.object({
    supplierId: z.string().optional(),
    supplierName: z.string().optional(),
    supplierCode: z.string().optional(),
  }).optional(),
  remarks: z.string().optional(),
})

type ItemFormData = z.infer<typeof itemSchema>

interface ItemFormProps {
  item?: Item | null
  onSuccess: () => void
  onCancel: () => void
}

const categories: { value: ItemCategory; label: string }[] = [
  { value: 'RawMaterial', label: 'Raw Material' },
  { value: 'FinishedGood', label: 'Finished Good' },
  { value: 'SemiFinished', label: 'Semi Finished' },
  { value: 'Consumable', label: 'Consumable' },
  { value: 'Service', label: 'Service' },
  { value: 'Asset', label: 'Asset' },
  { value: 'Others', label: 'Others' },
]

const units: { value: string; label: string }[] = [
  { value: 'PCS', label: 'Pieces' },
  { value: 'KG', label: 'Kilograms' },
  { value: 'L', label: 'Liters' },
  { value: 'M', label: 'Meters' },
  { value: 'M2', label: 'Square Meters' },
  { value: 'M3', label: 'Cubic Meters' },
  { value: 'BOX', label: 'Box' },
  { value: 'CARTON', label: 'Carton' },
  { value: 'PACK', label: 'Pack' },
  { value: 'SET', label: 'Set' },
  { value: 'PAIR', label: 'Pair' },
  { value: 'DOZEN', label: 'Dozen' },
]

const currencies: { value: Currency; label: string }[] = [
  { value: 'INR', label: 'INR' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
]

const statusOptions: { value: ItemStatus; label: string }[] = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
  { value: 'Discontinued', label: 'Discontinued' },
  { value: 'OutOfStock', label: 'Out of Stock' },
]

const ItemForm: React.FC<ItemFormProps> = ({ item, onSuccess, onCancel }) => {
  const [createItem, { isLoading: isCreating }] = useCreateItemMutation()
  const [updateItem, { isLoading: isUpdating }] = useUpdateItemMutation()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
    reset,
    watch,
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      itemCode: '',
      itemName: '',
      description: '',
      category: '',
      subCategory: '',
      unit: '',
      unitPrice: 0,
      costPrice: 0,
      currentStock: 0,
      minimumStock: 0,
      maximumStock: 0,
      reorderLevel: 0,
      currency: 'INR',
      taxRate: 0,
      status: 'Active',
      isSerialized: false,
      isBatchTracked: false,
      dimensions: {
        length: 0,
        width: 0,
        height: 0,
        weight: 0,
      },
      supplierInfo: {
        supplierId: '',
        supplierName: '',
        supplierCode: '',
      },
      remarks: '',
    },
  })

  useEffect(() => {
    if (item) {
      reset({
        itemCode: item.itemCode || '',
        itemName: item.itemName || '',
        description: item.description || '',
        category: item.category || '',
        subCategory: item.subCategory || '',
        unit: item.unit || '',
        unitPrice: item.unitPrice || 0,
        costPrice: item.costPrice || 0,
        currentStock: item.currentStock || 0,
        minimumStock: item.minimumStock || 0,
        maximumStock: item.maximumStock || 0,
        reorderLevel: item.reorderLevel || 0,
        currency: item.currency || 'INR',
        taxRate: item.taxRate || 0,
        status: item.status || 'Active',
        isSerialized: item.isSerialized || false,
        isBatchTracked: item.isBatchTracked || false,
        dimensions: item.dimensions || {
          length: 0,
          width: 0,
          height: 0,
          weight: 0,
        },
        supplierInfo: item.supplierInfo || {
          supplierId: '',
          supplierName: '',
          supplierCode: '',
        },
        remarks: item.remarks || '',
      })
    }
  }, [item, reset])

  const onSubmit = async (data: ItemFormData) => {
    try {
      if (item) {
        await updateItem({
          id: item.id || item._id || '',
          data,
        }).unwrap()
        toast.success('Item updated successfully')
      } else {
        await createItem(data).unwrap()
        toast.success('Item created successfully')
      }
      onSuccess()
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to save item')
    }
  }

  const isLoading = isCreating || isUpdating

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormGroup>
        <FormRow>
          <FormField label="Item Code" error={errors.itemCode?.message} required>
            <Input
              {...register('itemCode')}
              placeholder="Enter item code"
              error={!!errors.itemCode}
            />
          </FormField>
          <FormField label="Item Name" error={errors.itemName?.message} required>
            <Input
              {...register('itemName')}
              placeholder="Enter item name"
              error={!!errors.itemName}
            />
          </FormField>
        </FormRow>

        <FormField label="Description" error={errors.description?.message}>
          <Textarea
            {...register('description')}
            placeholder="Enter item description"
            error={!!errors.description}
            rows={3}
          />
        </FormField>

        <FormRow>
          <FormField label="Category" error={errors.category?.message} required>
            <Select
              {...register('category')}
              options={categories}
              placeholder="Select category"
              error={!!errors.category}
            />
          </FormField>
          <FormField label="Sub Category" error={errors.subCategory?.message}>
            <Input
              {...register('subCategory')}
              placeholder="Enter sub category"
              error={!!errors.subCategory}
            />
          </FormField>
        </FormRow>

        <FormRow>
          <FormField label="Unit" error={errors.unit?.message} required>
            <Select
              {...register('unit')}
              options={units}
              placeholder="Select unit"
              error={!!errors.unit}
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
      </FormGroup>

      {/* Pricing Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Pricing Information</h3>
        <FormGroup>
          <FormRow>
            <FormField label="Unit Price" error={errors.unitPrice?.message} required>
              <Input
                type="number"
                step="0.01"
                {...register('unitPrice', { valueAsNumber: true })}
                placeholder="Enter unit price"
                error={!!errors.unitPrice}
              />
            </FormField>
            <FormField label="Cost Price" error={errors.costPrice?.message}>
              <Input
                type="number"
                step="0.01"
                {...register('costPrice', { valueAsNumber: true })}
                placeholder="Enter cost price"
                error={!!errors.costPrice}
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
            <FormField label="Tax Rate (%)" error={errors.taxRate?.message}>
              <Input
                type="number"
                step="0.01"
                {...register('taxRate', { valueAsNumber: true })}
                placeholder="Enter tax rate"
                error={!!errors.taxRate}
              />
            </FormField>
          </FormRow>
        </FormGroup>
      </div>

      {/* Stock Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Stock Information</h3>
        <FormGroup>
          <FormRow>
            <FormField label="Current Stock" error={errors.currentStock?.message} required>
              <Input
                type="number"
                {...register('currentStock', { valueAsNumber: true })}
                placeholder="Enter current stock"
                error={!!errors.currentStock}
              />
            </FormField>
            <FormField label="Minimum Stock" error={errors.minimumStock?.message}>
              <Input
                type="number"
                {...register('minimumStock', { valueAsNumber: true })}
                placeholder="Enter minimum stock"
                error={!!errors.minimumStock}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Maximum Stock" error={errors.maximumStock?.message}>
              <Input
                type="number"
                {...register('maximumStock', { valueAsNumber: true })}
                placeholder="Enter maximum stock"
                error={!!errors.maximumStock}
              />
            </FormField>
            <FormField label="Reorder Level" error={errors.reorderLevel?.message}>
              <Input
                type="number"
                {...register('reorderLevel', { valueAsNumber: true })}
                placeholder="Enter reorder level"
                error={!!errors.reorderLevel}
              />
            </FormField>
          </FormRow>
        </FormGroup>
      </div>

      {/* Dimensions */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Dimensions</h3>
        <FormGroup>
          <FormRow>
            <FormField label="Length (cm)" error={errors.dimensions?.length?.message}>
              <Input
                type="number"
                step="0.01"
                {...register('dimensions.length', { valueAsNumber: true })}
                placeholder="Enter length"
                error={!!errors.dimensions?.length}
              />
            </FormField>
            <FormField label="Width (cm)" error={errors.dimensions?.width?.message}>
              <Input
                type="number"
                step="0.01"
                {...register('dimensions.width', { valueAsNumber: true })}
                placeholder="Enter width"
                error={!!errors.dimensions?.width}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Height (cm)" error={errors.dimensions?.height?.message}>
              <Input
                type="number"
                step="0.01"
                {...register('dimensions.height', { valueAsNumber: true })}
                placeholder="Enter height"
                error={!!errors.dimensions?.height}
              />
            </FormField>
            <FormField label="Weight (kg)" error={errors.dimensions?.weight?.message}>
              <Input
                type="number"
                step="0.01"
                {...register('dimensions.weight', { valueAsNumber: true })}
                placeholder="Enter weight"
                error={!!errors.dimensions?.weight}
              />
            </FormField>
          </FormRow>
        </FormGroup>
      </div>

      {/* Supplier Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Supplier Information</h3>
        <FormGroup>
          <FormRow>
            <FormField label="Supplier Name" error={errors.supplierInfo?.supplierName?.message}>
              <Input
                {...register('supplierInfo.supplierName')}
                placeholder="Enter supplier name"
                error={!!errors.supplierInfo?.supplierName}
              />
            </FormField>
            <FormField label="Supplier Code" error={errors.supplierInfo?.supplierCode?.message}>
              <Input
                {...register('supplierInfo.supplierCode')}
                placeholder="Enter supplier code"
                error={!!errors.supplierInfo?.supplierCode}
              />
            </FormField>
          </FormRow>
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
          {isLoading ? 'Saving...' : item ? 'Update Item' : 'Create Item'}
        </Button>
      </div>
    </form>
  )
}

export default ItemForm

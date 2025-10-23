import React, { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../../components/ui/Button'
import { FormField, Input, Textarea, Select, FormGroup, FormRow } from '../../components/ui/Form'
import { useCreateSalesOrderMutation, useUpdateSalesOrderMutation } from '../../store/api'
import type { SalesOrder, OrderStatus, Currency, PaymentTerms } from '../../types/models'
import toast from 'react-hot-toast'

// Validation schema
const salesOrderSchema = z.object({
  orderNumber: z.string().min(1, 'Order number is required'),
  customerId: z.string().min(1, 'Customer is required'),
  customerName: z.string().min(1, 'Customer name is required'),
  customerCode: z.string().min(1, 'Customer code is required'),
  orderDate: z.string().min(1, 'Order date is required'),
  deliveryDate: z.string().optional(),
  currency: z.string().min(1, 'Currency is required'),
  paymentTerms: z.string().optional(),
  status: z.string().min(1, 'Status is required'),
  items: z.array(z.object({
    itemId: z.string().min(1, 'Item is required'),
    itemCode: z.string().min(1, 'Item code is required'),
    itemName: z.string().min(1, 'Item name is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    unitPrice: z.number().min(0, 'Unit price must be positive'),
    totalPrice: z.number().min(0, 'Total price must be positive'),
    unit: z.string().optional(),
    description: z.string().optional(),
  })).min(1, 'At least one item is required'),
  subtotal: z.number().min(0, 'Subtotal must be positive'),
  taxAmount: z.number().min(0, 'Tax amount must be positive').optional(),
  discountAmount: z.number().min(0, 'Discount amount must be positive').optional(),
  totalAmount: z.number().min(0, 'Total amount must be positive'),
  shippingAddress: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
  }).optional(),
  notes: z.string().optional(),
})

type SalesOrderFormData = z.infer<typeof salesOrderSchema>

interface SalesOrderFormProps {
  order?: SalesOrder | null
  onSuccess: () => void
  onCancel: () => void
}

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: 'Draft', label: 'Draft' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Confirmed', label: 'Confirmed' },
  { value: 'Processing', label: 'Processing' },
  { value: 'Shipped', label: 'Shipped' },
  { value: 'Delivered', label: 'Delivered' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' },
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

const SalesOrderForm: React.FC<SalesOrderFormProps> = ({ order, onSuccess, onCancel }) => {
  const [createOrder, { isLoading: isCreating }] = useCreateSalesOrderMutation()
  const [updateOrder, { isLoading: isUpdating }] = useUpdateSalesOrderMutation()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
    reset,
    watch,
    setValue,
  } = useForm<SalesOrderFormData>({
    resolver: zodResolver(salesOrderSchema),
    defaultValues: {
      orderNumber: '',
      customerId: '',
      customerName: '',
      customerCode: '',
      orderDate: new Date().toISOString().split('T')[0],
      deliveryDate: '',
      currency: 'INR',
      paymentTerms: '',
      status: 'Draft',
      items: [
        {
          itemId: '',
          itemCode: '',
          itemName: '',
          quantity: 1,
          unitPrice: 0,
          totalPrice: 0,
          unit: '',
          description: '',
        },
      ],
      subtotal: 0,
      taxAmount: 0,
      discountAmount: 0,
      totalAmount: 0,
      shippingAddress: {
        street: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
      },
      notes: '',
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  const watchedItems = watch('items')
  const watchedSubtotal = watch('subtotal')
  const watchedTaxAmount = watch('taxAmount')
  const watchedDiscountAmount = watch('discountAmount')

  // Calculate totals when items change
  useEffect(() => {
    const subtotal = watchedItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0)
    const taxAmount = subtotal * 0.18 // 18% tax - should be configurable
    const totalAmount = subtotal + taxAmount - (watchedDiscountAmount || 0)
    
    setValue('subtotal', subtotal)
    setValue('taxAmount', taxAmount)
    setValue('totalAmount', totalAmount)
  }, [watchedItems, watchedDiscountAmount, setValue])

  useEffect(() => {
    if (order) {
      reset({
        orderNumber: order.orderNumber || '',
        customerId: order.customerId || '',
        customerName: order.customerName || '',
        customerCode: order.customerCode || '',
        orderDate: order.orderDate ? new Date(order.orderDate).toISOString().split('T')[0] : '',
        deliveryDate: order.deliveryDate ? new Date(order.deliveryDate).toISOString().split('T')[0] : '',
        currency: order.currency || 'INR',
        paymentTerms: order.paymentTerms || '',
        status: order.status || 'Draft',
        items: order.items?.length ? order.items : [
          {
            itemId: '',
            itemCode: '',
            itemName: '',
            quantity: 1,
            unitPrice: 0,
            totalPrice: 0,
            unit: '',
            description: '',
          },
        ],
        subtotal: order.subtotal || 0,
        taxAmount: order.taxAmount || 0,
        discountAmount: order.discountAmount || 0,
        totalAmount: order.totalAmount || 0,
        shippingAddress: order.shippingAddress || {
          street: '',
          city: '',
          state: '',
          country: '',
          postalCode: '',
        },
        notes: order.notes || '',
      })
    }
  }, [order, reset])

  const onSubmit = async (data: SalesOrderFormData) => {
    try {
      if (order) {
        await updateOrder({
          id: order.id || order._id || '',
          data,
        }).unwrap()
        toast.success('Sales order updated successfully')
      } else {
        await createOrder(data).unwrap()
        toast.success('Sales order created successfully')
      }
      onSuccess()
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to save sales order')
    }
  }

  const addItem = () => {
    append({
      itemId: '',
      itemCode: '',
      itemName: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      unit: '',
      description: '',
    })
  }

  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    }
  }

  const updateItemTotal = (index: number, quantity: number, unitPrice: number) => {
    const totalPrice = quantity * unitPrice
    setValue(`items.${index}.totalPrice`, totalPrice)
  }

  const isLoading = isCreating || isUpdating

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Order Header */}
      <FormGroup>
        <FormRow>
          <FormField label="Order Number" error={errors.orderNumber?.message} required>
            <Input
              {...register('orderNumber')}
              placeholder="Enter order number"
              error={!!errors.orderNumber}
            />
          </FormField>
          <FormField label="Order Date" error={errors.orderDate?.message} required>
            <Input
              type="date"
              {...register('orderDate')}
              error={!!errors.orderDate}
            />
          </FormField>
        </FormRow>

        <FormRow>
          <FormField label="Customer Name" error={errors.customerName?.message} required>
            <Input
              {...register('customerName')}
              placeholder="Enter customer name"
              error={!!errors.customerName}
            />
          </FormField>
          <FormField label="Customer Code" error={errors.customerCode?.message} required>
            <Input
              {...register('customerCode')}
              placeholder="Enter customer code"
              error={!!errors.customerCode}
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
          <FormField label="Delivery Date" error={errors.deliveryDate?.message}>
            <Input
              type="date"
              {...register('deliveryDate')}
              error={!!errors.deliveryDate}
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
      </FormGroup>

      {/* Order Items */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Order Items</h3>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            Add Item
          </Button>
        </div>
        
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-gray-900 dark:text-white">Item {index + 1}</h4>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeItem(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>
              
              <FormGroup>
                <FormRow>
                  <FormField label="Item Code" error={errors.items?.[index]?.itemCode?.message} required>
                    <Input
                      {...register(`items.${index}.itemCode`)}
                      placeholder="Enter item code"
                      error={!!errors.items?.[index]?.itemCode}
                    />
                  </FormField>
                  <FormField label="Item Name" error={errors.items?.[index]?.itemName?.message} required>
                    <Input
                      {...register(`items.${index}.itemName`)}
                      placeholder="Enter item name"
                      error={!!errors.items?.[index]?.itemName}
                    />
                  </FormField>
                </FormRow>
                
                <FormRow>
                  <FormField label="Quantity" error={errors.items?.[index]?.quantity?.message} required>
                    <Input
                      type="number"
                      {...register(`items.${index}.quantity`, { 
                        valueAsNumber: true,
                        onChange: (e) => {
                          const quantity = parseFloat(e.target.value) || 0
                          const unitPrice = watchedItems[index]?.unitPrice || 0
                          updateItemTotal(index, quantity, unitPrice)
                        }
                      })}
                      placeholder="Enter quantity"
                      error={!!errors.items?.[index]?.quantity}
                    />
                  </FormField>
                  <FormField label="Unit Price" error={errors.items?.[index]?.unitPrice?.message} required>
                    <Input
                      type="number"
                      step="0.01"
                      {...register(`items.${index}.unitPrice`, { 
                        valueAsNumber: true,
                        onChange: (e) => {
                          const unitPrice = parseFloat(e.target.value) || 0
                          const quantity = watchedItems[index]?.quantity || 0
                          updateItemTotal(index, quantity, unitPrice)
                        }
                      })}
                      placeholder="Enter unit price"
                      error={!!errors.items?.[index]?.unitPrice}
                    />
                  </FormField>
                </FormRow>
                
                <FormRow>
                  <FormField label="Total Price" error={errors.items?.[index]?.totalPrice?.message}>
                    <Input
                      type="number"
                      step="0.01"
                      {...register(`items.${index}.totalPrice`, { valueAsNumber: true })}
                      placeholder="Total price"
                      error={!!errors.items?.[index]?.totalPrice}
                      readOnly
                    />
                  </FormField>
                  <FormField label="Unit" error={errors.items?.[index]?.unit?.message}>
                    <Input
                      {...register(`items.${index}.unit`)}
                      placeholder="Enter unit"
                      error={!!errors.items?.[index]?.unit}
                    />
                  </FormField>
                </FormRow>
              </FormGroup>
            </div>
          ))}
        </div>
      </div>

      {/* Order Totals */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Order Totals</h3>
        <FormGroup>
          <FormRow>
            <FormField label="Subtotal" error={errors.subtotal?.message}>
              <Input
                type="number"
                step="0.01"
                {...register('subtotal', { valueAsNumber: true })}
                placeholder="Subtotal"
                error={!!errors.subtotal}
                readOnly
              />
            </FormField>
            <FormField label="Tax Amount" error={errors.taxAmount?.message}>
              <Input
                type="number"
                step="0.01"
                {...register('taxAmount', { valueAsNumber: true })}
                placeholder="Tax amount"
                error={!!errors.taxAmount}
                readOnly
              />
            </FormField>
          </FormRow>
          
          <FormRow>
            <FormField label="Discount Amount" error={errors.discountAmount?.message}>
              <Input
                type="number"
                step="0.01"
                {...register('discountAmount', { valueAsNumber: true })}
                placeholder="Discount amount"
                error={!!errors.discountAmount}
              />
            </FormField>
            <FormField label="Total Amount" error={errors.totalAmount?.message}>
              <Input
                type="number"
                step="0.01"
                {...register('totalAmount', { valueAsNumber: true })}
                placeholder="Total amount"
                error={!!errors.totalAmount}
                readOnly
              />
            </FormField>
          </FormRow>
        </FormGroup>
      </div>

      {/* Shipping Address */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Shipping Address</h3>
        <FormGroup>
          <FormField label="Street" error={errors.shippingAddress?.street?.message}>
            <Input
              {...register('shippingAddress.street')}
              placeholder="Enter street address"
              error={!!errors.shippingAddress?.street}
            />
          </FormField>
          <FormRow>
            <FormField label="City" error={errors.shippingAddress?.city?.message}>
              <Input
                {...register('shippingAddress.city')}
                placeholder="Enter city"
                error={!!errors.shippingAddress?.city}
              />
            </FormField>
            <FormField label="State" error={errors.shippingAddress?.state?.message}>
              <Input
                {...register('shippingAddress.state')}
                placeholder="Enter state"
                error={!!errors.shippingAddress?.state}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Country" error={errors.shippingAddress?.country?.message}>
              <Input
                {...register('shippingAddress.country')}
                placeholder="Enter country"
                error={!!errors.shippingAddress?.country}
              />
            </FormField>
            <FormField label="Postal Code" error={errors.shippingAddress?.postalCode?.message}>
              <Input
                {...register('shippingAddress.postalCode')}
                placeholder="Enter postal code"
                error={!!errors.shippingAddress?.postalCode}
              />
            </FormField>
          </FormRow>
        </FormGroup>
      </div>

      {/* Notes */}
      <FormField label="Notes" error={errors.notes?.message}>
        <Textarea
          {...register('notes')}
          placeholder="Enter any additional notes"
          error={!!errors.notes}
          rows={3}
        />
      </FormField>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : order ? 'Update Order' : 'Create Order'}
        </Button>
      </div>
    </form>
  )
}

export default SalesOrderForm

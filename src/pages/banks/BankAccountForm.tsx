import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../../components/ui/Button'
import { FormField, Input, Textarea, Select, FormGroup, FormRow } from '../../components/ui/Form'
import { useCreateBankAccountMutation, useUpdateBankAccountMutation } from '../../store/api'
import type { BankAccount, Currency } from '../../types/models'
import toast from 'react-hot-toast'

// Validation schema
const bankAccountSchema = z.object({
  accountNumber: z.string().min(1, 'Account number is required'),
  bankName: z.string().min(1, 'Bank name is required'),
  accountHolderName: z.string().min(1, 'Account holder name is required'),
  accountType: z.string().min(1, 'Account type is required'),
  ifscCode: z.string().optional(),
  swiftCode: z.string().optional(),
  branchName: z.string().optional(),
  branchAddress: z.string().optional(),
  currency: z.string().min(1, 'Currency is required'),
  currentBalance: z.number().min(0, 'Balance cannot be negative'),
  minimumBalance: z.number().min(0, 'Minimum balance cannot be negative').optional(),
  status: z.string().min(1, 'Status is required'),
  isPrimary: z.boolean().optional(),
  openingDate: z.string().optional(),
  closingDate: z.string().optional(),
  remarks: z.string().optional(),
})

type BankAccountFormData = z.infer<typeof bankAccountSchema>

interface BankAccountFormProps {
  account?: BankAccount | null
  onSuccess: () => void
  onCancel: () => void
}

const accountTypes: { value: string; label: string }[] = [
  { value: 'Savings', label: 'Savings' },
  { value: 'Current', label: 'Current' },
  { value: 'Fixed Deposit', label: 'Fixed Deposit' },
  { value: 'Recurring Deposit', label: 'Recurring Deposit' },
  { value: 'Loan', label: 'Loan' },
  { value: 'Credit Card', label: 'Credit Card' },
  { value: 'Others', label: 'Others' },
]

const currencies: { value: Currency; label: string }[] = [
  { value: 'INR', label: 'INR' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
]

const statusOptions: { value: string; label: string }[] = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
  { value: 'Closed', label: 'Closed' },
  { value: 'Suspended', label: 'Suspended' },
]

const BankAccountForm: React.FC<BankAccountFormProps> = ({ account, onSuccess, onCancel }) => {
  const [createAccount, { isLoading: isCreating }] = useCreateBankAccountMutation()
  const [updateAccount, { isLoading: isUpdating }] = useUpdateBankAccountMutation()

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
  } = useForm<BankAccountFormData>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      accountNumber: '',
      bankName: '',
      accountHolderName: '',
      accountType: '',
      ifscCode: '',
      swiftCode: '',
      branchName: '',
      branchAddress: '',
      currency: 'INR',
      currentBalance: 0,
      minimumBalance: 0,
      status: 'Active',
      isPrimary: false,
      openingDate: '',
      closingDate: '',
      remarks: '',
    },
  })

  useEffect(() => {
    if (account) {
      reset({
        accountNumber: account.accountNumber || '',
        bankName: account.bankName || '',
        accountHolderName: account.accountHolderName || '',
        accountType: account.accountType || '',
        ifscCode: account.ifscCode || '',
        swiftCode: account.swiftCode || '',
        branchName: account.branchName || '',
        branchAddress: account.branchAddress || '',
        currency: account.currency || 'INR',
        currentBalance: account.currentBalance || 0,
        minimumBalance: account.minimumBalance || 0,
        status: account.status || 'Active',
        isPrimary: account.isPrimary || false,
        openingDate: account.openingDate ? new Date(account.openingDate).toISOString().split('T')[0] : '',
        closingDate: account.closingDate ? new Date(account.closingDate).toISOString().split('T')[0] : '',
        remarks: account.remarks || '',
      })
    }
  }, [account, reset])

  const onSubmit = async (data: BankAccountFormData) => {
    try {
      if (account) {
        await updateAccount({
          id: account.id || account._id || '',
          data,
        }).unwrap()
        toast.success('Bank account updated successfully')
      } else {
        await createAccount(data).unwrap()
        toast.success('Bank account created successfully')
      }
      onSuccess()
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to save bank account')
    }
  }

  const isLoading = isCreating || isUpdating

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormGroup>
        <FormRow>
          <FormField label="Account Number" error={errors.accountNumber?.message} required>
            <Input
              {...register('accountNumber')}
              placeholder="Enter account number"
              error={!!errors.accountNumber}
            />
          </FormField>
          <FormField label="Bank Name" error={errors.bankName?.message} required>
            <Input
              {...register('bankName')}
              placeholder="Enter bank name"
              error={!!errors.bankName}
            />
          </FormField>
        </FormRow>

        <FormRow>
          <FormField label="Account Holder Name" error={errors.accountHolderName?.message} required>
            <Input
              {...register('accountHolderName')}
              placeholder="Enter account holder name"
              error={!!errors.accountHolderName}
            />
          </FormField>
          <FormField label="Account Type" error={errors.accountType?.message} required>
            <Select
              {...register('accountType')}
              options={accountTypes}
              placeholder="Select account type"
              error={!!errors.accountType}
            />
          </FormField>
        </FormRow>

        <FormRow>
          <FormField label="IFSC Code" error={errors.ifscCode?.message}>
            <Input
              {...register('ifscCode')}
              placeholder="Enter IFSC code"
              error={!!errors.ifscCode}
            />
          </FormField>
          <FormField label="SWIFT Code" error={errors.swiftCode?.message}>
            <Input
              {...register('swiftCode')}
              placeholder="Enter SWIFT code"
              error={!!errors.swiftCode}
            />
          </FormField>
        </FormRow>

        <FormRow>
          <FormField label="Branch Name" error={errors.branchName?.message}>
            <Input
              {...register('branchName')}
              placeholder="Enter branch name"
              error={!!errors.branchName}
            />
          </FormField>
          <FormField label="Currency" error={errors.currency?.message} required>
            <Select
              {...register('currency')}
              options={currencies}
              placeholder="Select currency"
              error={!!errors.currency}
            />
          </FormField>
        </FormRow>

        <FormRow>
          <FormField label="Current Balance" error={errors.currentBalance?.message} required>
            <Input
              type="number"
              step="0.01"
              {...register('currentBalance', { valueAsNumber: true })}
              placeholder="Enter current balance"
              error={!!errors.currentBalance}
            />
          </FormField>
          <FormField label="Minimum Balance" error={errors.minimumBalance?.message}>
            <Input
              type="number"
              step="0.01"
              {...register('minimumBalance', { valueAsNumber: true })}
              placeholder="Enter minimum balance"
              error={!!errors.minimumBalance}
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
          <FormField label="Primary Account" error={errors.isPrimary?.message}>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...register('isPrimary')}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label className="text-sm text-gray-700 dark:text-gray-300">
                Mark as primary account
              </label>
            </div>
          </FormField>
        </FormRow>

        <FormRow>
          <FormField label="Opening Date" error={errors.openingDate?.message}>
            <Input
              type="date"
              {...register('openingDate')}
              error={!!errors.openingDate}
            />
          </FormField>
          <FormField label="Closing Date" error={errors.closingDate?.message}>
            <Input
              type="date"
              {...register('closingDate')}
              error={!!errors.closingDate}
            />
          </FormField>
        </FormRow>
      </FormGroup>

      {/* Branch Address */}
      <FormField label="Branch Address" error={errors.branchAddress?.message}>
        <Textarea
          {...register('branchAddress')}
          placeholder="Enter branch address"
          error={!!errors.branchAddress}
          rows={3}
        />
      </FormField>

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
          {isLoading ? 'Saving...' : account ? 'Update Account' : 'Create Account'}
        </Button>
      </div>
    </form>
  )
}

export default BankAccountForm

import { forwardRef, useImperativeHandle, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { FamilyFinancialInfo } from '../../models/interfaces/data'
import { toastOptions } from '../../utils/toastConfig'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

interface FamilyNFinancialInfoProps {
  defaultValues?: Partial<FamilyFinancialInfo>
  onChange?: (data: FamilyFinancialInfo) => void
  isView?: boolean
}

// Ref interface for type-safe usage in MultiStepForm
export interface FamilyNFinancialInfoRef {
  validateStep: () => Promise<boolean>
  getValues: () => FamilyFinancialInfo
  resetForm: (values?: FamilyFinancialInfo) => void
}

const FamilyNFinancialInfo = forwardRef<FamilyNFinancialInfoRef, FamilyNFinancialInfoProps>(
  ({ defaultValues, onChange, isView }, ref) => {
    const { t } = useTranslation()

    const {
      register,
      trigger,
      getValues,
      watch,
      reset,
      formState: { errors }
    } = useForm<FamilyFinancialInfo>({
      mode: 'onChange',
      defaultValues
    })

    // Sync form values with parent
    useEffect(() => {
      const subscription = watch((values) => {
        onChange?.(values as FamilyFinancialInfo)
      })
      return () => subscription.unsubscribe()
    }, [watch, onChange])

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      validateStep: async () => {
        const fields = Object.keys(getValues()) as (keyof FamilyFinancialInfo)[]
        const isValid = await trigger(fields)
        if (!isValid) toast.error(t('fillAllFields'), toastOptions)
        return isValid
      },
      getValues: () => getValues() as FamilyFinancialInfo,
      resetForm: (values?: FamilyFinancialInfo) => {
        reset(values ?? defaultValues)
      }
    }))

    const inputClass = (field: keyof typeof errors) =>
      `p-2 border rounded ${errors[field] ? 'border-red-500' : 'border-gray-300'} ${isView ? 'bg-gray-100 cursor-not-allowed' : ''}`

    return (
      <form className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Marital Status */}
        <label className="flex flex-col">
          <span>{t('maritalStatus')}</span>
          <select
            {...register('maritalStatus', { required: t('maritalStatusRequired') })}
            className={inputClass('maritalStatus')}
            disabled={isView}
          >
            <option value="" disabled>{t('select')}</option>
            <option value="single">{t('single')}</option>
            <option value="married">{t('married')}</option>
            <option value="divorced">{t('divorced')}</option>
            <option value="widowed">{t('widowed')}</option>
          </select>
          {errors.maritalStatus && <span className="text-red-500 text-sm">{errors.maritalStatus.message}</span>}
        </label>

        {/* Dependents */}
        <label className="flex flex-col">
          <span>{t('dependents')}</span>
          <input
            type="number"
            {...register('dependents', { required: t('dependentsRequired') })}
            className={inputClass('dependents')}
            disabled={isView}
          />
          {errors.dependents && <span className="text-red-500 text-sm">{errors.dependents.message}</span>}
        </label>

        {/* Employment Status */}
        <label className="flex flex-col">
          <span>{t('employmentStatus')}</span>
          <input
            {...register('employmentStatus', { required: t('employmentStatusRequired') })}
            className={inputClass('employmentStatus')}
            disabled={isView}
          />
          {errors.employmentStatus && <span className="text-red-500 text-sm">{errors.employmentStatus.message}</span>}
        </label>

        {/* Monthly Income */}
        <label className="flex flex-col">
          <span>{t('monthlyIncome')}</span>
          <input
            type="number"
            {...register('monthlyIncome', { required: t('monthlyIncomeRequired') })}
            className={inputClass('monthlyIncome')}
            disabled={isView}
          />
          {errors.monthlyIncome && <span className="text-red-500 text-sm">{errors.monthlyIncome.message}</span>}
        </label>

        {/* Housing Status */}
        <label className="flex flex-col md:col-span-2">
          <span>{t('housingStatus')}</span>
          <input
            {...register('housingStatus', { required: t('housingStatusRequired') })}
            className={inputClass('housingStatus')}
            disabled={isView}
          />
          {errors.housingStatus && <span className="text-red-500 text-sm">{errors.housingStatus.message}</span>}
        </label>
      </form>
    )
  }
)

export default FamilyNFinancialInfo

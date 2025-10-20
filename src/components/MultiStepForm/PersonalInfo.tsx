import { forwardRef, useImperativeHandle, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { PersonalInfo as PersonalInfoType } from '../../models/interfaces/data';
import { formatEmiratesId, isValidEmiratesId } from '../../utils/emiratesId';
import DatePicker, { type DateValueType } from 'react-tailwindcss-datepicker';
import { toastOptions } from '../../utils/toastConfig';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

interface PersonalInfoProps {
  defaultValues?: Partial<PersonalInfoType>;
  onChange?: (data: PersonalInfoType) => void;
  isView?: boolean;
}

export interface PersonalInfoRef {
  validateStep: () => Promise<boolean>;
  getValues: () => PersonalInfoType;
  resetForm: (values?: PersonalInfoType) => void;
}

const PersonalInfo = forwardRef<PersonalInfoRef, PersonalInfoProps>(
  ({ defaultValues, onChange, isView = false }, ref) => {
    const { t } = useTranslation();

    const {
      register,
      trigger,
      getValues,
      reset,
      watch,
      setValue,
      formState: { errors },
    } = useForm<PersonalInfoType>({
      mode: 'onChange',
      defaultValues: defaultValues ?? {},
    });

    // Sync changes to parent component
    useEffect(() => {
      const subscription = watch((values) => {
        onChange?.({
          ...values,
          dob: values.dob ? new Date(values.dob).toISOString().split('T')[0] : '',
        } as PersonalInfoType);
      });
      return () => subscription.unsubscribe();
    }, [watch, onChange]);

    // Imperative methods for parent component
    useImperativeHandle(ref, () => ({
      validateStep: async () => {
        const fields = Object.keys(getValues()) as (keyof PersonalInfoType)[];
        const isValid = await trigger(fields);
        if (!isValid) toast.error(t('fillAllFields'), toastOptions);
        return isValid;
      },
      getValues: () => getValues() as PersonalInfoType,
      resetForm: (values?: PersonalInfoType) => {
        reset(values ?? defaultValues);
      },
    }));

    const inputClass = (field: keyof typeof errors) =>
      clsx(
        'p-2 border rounded',
        {
          'border-red-500': errors[field],
          'border-gray-300': !errors[field],
          'bg-gray-100 cursor-not-allowed': isView,
        },
      );

    const handleNationalIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isView) return;
      const value = e.target.value.replace(/\D/g, '').slice(0, 15);
      const formatted = formatEmiratesId(value);
      setValue('nationalId', formatted);
      trigger('nationalId');
    };

    const handleDobChange = (value: DateValueType) => {
      if (isView) return;
      const dateStr = value?.startDate ? value.startDate.toISOString().split('T')[0] : '';
      setValue('dob', dateStr);
      trigger('dob');
    };

    return (
      <form className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Name */}
        <label className="flex flex-col">
          <span>{t('name')}</span>
          <input
            {...register('name', { required: t('nameRequired') })}
            className={inputClass('name')}
            disabled={isView}
          />
          {errors.name && (
            <span className="text-red-500 text-sm">{errors.name.message}</span>
          )}
        </label>

        {/* National ID */}
        <label className="flex flex-col">
          <span>{t('nationalId')}</span>
          <input
            {...register('nationalId', {
              required: t('nationalIdRequired'),
              validate: (value) =>
                value === '' || isValidEmiratesId(value) || t('invalidEmiratesId'),
            })}
            className={inputClass('nationalId')}
            value={getValues('nationalId')}
            onChange={handleNationalIdChange}
            placeholder={t('nationalIdPlaceholder')}
            disabled={isView}
          />
          {errors.nationalId && (
            <span className="text-red-500 text-sm">{errors.nationalId.message}</span>
          )}
        </label>

        {/* Date of Birth */}
        <label className="flex flex-col">
          <span>{t('dob')}</span>
          <div className="relative w-full">
            <DatePicker
              asSingle
              useRange={false}
              value={{
                startDate: getValues('dob') ? new Date(getValues('dob')) : null,
                endDate: getValues('dob') ? new Date(getValues('dob')) : null,
              }}
              onChange={handleDobChange}
              placeholder={t('dobPlaceholder')}
              displayFormat="YYYY-MM-DD"
              inputClassName={`${inputClass('dob')} w-full pr-10 datepicker`}
              containerClassName="w-full relative"
              disabled={isView}
            />
          </div>
          {errors.dob && (
            <span className="text-red-500 text-sm">{errors.dob.message}</span>
          )}
        </label>

        {/* Gender */}
        <label className="flex flex-col">
          <span>{t('gender')}</span>
          <select
            {...register('gender', { required: t('genderRequired') })}
            className={inputClass('gender')}
            disabled={isView}
          >
            <option value="" disabled>
              {t('select')}
            </option>
            <option value="male">{t('male')}</option>
            <option value="female">{t('female')}</option>
            <option value="other">{t('other')}</option>
          </select>
          {errors.gender && (
            <span className="text-red-500 text-sm">{errors.gender.message}</span>
          )}
        </label>

        {/* Address */}
        <label className="flex flex-col md:col-span-2">
          <span>{t('address')}</span>
          <input
            {...register('address', { required: t('addressRequired') })}
            className={inputClass('address')}
            disabled={isView}
          />
          {errors.address && (
            <span className="text-red-500 text-sm">{errors.address.message}</span>
          )}
        </label>
      </form>
    );
  }
);

export default PersonalInfo;

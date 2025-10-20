import { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import AIAssistModal from './AIAssistModal';
import type { SituationDescriptions } from '../../models/interfaces/data';
import { toastOptions } from '../../utils/toastConfig';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Wand2 } from 'lucide-react';
import clsx from 'clsx';

export interface SituationDescriptionsFormRef {
  validateStep: () => Promise<boolean>;
  getValues: () => SituationDescriptions;
  resetForm: (values?: SituationDescriptions) => void;
}

interface SituationDescriptionsFormProps {
  defaultValues?: Partial<SituationDescriptions>;
  onChange?: (data: SituationDescriptions) => void;
  isView?: boolean;
}

const SituationDescriptionsForm = forwardRef<
  SituationDescriptionsFormRef,
  SituationDescriptionsFormProps
>(({ defaultValues, onChange, isView }, ref) => {
  const { t } = useTranslation();

  const {
    control,
    trigger,
    getValues,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SituationDescriptions>({
    mode: 'onChange',
    defaultValues,
  });

  const [openFor, setOpenFor] = useState<keyof SituationDescriptions | null>(null);

  // Sync values with parent
  useEffect(() => {
    const subscription = watch((values) => onChange?.(values as SituationDescriptions));
    return () => subscription.unsubscribe();
  }, [watch, onChange]);

  // Expose ref methods
  useImperativeHandle(ref, () => ({
    validateStep: async () => {
      const fields = Object.keys(getValues()) as (keyof SituationDescriptions)[];
      const isValid = await trigger(fields);
      if (!isValid) toast.error(t('fillAllFields'), toastOptions);
      return isValid;
    },
    getValues: () => getValues() as SituationDescriptions,
    resetForm: (values?: SituationDescriptions) => {
      reset(values ?? defaultValues);
    },
  }));

  const textareaClass = (field: keyof typeof errors) =>
    clsx(
      'w-full p-2 border rounded h-28',
      {
        'border-red-500': errors[field],
        'border-gray-300': !errors[field],
        'bg-gray-100 cursor-not-allowed': isView,
      }
    );

  const fields: (keyof SituationDescriptions)[] = [
    'financialSituation',
    'employmentCircumstances',
    'reasonForApplying',
  ];

  const getLabel = (field: keyof SituationDescriptions) => {
    switch (field) {
      case 'financialSituation':
        return t('financialSituation');
      case 'employmentCircumstances':
        return t('employmentCircumstances');
      case 'reasonForApplying':
        return t('reasonForApplying');
      default:
        return field;
    }
  };

  return (
    <div>
      <form className="space-y-4">
        {fields.map((field) => (
          <Controller
            key={field}
            name={field}
            control={control}
            rules={{ required: `${getLabel(field)} ${t('required')}` }}
            render={({ field: controllerField }) => (
              <div>
                <label className="block mb-1">{getLabel(field)}</label>
                <textarea
                  {...controllerField}
                  className={textareaClass(field)}
                  disabled={isView}
                  aria-invalid={errors[field] ? 'true' : 'false'}
                  aria-describedby={`${field}-error`}
                />
                <div className="flex items-start justify-between mt-2">
                  {/* Error Message on the Left */}
                  {errors[field] && (
                    <div id={`${field}-error`} className="text-red-500 text-sm">
                      {errors[field]?.message}
                    </div>
                  )}

                  {/* Help Button on the Right */}
                  {!isView && (
                    <button
                      type="button"
                      onClick={() => setOpenFor(field)}
                      className="flex items-center gap-2 px-3 py-1 border rounded text-sm bg-gray-100 hover:bg-gray-200 transition ml-auto whitespace-nowrap"
                      aria-label={t('helpMeWrite') + ` ${getLabel(field)}`}
                    >
                      <Wand2 className="w-4 h-4 text-indigo-500" />
                      {t('helpMeWrite')}
                    </button>
                  )}
                </div>
              </div>
            )}
          />
        ))}
      </form>

      {openFor && (
        <AIAssistModal
          fieldKey={openFor}
          currentValue={getValues(openFor)}
          onClose={() => setOpenFor(null)}
          onAccept={(suggestion: string) => {
            // Only set value if it has changed
            if (getValues(openFor) !== suggestion) {
              setValue(openFor!, suggestion);
            }
            setOpenFor(null);
          }}
        />
      )}
    </div>
  );
});

export default SituationDescriptionsForm;

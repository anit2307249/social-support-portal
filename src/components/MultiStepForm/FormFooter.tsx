import { useDispatch } from 'react-redux'
import { setStep } from '../../store/formSlice'
import Loader from '../layout/Loader'
import { useTranslation } from 'react-i18next'

interface FormFooterProps {
  step: number
  getCurrentStepRef: () => React.RefObject<{ validateStep: () => Promise<boolean> } | null>
  onSubmitAll?: () => Promise<void>   // last step submission
  isLastStep?: boolean
  loading?: boolean                   // loading prop
}

export default function FormFooter({
  step,
  getCurrentStepRef,
  onSubmitAll,
  loading = false,
}: FormFooterProps) {
  const dispatch = useDispatch()
  const { t } = useTranslation()

  const handleBack = () => {
    dispatch(setStep(Math.max(1, step - 1)))
  }

  const handleNext = async () => {
    const currentStepRef = getCurrentStepRef()?.current
    if (currentStepRef) {
      const isValid = await currentStepRef.validateStep()
      if (!isValid) return
    }

    if (step === 3) {
      if (onSubmitAll) await onSubmitAll()
      return
    }

    dispatch(setStep(Math.min(3, step + 1)))
  }

  const isLastStep = step === 3

  const buttonClass = (isDisabled: boolean) => {
    return `px-6 py-2 rounded-md font-medium text-white transition flex items-center justify-center gap-2
      ${isDisabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-[#4f46e5] to-[#473fdf] hover:opacity-90 cursor-pointer'}`;
  }

  return (
    <footer
      className="bg-gray-100 px-6 py-4 w-full mt-auto border-t border-gray-300"
      onMouseDown={(e) => e.preventDefault()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between">
        <button
          type="button"
          onClick={handleBack}
          disabled={step === 1 || loading}
          className={buttonClass(step === 1 || loading)}
        >
          {t('formFooter.back')}
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={loading}
          className={buttonClass(false)}
        >
          {loading && <Loader size={3} color="white" />}
          {loading
            ? isLastStep
              ? t('formFooter.submitting')
              : t('formFooter.pleaseWait')
            : isLastStep
            ? t('formFooter.submit')
            : t('formFooter.next')}
        </button>
      </div>
    </footer>
  )
}

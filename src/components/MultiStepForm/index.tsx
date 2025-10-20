import { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { setApplicationId } from '../../store/formSlice';

import PersonalInfo, { type PersonalInfoRef } from './PersonalInfo';
import FamilyNFinancialInfo, { type FamilyNFinancialInfoRef } from './FamilyNFinancialInfo';
import SituationDescriptions, { type SituationDescriptionsFormRef } from './SituationDescriptions';
import ProgressBar from './ProgressBar';
import Header from './Header';
import FormFooter from './FormFooter';
import { createApplication, updateApplication } from '../../api/jsonServer';
import type {
  PersonalInfo as PersonalInfoType,
  FamilyFinancialInfo,
  SituationDescriptions as SituationDescriptionsType,
} from '../../models/interfaces/data';
import type { SSApplication } from '../../models';
import {
  defaultFamilyFinancialInfo,
  defaultPersonalInfo,
  defaultSituationDescriptions,
} from '../../models';
import toast from 'react-hot-toast';
import { toastOptions } from '../../utils/toastConfig';
import { useTranslation } from 'react-i18next';

interface MultiStepFormProps {
  application: SSApplication | null;
  isView: boolean;
}

export default function MultiStepForm({ application, isView }: MultiStepFormProps) {
  const { t } = useTranslation();
  const step = useSelector((s: RootState) => s.form.step);
  const dispatch = useDispatch();
  const applicationId = useSelector((s: RootState) => s.form.applicationId);

  const step1Ref = useRef<PersonalInfoRef>(null);
  const step2Ref = useRef<FamilyNFinancialInfoRef>(null);
  const step3Ref = useRef<SituationDescriptionsFormRef>(null);

  const [step1Data, setStep1Data] = useState<PersonalInfoType>(application?.personalInfo ?? defaultPersonalInfo);
  const [step2Data, setStep2Data] = useState<FamilyFinancialInfo>(application?.familyFinancialInfo ?? defaultFamilyFinancialInfo);
  const [step3Data, setStep3Data] = useState<SituationDescriptionsType>(application?.situationDescriptions ?? defaultSituationDescriptions);

  const [loading, setLoading] = useState(false);

  // Reset step to 1 when a new application opens
  useEffect(() => {
    dispatch({ type: 'form/setStep', payload: 1 });

    setStep1Data(application?.personalInfo ?? defaultPersonalInfo);
    setStep2Data(application?.familyFinancialInfo ?? defaultFamilyFinancialInfo);
    setStep3Data(application?.situationDescriptions ?? defaultSituationDescriptions);

    // Reset all child form refs
    if (step1Ref.current && !isView) step1Ref.current.resetForm(application?.personalInfo ?? defaultPersonalInfo);
    if (step2Ref.current && !isView) step2Ref.current.resetForm(application?.familyFinancialInfo ?? defaultFamilyFinancialInfo);
    if (step3Ref.current && !isView) step3Ref.current.resetForm(application?.situationDescriptions ?? defaultSituationDescriptions);
  }, [application, dispatch, isView]);

  const getFilledFieldsCount = <T extends object>(data: T, requiredFields: (keyof T)[]): number =>
    requiredFields.filter((f) => data[f] !== '' && data[f] !== null && data[f] !== undefined).length;

  const step1RequiredFields = Object.keys(defaultPersonalInfo) as (keyof PersonalInfoType)[];
  const step2RequiredFields = Object.keys(defaultFamilyFinancialInfo) as (keyof FamilyFinancialInfo)[];
  const step3RequiredFields = Object.keys(defaultSituationDescriptions) as (keyof SituationDescriptionsType)[];
  const totalFieldsCount =
    step1RequiredFields.length + step2RequiredFields.length + step3RequiredFields.length;

  let filledFields = 0;
  if (step >= 1) filledFields += getFilledFieldsCount(step1Data, step1RequiredFields);
  if (step >= 2) filledFields += getFilledFieldsCount(step2Data, step2RequiredFields);
  if (step >= 3) filledFields += getFilledFieldsCount(step3Data, step3RequiredFields);
  const completionPercent = Math.min((filledFields / totalFieldsCount) * 100, 100); // Ensure it doesn't exceed 100%

  const getStepTitle = () => {
    const stepTitles: Record<number, string> = {
      1: t('personalInfo'),
      2: t('familyFinancialInfo'),
      3: t('situationDescriptions'),
    };
    return stepTitles[step] || t('wizardTitle');
  };

  const getCurrentStepRef = () => {
    switch (step) {
      case 1: return step1Ref;
      case 2: return step2Ref;
      case 3: return step3Ref;
      default: return step1Ref;
    }
  };

  const handleFinalSubmit = async () => {
    const step1Valid = (await step1Ref.current?.validateStep()) ?? false;
    const step2Valid = (await step2Ref.current?.validateStep()) ?? false;
    const step3Valid = (await step3Ref.current?.validateStep()) ?? false;

    if (!step1Valid || !step2Valid || !step3Valid) return;

    const step1Values = step1Ref.current?.getValues();
    const step2Values = step2Ref.current?.getValues();
    const step3Values = step3Ref.current?.getValues();

    try {
      setLoading(true);
      if (!applicationId) {
        const created = await createApplication({
          personalInfo: step1Values,
          familyFinancialInfo: step2Values,
          situationDescriptions: step3Values,
          status: 'submitted',
        });
        dispatch(setApplicationId(created.id ?? null));
      } else {
        await updateApplication(applicationId, {
          personalInfo: step1Values,
          familyFinancialInfo: step2Values,
          situationDescriptions: step3Values,
          status: 'submitted',
          submittedOn: new Date().toISOString(),
        });
      }

      toast.success(t('applicationSubmitted'), toastOptions);
      dispatch({ type: 'form/setStep', payload: 1 });
    } catch (err) {
      console.error(err);
      toast.error(t('failedToSubmit'), toastOptions);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      aria-labelledby="wizard-heading"
      className="bg-white rounded shadow overflow-hidden flex flex-col min-h-[80vh] w-full"
    >
      <Header titleKey={getStepTitle()} />

      <div className="flex-grow p-6">
        <ProgressBar step={step} completionPercent={completionPercent} />

        <div className="mt-6 space-y-6">
          <div className={step === 1 ? 'block' : 'hidden'}>
            <PersonalInfo
              ref={step1Ref}
              defaultValues={{ ...step1Data, dob: step1Data?.dob ?? '' }}
              onChange={setStep1Data}
              isView={isView}
            />
          </div>

          <div className={step === 2 ? 'block' : 'hidden'}>
            <FamilyNFinancialInfo
              ref={step2Ref}
              defaultValues={step2Data}
              onChange={setStep2Data}
              isView={isView}
            />
          </div>

          <div className={step === 3 ? 'block' : 'hidden'}>
            <SituationDescriptions
              ref={step3Ref}
              defaultValues={step3Data}
              onChange={setStep3Data}
              isView={isView}
            />
          </div>
        </div>
      </div>

      <FormFooter
        step={step}
        getCurrentStepRef={getCurrentStepRef}
        isLastStep={step === 3}
        onSubmitAll={handleFinalSubmit}
        loading={loading}
      />
    </section>
  );
}

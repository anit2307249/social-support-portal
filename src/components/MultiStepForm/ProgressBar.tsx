import { useTranslation } from 'react-i18next';

interface ProgressBarProps {
  step: number; // 1, 2, 3
  completionPercent: number; // 0 to 100, cumulative
}

export default function ProgressBar({ step, completionPercent }: ProgressBarProps) {
  const { t } = useTranslation();

  const steps = [1, 2, 3];
  const stepLabels = [
    t('personalInfo'),
    t('familyFinancialInfo'),
    t('situationDescriptions'),
  ];

  return (
    <div className="w-full">
      {/* Progress line */}
      <div className="relative w-full h-0.5 bg-gray-200 rounded">
        {/* Filled portion */}
        <div
          className="absolute h-0.5 rounded bg-purple-600 transition-all duration-300"
          style={{ width: `${completionPercent}%` }}
        />

        {/* Step circles */}
        {steps.map((s, idx) => {
          const leftPercent = (idx / (steps.length - 1)) * 100;

          const outerCompleted = step > idx;
          const innerCompleted = completionPercent >= leftPercent;

          return (
            <div
              key={s}
              className="absolute top-1/2 w-4 h-4 flex items-center justify-center rounded-full"
              style={{ left: `${leftPercent}%`, transform: 'translate(-50%, -50%)' }}
            >
              {/* Outer circle */}
              <div
                className={`w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center transition-colors ${
                  outerCompleted ? 'border-purple-600' : 'border-gray-300'
                }`}
              >
                {/* Inner dot */}
                <div
                  className={`w-2 h-2 rounded-full transition-colors ${
                    innerCompleted ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Step labels */}
      <div className="flex justify-between text-xs mt-3 mb-3 px-1">
        {stepLabels.map((label, idx) => (
          <span key={idx}>{label}</span>
        ))}
      </div>
    </div>
  );
}

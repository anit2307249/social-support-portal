import { useState, useEffect, type ChangeEvent } from 'react';
import { generateTextSuggestion } from '../../api/openai';
import { useTranslation } from 'react-i18next';

type FieldKey = 'financialSituation' | 'employmentCircumstances' | 'reasonForApplying';

export default function AIAssistModal({
  fieldKey,
  currentValue = '',
  onClose,
  onAccept,
}: {
  fieldKey: FieldKey;
  currentValue?: string;
  onClose: () => void;
  onAccept: (text: string) => void;
}) {
  const { t } = useTranslation();
  const [suggestion, setSuggestion] = useState(currentValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastGenerated, setLastGenerated] = useState(0);

  useEffect(() => {
    setSuggestion(currentValue);
  }, [currentValue]);

  const fieldPrompts: Record<FieldKey, string> = {
    financialSituation: t('ai.financialSituationPrompt'),
    employmentCircumstances: t('ai.employmentCircumstancesPrompt'),
    reasonForApplying: t('ai.reasonForApplyingPrompt'),
  };

  const handleGenerate = async () => {
    if (Date.now() - lastGenerated < 2000) return;
    setLastGenerated(Date.now());

    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const sys = t('ai.systemPrompt');
      const userInput = suggestion.trim() || '';
      const prompt = `${t('ai.userContext')}: ${fieldPrompts[fieldKey]}.
${t('ai.currentInput')}: "${userInput}"
${t('ai.generateInstruction')}`;

      const text = await generateTextSuggestion(sys, prompt);
      setSuggestion(text);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : t('ai.failedToGenerate'));
    } finally {
      setLoading(false);
    }
  };

  // Focus management when modal opens
  useEffect(() => {
    const modal = document.getElementById('ai-modal');
    if (modal) {
      modal.focus(); // Focus the modal when it opens
    }

    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose(); // Close the modal on "Esc"
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  return (
    <div
      id="ai-modal"
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 flex items-center justify-center bg-black/40 p-4 z-50"
      tabIndex={-1} // Make modal focusable
    >
      <div
        className="bg-white w-full max-w-2xl p-5 rounded-xl shadow-lg relative"
        aria-labelledby="aiModalTitle"
      >
        <h3 id="aiModalTitle" className="text-lg font-bold mb-3">
          {t('ai.modalTitle')}
        </h3>

        {/* Textarea without overlay loader */}
        <textarea
          value={suggestion}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setSuggestion(e.target.value)}
          className="w-full h-44 p-3 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={t('ai.suggestionInput')}
          aria-describedby="aiModalError"
        />

        {/* Error message for screen readers */}
        {error && (
          <p id="aiModalError" className="text-red-600 mt-2" role="alert">
            {error}
          </p>
        )}

        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="w-[90px] px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-100 transition text-center"
            aria-label={t('ai.close')}
          >
            {t('ai.discard')}
          </button>

          <button
            onClick={() => onAccept(suggestion)}
            className="w-[90px] px-3 py-1.5 rounded bg-green-600 text-white hover:bg-green-700 transition text-center"
            aria-label={t('ai.accept')}
          >
            {t('ai.accept')}
          </button>

          {/* Generate Button with Loading Spinner */}
          <button
            onClick={handleGenerate}
            className={`px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-100 transition flex items-center justify-center ${
              loading ? 'w-[120px]' : 'w-[90px]'
            }`}
            disabled={loading}
            aria-label={t('ai.generate')}
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                {t('ai.generating')}
              </>
            ) : (
              t('ai.edit')
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getApplication } from '../api/jsonServer';
import { useDispatch } from 'react-redux';
import { setApplicationId } from '../store/formSlice';
import MultiStepForm from '../components/MultiStepForm';
import type { AppDispatch } from '../store';
import type { SSApplication } from '../models';
import { useTranslation } from 'react-i18next';

interface LocationState {
  readonly?: boolean;
}

export default function AppPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id?: string }>();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<SSApplication | null>(null);
  const [isView, setIsView] = useState(false);

  useEffect(() => {
    const state = location.state as LocationState;
    if (state && typeof state.readonly === 'boolean') {
      setIsView(state.readonly);
    }

    if (id) {
      const appId = Number(id);
      if (isNaN(appId)) {
        navigate('/user', { replace: true });
        return;
      }

      dispatch(setApplicationId(appId));

      getApplication(appId)
        .then((data) => {
          if (!data) {
            navigate('/user', { replace: true });
          } else {
            setApplication(data);
          }
        })
        .catch(() => {
          navigate('/user', { replace: true });
        })
        .finally(() => setLoading(false));
    } else {
      // New application
      dispatch(setApplicationId(null));
      setApplication(null);
      setLoading(false);
    }
  }, [id, dispatch, navigate, location.state]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-200">
      <header className="mb-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-2">
          {id
            ? isView
              ? t('viewApplication')
              : t('editApplication')
            : t('createApplication')}
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          {id
            ? isView
              ? t('viewApplicationDesc')
              : t('editApplicationDesc')
            : t('createApplicationDesc')}
        </p>
      </header>

      <MultiStepForm application={application} isView={isView} />
    </div>
  );
}

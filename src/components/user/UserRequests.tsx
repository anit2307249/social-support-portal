import { useEffect, useState, type ChangeEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserApplications } from '../../store/requestsSlice';
import type { RootState, AppDispatch } from '../../store';
import type { SSApplication } from '../../models';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit } from 'lucide-react';
import Button from '../layout/ui/Button';
import { useTranslation } from 'react-i18next';

export default function UserRequests() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const user = useSelector((state: RootState) => state.auth.user);
  const { applications, loading, error } = useSelector(
    (state: RootState) => state.requests
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    if (!user) {
      navigate('/auth', { replace: true });
      return;
    }
    if (user.email) {
      dispatch(fetchUserApplications(user.email));
    }
  }, [dispatch, user, navigate]);

  const handleAddRequest = () => navigate('/app');
  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const filteredApplications = applications.filter((app) =>
    (app.id?.toString() || '').includes(searchTerm) ||
    (app.status || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (app.personalInfo?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (app.personalInfo?.nationalId || '').includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentApplications = filteredApplications.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  const handleViewEdit = (id: number, isEdit: boolean) => {
    if (!id) return;
    navigate(`/app/${id}`, { state: { readonly: !isEdit } });
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'submitted': return 'text-blue-600 font-semibold';
      case 'draft': return 'text-yellow-500 font-semibold';
      case 'rejected': return 'text-red-600 font-semibold';
      case 'approved': return 'text-green-600 font-semibold';
      default: return '';
    }
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-200 ${
        isRTL ? 'text-right' : 'text-left'
      }`}
    >
      {/* Header */}
      <header className="mb-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-2">
          {t('myRequests')}
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          {t('myRequestsDescription')}
        </p>
      </header>

      {/* Search & New Request */}
      <div
        className={`flex justify-between items-center mb-4 ${
          isRTL ? 'flex-row-reverse' : ''
        }`}
      >
        <input
          type="text"
          placeholder={t('searchPlaceholder')}
          value={searchTerm}
          onChange={handleSearch}
          className={`border border-gray-300 rounded-lg px-4 py-2 w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isRTL ? 'text-right' : 'text-left'
          }`}
        />
        <Button
          onClick={handleAddRequest}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Plus className="h-5 w-5" />
          {t('newRequest')}
        </Button>
      </div>

      {/* Requests Table */}
      {loading && <p>{t('loadingRequests')}</p>}
      {error && <p className="text-red-600">{t('error')}: {error}</p>}
      {!loading && !error && currentApplications.length === 0 && (
        <p>{t('noRequestsFound')}</p>
      )}

      {!loading && !error && currentApplications.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full table-auto bg-white">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3 text-center">{t('id')}</th>
                <th className="p-3 text-left">{t('name')}</th>
                <th className="p-3 text-left">{t('nationalId')}</th>
                <th className="p-3 text-center">{t('dob')}</th>
                <th className="p-3 text-left">{t('employmentStatus')}</th>
                <th className="p-3 text-left">{t('housingStatus')}</th>
                <th className="p-3 text-center">{t('status')}</th>
                <th className="p-3 text-center">{t('submittedOn')}</th>
                <th className="p-3 text-center">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {currentApplications.map((app: SSApplication, index) => {
                const isEditable =
                  app.status === 'draft' || app.status === 'submitted';
                return (
                  <tr
                    key={app.id}
                    className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                  >
                    <td className="p-3 text-center">{app.id}</td>
                    <td className="p-3 text-left">{app.personalInfo?.name || '-'}</td>
                    <td className="p-3 text-left">{app.personalInfo?.nationalId || '-'}</td>
                    <td className="p-3 text-center">{app.personalInfo?.dob || '-'}</td>
                    <td className="p-3 text-left">{app.familyFinancialInfo?.employmentStatus || '-'}</td>
                    <td className="p-3 text-left">{app.familyFinancialInfo?.housingStatus || '-'}</td>
                    <td className={`p-3 text-center capitalize ${getStatusClass(app.status ?? '')}`}>
                    {app.status || '-'}
                  </td>
                    <td className="p-3 text-center">
                    {app.submittedOn
                        ? new Date(app.submittedOn).toISOString().split('T')[0]
                        : '-'}
                    </td>
                    <td className={`p-3 flex justify-center items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <button
                        onClick={() => handleViewEdit(app.id!, false)}
                        className="text-blue-600 flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {isEditable && (
                        <button
                          onClick={() => handleViewEdit(app.id!, true)}
                          className="text-green-600 flex items-center gap-1"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          <div
            className={`flex justify-end gap-2 mt-4 ${
              isRTL ? 'flex-row-reverse' : ''
            }`}
          >
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              {t('prev')}
            </button>
            <span className="px-3 py-1">
              {t('page')} {currentPage} {t('of')} {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              {t('next')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { fetchAllApplications, updateApplicationStatus } from '../../store/requestsSlice';
import Loader from '../layout/Loader';
import toast from 'react-hot-toast';
import { toastOptions } from '../../utils/toastConfig';
import { CheckCircle, XCircle, Eye, Search } from 'lucide-react';
import MultiStepForm from '../MultiStepForm';
import Modal from '../layout/ui/Modal';
import { useTranslation } from 'react-i18next';

export default function AdminDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { applications, loading } = useSelector((state: RootState) => state.requests);
  const { t, i18n } = useTranslation();

  const [viewApp, setViewApp] = useState<null | typeof applications[0]>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 5;
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    dispatch(fetchAllApplications());
  }, [dispatch]);

  const handleStatusChange = async (id: number, status: 'approved' | 'rejected') => {
    try {
      await dispatch(updateApplicationStatus({ id, status }));
      toast.success(
        status === 'approved' ? t('requestApproved') : t('requestRejected'),
        toastOptions
      );
    } catch (err) {
      console.error(err);
      toast.error(t('failedToUpdateStatus'), toastOptions);
    }
  };

  const handleView = (appId: number) => {
    const app = applications.find((a) => a.id === appId);
    if (!app) return;
    setViewApp(app);
  };

  const closeModal = () => setViewApp(null);

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'submitted': return 'text-blue-600 font-semibold';
      case 'draft': return 'text-yellow-500 font-semibold';
      case 'rejected': return 'text-red-600 font-semibold';
      case 'approved': return 'text-green-600 font-semibold';
      default: return '';
    }
  };

  // Filter applications based on search term
  const filteredApplications = useMemo(() => {
    if (!searchTerm.trim()) return applications;
    const term = searchTerm.toLowerCase();
    return applications.filter(app =>
      app.personalInfo?.name?.toLowerCase().includes(term) ||
      app.personalInfo?.nationalId?.toLowerCase().includes(term) ||
      app.status?.toLowerCase().includes(term) ||
      app.familyFinancialInfo?.employmentStatus?.toLowerCase().includes(term) ||
      app.familyFinancialInfo?.housingStatus?.toLowerCase().includes(term)
    );
  }, [applications, searchTerm]);

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentApplications = filteredApplications.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  if (loading) return <div className="flex justify-center mt-20" aria-live="polite"><Loader size={5} /></div>;

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`max-w-6xl mx-auto mt-10 p-6 sm:p-8 bg-white rounded-2xl shadow-lg border border-gray-200 ${isRTL ? 'text-right' : 'text-left'}`}
    >
      {/* Header */}
      <header className="mb-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-2" id="dashboardTitle">{t('adminDashboard')}</h2>
        <p className="text-gray-600 text-sm sm:text-base">{t('allRequestsDescription')}</p>
      </header>

      {/* Search */}
      <div
        className={`mb-4 flex items-center border rounded px-3 py-2 ${isRTL ? 'flex-row-reverse' : ''}`}
        role="search"
        aria-labelledby="searchField"
      >
        <Search size={18} className="text-gray-400 mr-2" />
        <input
          type="text"
          id="searchField"
          aria-label={t('searchPlaceholder')}
          placeholder={t('searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="flex-grow outline-none text-sm"
        />
      </div>

      {/* Table */}
      {filteredApplications.length === 0 ? (
        <p>{t('noApplicationsFound')}</p>
      ) : (
        <div className="!overflow-x-auto" role="table" aria-labelledby="applicationsTable">
          <table className="min-w-[900px] w-full border-collapse border border-gray-300 bg-white" id="applicationsTable">
            <thead>
              <tr className="bg-gray-200" role="row">
                <th className="p-3 border" role="columnheader">{t('id')}</th>
                <th className="p-3 border" role="columnheader">{t('name')}</th>
                <th className="p-3 border" role="columnheader">{t('nationalId')}</th>
                <th className="p-3 border" role="columnheader">{t('dob')}</th>
                <th className="p-3 border" role="columnheader">{t('employmentStatus')}</th>
                <th className="p-3 border" role="columnheader">{t('housingStatus')}</th>
                <th className="p-3 border" role="columnheader">{t('status')}</th>
                <th className="p-3 border" role="columnheader">{t('submittedOn')}</th>
                <th className="p-3 border" role="columnheader">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {currentApplications.map((app, index) => (
                <tr key={app.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} role="row">
                  <td className="p-3 border text-center" role="cell">{app.id}</td>
                  <td className="p-3 border text-center" role="cell">{app.personalInfo?.name || '-'}</td>
                  <td className="p-3 border text-center" role="cell">{app.personalInfo?.nationalId || '-'}</td>
                  <td className="p-3 border text-center" role="cell">{app.personalInfo?.dob || '-'}</td>
                  <td className="p-3 border text-center" role="cell">{app.familyFinancialInfo?.employmentStatus || '-'}</td>
                  <td className="p-3 border text-center" role="cell">{app.familyFinancialInfo?.housingStatus || '-'}</td>
                  <td className={`p-3 border text-center capitalize ${getStatusClass(app.status ?? '')}`} role="cell">
                    {app.status || '-'}
                  </td>
                  <td className="p-3 border text-center" role="cell">{app.submittedOn ? new Date(app.submittedOn).toLocaleDateString() : '-'}</td>
                  <td className={`p-3 border flex justify-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`} role="cell">
                    <button
                      onClick={() => handleStatusChange(app.id!, 'approved')}
                      disabled={app.status === 'approved'}
                      className="p-1"
                      title={t('approve')}
                      aria-label={t('approve')}
                    >
                      <CheckCircle size={20} color={app.status === 'approved' ? 'gray' : 'green'} />
                    </button>
                    <button
                      onClick={() => handleStatusChange(app.id!, 'rejected')}
                      disabled={app.status === 'rejected'}
                      className="p-1"
                      title={t('reject')}
                      aria-label={t('reject')}
                    >
                      <XCircle size={20} color={app.status === 'rejected' ? 'gray' : 'red'} />
                    </button>
                    <button
                      onClick={() => handleView(app.id!)}
                      className="p-1"
                      title={t('view')}
                      aria-label={t('view')}
                    >
                      <Eye size={20} color="blue" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className={`flex justify-end gap-2 mt-4 ${isRTL ? 'flex-row-reverse' : ''}`} role="navigation" aria-label={t('pagination')}>
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
              aria-disabled={currentPage === 1}
            >
              {t('prev')}
            </button>
            <span className="px-3 py-1" aria-live="polite">{t('page')} {currentPage} {t('of')} {totalPages}</span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
              aria-disabled={currentPage === totalPages}
            >
              {t('next')}
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {viewApp && (
        <Modal title={`${t('view')} ${t('id')} #${viewApp.id}`} onClose={closeModal} aria-labelledby="modalTitle">
          <MultiStepForm key={viewApp.id} application={viewApp} isView={true} />
        </Modal>
      )}
    </div>
  );
}

import { Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { logout } from './store/authSlice';
import AdminDashboard from './components/admin/AdminDashboard';
import UserRequests from './components/user/UserRequests';
import SignInSignUp from './components/auth/SignInSignUp';
import AppPage from './pages/AppPage';
import Background from './components/layout/Background';
import logo from './assets/images/xd_logo.png';
import { Toaster } from 'react-hot-toast';
import { toastOptions } from './utils/toastConfig';

export default function App() {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  // Toggle language
  const toggleLanguage = () => {
    const next = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(next);
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
  };

  // Redirect logged-in users from /auth
  useEffect(() => {
    if (!isAuthenticated) return;
    if (location.pathname === '/auth') {
      const target = user?.role === 'admin' ? '/admin' : '/user';
      navigate(target, { replace: true });
    }
  }, [user, isAuthenticated, navigate, location.pathname]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Toaster position="top-right" toastOptions={toastOptions} />
      <Background />

      {/* Navbar - only when logged in */}
      {isAuthenticated && (
        <nav className="w-full bg-gray-900 text-white shadow-md sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img src={logo} alt={t('logoAlt')} className="h-6 w-auto" />
              <h1 className="text-xl sm:text-2xl font-bold">{t('appTitle')}</h1>
            </div>

            <div className="flex gap-3">
              {user?.role === 'user' && (
                <Link
                  to="/user"
                  className="px-3 py-1 rounded border border-white hover:bg-white hover:text-gray-900 transition"
                >
                  {t('home')}
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="px-3 py-1 rounded border border-white hover:bg-white hover:text-gray-900 transition"
                >
                  {t('admin')}
                </Link>
              )}

              <button
                onClick={toggleLanguage}
                aria-label={t('toggleLanguage')}
                className="px-3 py-1 rounded border border-white hover:bg-white hover:text-gray-900 transition"
              >
                {t('language')}
              </button>

              <button
                onClick={() => dispatch(logout())}
                className="px-3 py-1 rounded border border-white hover:bg-white hover:text-gray-900 transition"
              >
                {t('logout')}
              </button>
            </div>
          </div>
        </nav>
      )}

      {/* Routes */}
      <main className="max-w-5xl mx-auto mt-8 px-4 pb-10">
        <Routes>
          {/* Public login/signup */}
          <Route
            path="/auth"
            element={isAuthenticated ? (
              user?.role === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/user" replace />
            ) : (
              <SignInSignUp />
            )}
          />

          {/* Protected user route */}
          <Route
            path="/user"
            element={isAuthenticated && user?.role === 'user' ? <UserRequests /> : <Navigate to="/auth" replace />}
          />

          {/* Protected admin route */}
          <Route
            path="/admin"
            element={isAuthenticated && user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/auth" replace />}
          />

          {/* AppPage for new application */}
          <Route
            path="/app"
            element={isAuthenticated ? <AppPage /> : <Navigate to="/auth" replace />}
          />

          {/* AppPage for view/edit existing application */}
          <Route
            path="/app/:id"
            element={isAuthenticated ? <AppPage /> : <Navigate to="/auth" replace />}
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </main>
    </div>
  );
}

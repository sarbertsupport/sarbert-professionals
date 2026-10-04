import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AppPageShell } from './features/shared/AppPageShell';
import { NavigationProgress } from './features/shared/NavigationProgress';
import { AppRoutes } from './routes/AppRoutes';
import { useAuthStore } from './store/useAuthStore';
import { fetchUserProfile } from './components/services/authProfile';
import logger from './utils/logger';

function App() {
  const [formData, setFormData] = useState({});
  const isInitialized = useAuthStore((state) => state.isInitialized);

  useEffect(() => {
    const token = localStorage.getItem('authToken');

    logger.debug('App: initializing auth state');

    if (token) {
      useAuthStore.getState().setToken(token);

      fetchUserProfile(token)
        .then((profile) => {
          logger.debug('App: User profile fetched successfully');
          useAuthStore.getState().setUser(profile);
          useAuthStore.getState().setInitialized(true);
        })
        .catch((error) => {
          logger.error('Failed to fetch user profile:', error);
          useAuthStore.getState().logout();
        });
    } else {
      logger.debug('App: no session, initialized');
      useAuthStore.getState().setInitialized(true);
    }
  }, []);

  useEffect(() => {
    const token = useAuthStore.getState().token;
    const localStorageToken = localStorage.getItem('authToken');

    logger.debug('App: Auth state check:', {
      storeToken: !!token,
      localStorageToken: !!localStorageToken,
      isInitialized,
    });

    if (!token && localStorageToken) {
      logger.debug('App: Syncing token from localStorage to store');
      useAuthStore.getState().setToken(localStorageToken);
    }

    if (token && !localStorageToken) {
      logger.debug('App: cleared store (no session in storage)');
      useAuthStore.getState().logout();
    }
  }, [isInitialized]);

  if (!isInitialized) {
    return (
      <AppPageShell>
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-sky-200 border-t-sky-700" />
            <p className="mt-4 text-slate-600">Loading…</p>
          </div>
        </div>
      </AppPageShell>
    );
  }

  return (
    <Router>
      <NavigationProgress />
      <AppRoutes formData={formData} setFormData={setFormData} />

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Router>
  );
}

export default App;

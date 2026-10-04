import { useEffect } from 'react';

export function useCustomHeaderAuthEffects({
  checkAuth,
  showBuyModal,
  showChangePasswordModal,
  isLoggedIn,
}) {
  useEffect(() => {
    checkAuth();
    const handleStorageChange = (e) => e.key === 'authToken' && checkAuth();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [showBuyModal, showChangePasswordModal, checkAuth]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      checkAuth();
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [checkAuth]);

  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem('authToken');
      if (!!token !== isLoggedIn) checkAuth();
    }, 1000);
    return () => clearInterval(interval);
  }, [isLoggedIn, checkAuth]);
}

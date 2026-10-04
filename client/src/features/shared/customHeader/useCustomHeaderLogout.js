import { useCallback } from 'react';
import { useAuthStore } from '../../../store/useAuthStore';
import { logoutUser } from '../../../components/services/authLogout';

export function useCustomHeaderLogout({
  navigate,
  clearWallet,
  setProfileOpen,
  setAuthError,
}) {
  const logout = useAuthStore((state) => state.logout);

  const handleUnauthorized = useCallback(() => {
    localStorage.removeItem('authToken');
    logout();
    clearWallet();
    navigate('/login');
    setProfileOpen(false);
    setAuthError('Your session has expired. Please login again.');
  }, [logout, clearWallet, navigate, setProfileOpen, setAuthError]);

  const handleLogout = useCallback(() => {
    useAuthStore.getState().logout();
    logoutUser();
    handleUnauthorized();
  }, [handleUnauthorized]);

  return { handleUnauthorized, handleLogout };
}

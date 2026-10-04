import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUserProfile } from '../components/services/authProfile';
import { getBillingInfo } from '../components/services/coinWallet';
import { getCoinBalance } from '../components/services/digitalCoins';
import { useAuthStore } from '../store/useAuthStore';
import { useWalletStore } from '../store/useWalletStore';

export function useAuthCheck() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const navigate = useNavigate();
  const setUserProfile = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);
  const setAuthError = useAuthStore((state) => state.setAuthError);
  const logout = useAuthStore((state) => state.logout);
  const setCoinBalance = useWalletStore((state) => state.setCoinBalance);
  const setBillingInfo = useWalletStore((state) => state.setBillingInfo);
  const clearWallet = useWalletStore((state) => state.clearWallet);

  const handleUnauthorized = useCallback(() => {
    localStorage.removeItem('authToken');
    logout();
    clearWallet();
    navigate('/login');
    setAuthError('Your session has expired. Please login again.');
  }, [logout, clearWallet, navigate, setAuthError]);

  const checkAuth = useCallback(async () => {
    setIsCheckingAuth(true);
    try {
      const token = useAuthStore.getState().token || localStorage.getItem('authToken');
      if (!token) {
        logout();
        setIsCheckingAuth(false);
        return;
      }
      // Verify token by fetching user profile
      const profile = await fetchUserProfile(token);
      setUserProfile(profile);
      setToken(token);
      // Fetch coin balance
      try {
        const balanceData = await getCoinBalance(profile.userId, token);
        setCoinBalance(balanceData.coinBalance || 0);
      } catch (balanceErr) {
        if (balanceErr.response?.status === 401) {
          handleUnauthorized();
          return;
        }
        setCoinBalance(0);
      }
      // Fetch billing info
      try {
        const billingData = await getBillingInfo(profile.userId, token);
        if (billingData?.headers?.responseCode === 404) {
          setBillingInfo(null);
        } else {
          setBillingInfo(billingData);
        }
      } catch (billingErr) {
        if (billingErr.response?.status === 401) {
          handleUnauthorized();
          return;
        }
        setBillingInfo(null);
      }
      setAuthError(null);
    } catch (err) {
      if (err.response?.status === 401) {
        handleUnauthorized();
        return;
      }
      setAuthError(err.message || 'Failed to verify your session.');
      logout();
    }
    setIsCheckingAuth(false);
  }, [logout, setUserProfile, setToken, setAuthError, setCoinBalance, setBillingInfo, clearWallet, handleUnauthorized]);

  return { isCheckingAuth, checkAuth };
} 
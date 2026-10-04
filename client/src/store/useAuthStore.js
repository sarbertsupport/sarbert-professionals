import { create } from 'zustand';
import logger from '../utils/logger';

// Get initial token from localStorage
const getInitialToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

// Check if token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    logger.error('Error parsing token:', error);
    return true;
  }
};

// Get token expiry time
const getTokenExpiryTime = (token) => {
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000; // Convert to milliseconds
  } catch (error) {
    logger.error('Error parsing token expiry:', error);
    return null;
  }
};

export const useAuthStore = create((set, get) => ({
  user: null,
  token: getInitialToken(),
  authError: null,
  isInitialized: false,
  sessionExpiryWarning: false,
  sessionExpiryTime: null,
  
  setUser: (user) => set({ user }),
  setToken: (token) => {
    const expiryTime = getTokenExpiryTime(token);
    set({ 
      token, 
      sessionExpiryTime: expiryTime,
      sessionExpiryWarning: expiryTime ? (expiryTime - Date.now()) < (5 * 60 * 1000) : false // Warn 5 minutes before expiry
    });
  },
  setAuthError: (authError) => set({ authError }),
  setInitialized: (isInitialized) => set({ isInitialized }),
  setSessionExpiryWarning: (sessionExpiryWarning) => set({ sessionExpiryWarning }),
  
  login: (user, token) => {
    const expiryTime = getTokenExpiryTime(token);
    set({ 
      user, 
      token, 
      authError: null, 
      isInitialized: true,
      sessionExpiryTime: expiryTime,
      sessionExpiryWarning: expiryTime ? (expiryTime - Date.now()) < (5 * 60 * 1000) : false
    });
  },
  
  logout: () => {
    logger.debug('useAuthStore.logout: Clearing auth state');
    localStorage.removeItem('authToken');
    set({ 
      user: null, 
      token: null, 
      authError: null, 
      isInitialized: true,
      sessionExpiryWarning: false,
      sessionExpiryTime: null
    });
    logger.debug('useAuthStore.logout: Auth state cleared');
  },
  
  // Check if current token is valid
  isTokenValid: () => {
    const { token } = get();
    return token && !isTokenExpired(token);
  },
  
  // Force logout due to token expiration
  forceLogout: () => {
    localStorage.removeItem('authToken');
    set({ 
      user: null, 
      token: null, 
      authError: 'Your session has expired. Please login again.',
      isInitialized: true,
      sessionExpiryWarning: false,
      sessionExpiryTime: null
    });
  },
  
  // Check session status and update warnings
  checkSessionStatus: () => {
    const { token, sessionExpiryTime } = get();
    
    // If no token, don't show any errors (user is not authenticated)
    if (!token) {
      return false;
    }
    
    if (isTokenExpired(token)) {
      get().forceLogout();
      return false;
    }
    
    if (sessionExpiryTime) {
      const timeUntilExpiry = sessionExpiryTime - Date.now();
      const shouldWarn = timeUntilExpiry < (5 * 60 * 1000); // 5 minutes
      set({ sessionExpiryWarning: shouldWarn });
    }
    
    return true;
  }
})); 
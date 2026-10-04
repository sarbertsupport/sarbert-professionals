import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { FaExclamationTriangle, FaClock, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const SessionExpiryWarning = () => {
  const [timeLeft, setTimeLeft] = useState(null);
  const sessionExpiryWarning = useAuthStore((state) => state.sessionExpiryWarning);
  const sessionExpiryTime = useAuthStore((state) => state.sessionExpiryTime);
  const setSessionExpiryWarning = useAuthStore((state) => state.setSessionExpiryWarning);
  const forceLogout = useAuthStore((state) => state.forceLogout);
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();

  // Only show warning for authenticated users
  const isAuthenticated = !!token;

  useEffect(() => {
    // Don't run session expiry logic for non-authenticated users
    if (!isAuthenticated || !sessionExpiryTime) return;

    const updateTimeLeft = () => {
      const now = Date.now();
      const timeUntilExpiry = sessionExpiryTime - now;
      
      if (timeUntilExpiry <= 0) {
        forceLogout();
        navigate('/login');
        return;
      }

      const minutes = Math.floor(timeUntilExpiry / (1000 * 60));
      const seconds = Math.floor((timeUntilExpiry % (1000 * 60)) / 1000);
      setTimeLeft({ minutes, seconds });

      // Update warning status
      if (timeUntilExpiry < (5 * 60 * 1000)) { // 5 minutes
        setSessionExpiryWarning(true);
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, sessionExpiryTime, forceLogout, navigate, setSessionExpiryWarning]);

  const handleExtendSession = () => {
    // This would typically make an API call to refresh the token
    // For now, we'll just hide the warning
    setSessionExpiryWarning(false);
  };

  const handleLogout = () => {
    forceLogout();
    navigate('/login');
  };

  // Don't show warning for non-authenticated users
  if (!isAuthenticated || !sessionExpiryWarning || !timeLeft) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FaExclamationTriangle className="text-xl animate-pulse" />
            <div>
              <p className="font-semibold">
                Session Expiring Soon
              </p>
              <p className="text-sm opacity-90">
                Your session will expire in {timeLeft.minutes}:{timeLeft.seconds.toString().padStart(2, '0')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExtendSession}
              className="px-4 py-2 bg-white text-orange-600 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center space-x-2"
            >
              <FaClock className="text-sm" />
              <span>Extend Session</span>
            </button>
            
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <FaSignOutAlt className="text-sm" />
              <span>Logout Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiryWarning; 
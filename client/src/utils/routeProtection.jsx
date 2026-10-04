import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import logger from './logger';

const RouteGuard = ({ children, allowedRoles = [], deniedRoles = [], redirectPath = '/login' }) => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const isAuthenticated = !!token;
  const userRole = user?.roleName;

  // Debug logging (remove in production)
  logger.debug('RouteGuard Debug:', {
    token: !!token,
    user: !!user,
    isInitialized,
    isAuthenticated,
    userRole,
    allowedRoles,
    deniedRoles,
    pathname: window.location.pathname
  });

  // Show loading while auth state is being initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    logger.debug('RouteGuard: User not authenticated, redirecting to login');
    logger.debug('RouteGuard: Current pathname:', window.location.pathname);
    return <Navigate to="/login" replace />;
  }

  if (deniedRoles.length > 0 && deniedRoles.includes(userRole)) {
    return <Navigate to={redirectPath} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default RouteGuard; 
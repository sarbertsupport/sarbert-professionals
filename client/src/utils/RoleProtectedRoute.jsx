import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

const RoleProtectedRoute = ({ children, allowedRoles, deniedRoles }) => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = !!token;
  const userRole = user?.roleName;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (deniedRoles && deniedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleProtectedRoute;
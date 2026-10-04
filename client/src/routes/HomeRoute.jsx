import { Navigate } from 'react-router-dom';
import Home from '../components/pages/Home';
import { ROLES } from '../constants/roles';
import { ROUTES } from '../constants/routes';
import { getUserRole } from '../utils/jwtRole';

export function HomeRoute() {
  const userRole = getUserRole();
  if (userRole === ROLES.ADMIN) {
    return <Navigate to={ROUTES.ADMIN} replace />;
  }
  return <Home />;
}

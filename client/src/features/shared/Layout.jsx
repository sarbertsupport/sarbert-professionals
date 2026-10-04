import React, { useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import CustomHeader from './CustomHeader';
import Menu from '../student/Menus';
import SessionExpiryWarning from './SessionExpiryWarning';
import { AppPageShell } from './AppPageShell';

const Layout = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isTokenValid = useAuthStore((state) => state.isTokenValid);
  const checkSessionStatus = useAuthStore((state) => state.checkSessionStatus);
  const forceLogout = useAuthStore((state) => state.forceLogout);
  const role = user?.roleName;
  const isAuthenticated = !!token;

  // Monitor session status only for authenticated users
  useEffect(() => {
    // Only run session checks if user is authenticated
    if (!isAuthenticated) return;

    // Check session status immediately
    checkSessionStatus();

    // Set up periodic session checks
    const sessionCheckInterval = setInterval(() => {
      checkSessionStatus();
    }, 30000); // Check every 30 seconds

    // Set up token validation
    const tokenValidationInterval = setInterval(() => {
      if (!isTokenValid()) {
        forceLogout();
      }
    }, 60000); // Check every minute

    return () => {
      clearInterval(sessionCheckInterval);
      clearInterval(tokenValidationInterval);
    };
  }, [isAuthenticated, checkSessionStatus, isTokenValid, forceLogout]);

  return (
    <>
      <SessionExpiryWarning />
      <AppPageShell>
        {/* Show CustomHeader for all users EXCEPT ROLE_STUDENT */}
        {role !== 'ROLE_STUDENT' && <CustomHeader />}
        {/* Show Menu only for authenticated students */}
        {role === 'ROLE_STUDENT' && <Menu />}
        {children}
      </AppPageShell>
    </>
  );
};

// Layout without CustomHeader for pages that have their own complete layouts
export const LayoutWithoutHeader = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isTokenValid = useAuthStore((state) => state.isTokenValid);
  const checkSessionStatus = useAuthStore((state) => state.checkSessionStatus);
  const forceLogout = useAuthStore((state) => state.forceLogout);
  const role = user?.roleName;
  const isAuthenticated = !!token;

  // Monitor session status only for authenticated users
  useEffect(() => {
    // Only run session checks if user is authenticated
    if (!isAuthenticated) return;

    // Check session status immediately
    checkSessionStatus();

    // Set up periodic session checks
    const sessionCheckInterval = setInterval(() => {
      checkSessionStatus();
    }, 30000); // Check every 30 seconds

    // Set up token validation
    const tokenValidationInterval = setInterval(() => {
      if (!isTokenValid()) {
        forceLogout();
      }
    }, 60000); // Check every minute

    return () => {
      clearInterval(sessionCheckInterval);
      clearInterval(tokenValidationInterval);
    };
  }, [isAuthenticated, checkSessionStatus, isTokenValid, forceLogout]);

  return (
    <>
      <SessionExpiryWarning />
      <AppPageShell>
        {/* Show Menu only for authenticated students */}
        {role === 'ROLE_STUDENT' && <Menu />}
        {children}
      </AppPageShell>
    </>
  );
};

// Layout with no headers at all - for pages that have their own complete layouts
export const LayoutNoHeaders = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isTokenValid = useAuthStore((state) => state.isTokenValid);
  const checkSessionStatus = useAuthStore((state) => state.checkSessionStatus);
  const forceLogout = useAuthStore((state) => state.forceLogout);
  const isAuthenticated = !!token;

  // Monitor session status only for authenticated users
  useEffect(() => {
    // Only run session checks if user is authenticated
    if (!isAuthenticated) return;

    // Check session status immediately
    checkSessionStatus();

    // Set up periodic session checks
    const sessionCheckInterval = setInterval(() => {
      checkSessionStatus();
    }, 30000); // Check every 30 seconds

    // Set up token validation
    const tokenValidationInterval = setInterval(() => {
      if (!isTokenValid()) {
        forceLogout();
      }
    }, 60000); // Check every minute

    return () => {
      clearInterval(sessionCheckInterval);
      clearInterval(tokenValidationInterval);
    };
  }, [isAuthenticated, checkSessionStatus, isTokenValid, forceLogout]);

  return (
    <>
      <SessionExpiryWarning />
      <AppPageShell>{children}</AppPageShell>
    </>
  );
};

export default Layout;
import axios from "axios";
import { logoutUser } from "./authLogout";
import { useAuthStore } from '../../store/useAuthStore';

/**
 * Lets a mounted component register a React setState callback for auth errors without importing this module from JSX trees.
 * The pattern stays the same; this module only documents why the indirection exists.
 */
let setAuthErrorGlobal = null;
export const setAuthErrorSetter = (setter) => {
  setAuthErrorGlobal = setter;
};

const createApiInstance = (baseURL) => {
  const instance = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor
  instance.interceptors.request.use(
    (config) => {
      // Use Zustand token if available
      try {
        // This will only work in a React component context
        const token = useAuthStore.getState().token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        // Fallback to localStorage for non-React contexts
        const token = localStorage.getItem("authToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        if (error.response.status === 401) {
          // Set global auth error message if possible
          if (setAuthErrorGlobal) {
            setAuthErrorGlobal("Your session has expired and you will be logged out.");
          }
          
          // Use Zustand store to handle logout
          try {
            const forceLogout = useAuthStore.getState().forceLogout;
            forceLogout();
          } catch (e) {
            // Fallback to direct logout
            logoutUser();
          }
          
          // Redirect to login
          setTimeout(() => {
            window.location.href = "/login";
          }, 1000);
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export default createApiInstance;
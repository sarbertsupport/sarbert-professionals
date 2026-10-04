import logger from '../../utils/logger';
// changePassword.js
const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL || "http://localhost:8089";
const API_BASE_URL = `${BACKEND_BASE_URL}/api/v1/users`;

/**
 * Changes user password by calling the API
 * @param {string} token - JWT token from authentication
 * @param {string} oldPassword - Current password
 * @param {string} newPassword - New password
 * @param {string} confirmPassword - New password confirmation
 * @returns {Promise<Object>} API response
 */
 export const changePassword = async (token, oldPassword, newPassword, confirmPassword) => {
    try {
      const response = await fetch(`${API_BASE_URL}/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
          confirmPassword
        })
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        // Check for backend error structure
        const errorMessage = data.headers?.customerMessage || 
                           data.message || 
                           'Password change failed';
        throw new Error(errorMessage);
      }
  
      return data;
    } catch (error) {
      logger.error('Error changing password:', error);
      throw error;
    }
  };

/**
 * Validates password meets requirements
 * @param {string} password 
 * @returns {string|null} Error message or null if valid
 */
export const validatePassword = (password) => {
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return 'Password must contain at least one special character';
  }
  return null;
};


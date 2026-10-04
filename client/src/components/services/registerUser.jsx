import logger from '../../utils/logger';
// src/services/userService.js
const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL || "http://localhost:8089";
const API_BASE_URL = `${BACKEND_BASE_URL}/api/v1/users`;

export const registerUser = async (userData) => {
  logger.debug('backend',process.env.BACKEND_BASE_URL)
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    const data = await response.json();
    return data;
  } catch (error) {
    logger.error('Registration error:', error);
    throw error;
  }
};
export const getLatestTermsAndConditions = async () => {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/api/v1/terms/latest`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    logger.error('Error fetching terms and conditions:', error);
    throw error;
  }
};
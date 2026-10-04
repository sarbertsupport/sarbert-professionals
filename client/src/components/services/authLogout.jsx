import logger from '../../utils/logger';
export const logoutUser = () => {
    try {
      // Remove all auth-related items from localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userProfile');
      localStorage.removeItem('coinBalance');
      
      // Clear any other session-related data
      // sessionStorage.clear(); // Uncomment if using sessionStorage
      
      // Debug logging
      logger.debug('logoutUser: Cleared localStorage items');
      logger.debug('localStorage after logout:', {
        authToken: localStorage.getItem('authToken'),
        userProfile: localStorage.getItem('userProfile'),
        coinBalance: localStorage.getItem('coinBalance')
      });
      
      // Return success object matching your API response format
      return {
        success: true,
        message: 'Logged out successfully',
        body: {
          data: {
            status: 'success'
          }
        }
      };
    } catch (error) {
      logger.error("Logout failed:", error);
      // Return error object matching your API error format
      return {
        success: false,
        message: 'Logout failed',
        error: {
          message: error.message,
          code: 'LOGOUT_ERROR'
        }
      };
    }
  };
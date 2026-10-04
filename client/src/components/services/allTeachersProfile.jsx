import createApiInstance from "./apiInterceptor";
import logger from '../../utils/logger';
const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL || "http://localhost:8089";
/** Same pattern as dashboard/transactions: one authenticated client on /api/v1. */
const v1Api = createApiInstance(`${BACKEND_BASE_URL}/api/v1`);
export const fetchAllTeachers = async (filters = {}) => {
  try {
    const {
      page = 1,
      size = 10,
      gender = '',
      minFee = '',
      maxFee = '',
      onlineAvailability = '',
      homeAvailability = ''
    } = filters;

    const params = {
      page,
      size,
      ...(gender && { gender }),
      ...(minFee !== '' && minFee != null && { minFee }),
      ...(maxFee !== '' && maxFee != null && { maxFee }),
      ...(onlineAvailability !== '' && onlineAvailability != null && { onlineAvailability }),
      ...(homeAvailability !== '' && homeAvailability != null && { homeAvailability })
    };

    const response = await v1Api.get('/teachers/all', { params });
    return response.data;
  } catch (error) {
    logger.error('Error fetching teachers:', error);
    throw error;
  }
};

export const fetchAllTeachersWithoutFilters = async () => {
  try {
    const response = await v1Api.get('/teachers/all', { params: { page: 1, size: 10 } });
    return response.data;
  } catch (error) {
    logger.error('Error fetching all teachers:', error);
    throw error;
  }
};
export const profileByTeacherId = async (teacherId) => {
  try {
    const response = await v1Api.get(`/teachers/profiles/${teacherId}`);
    return response.data;
  } catch (error) {
    logger.error('Error fetching teacher profile:', error);
    throw error;
  }
};
  export const allTeachersPaginated = async (page = 1, size = 5, displayName = '') => {
    try {
      const response = await v1Api.get(`/teachers/profiles/all`, {
        params: {
          page,
          size,
          displayName
        }
      });
  
      // The response structure matches what you provided
      if (response.data && response.data.body && response.data.body.data) {
        return {
          success: true,
          data: response.data.body.data,
          headers: response.data.headers
        };
      }
      
      throw new Error('Unexpected response structure');
    } catch (error) {
      logger.error('Error fetching paginated teachers:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
};
  
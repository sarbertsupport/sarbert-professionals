import createApiInstance from './apiInterceptor';
import logger from '../../utils/logger';
const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL || "http://localhost:8089";
const API_BASE_URL = `${BACKEND_BASE_URL}/api/v1`;
const userApis = createApiInstance(`${API_BASE_URL}/users`);
const roleApis = createApiInstance(`${API_BASE_URL}/roles`);

// User-related APIs
export const fetchAllUsers = async () => {
  try {
    const response = await userApis.get(`/all`);
    return response.data;
  } catch (error) {
    logger.error('Error fetching all users:', error);
    throw error;
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await userApis.get(`/${userId}`);
    return response.data;
  } catch (error) {
    logger.error(`Error fetching user with ID ${userId}:`, error);
    throw error;
  }
};

export const fetchFilteredUsers = async (filters = {}) => {
  try {
    const params = {
      page: 1,
      size: 10,
      ...filters
    };
    const response = await userApis.get(`/filter`, { params });
    return response.data;
  } catch (error) {
    logger.error('Error fetching filtered users:', error);
    throw error;
  }
};

export const allUsersPaginated = async (page = 1, size = 10, filters = {}) => {
  try {
    const params = {
      page,
      size,
      ...filters
    };
    const response = await userApis.get(`/filter`, { params });
    
    if (response.data && response.data.body && response.data.body.data) {
      return {
        success: true,
        data: response.data.body.data.users,
        pagination: {
          totalPages: response.data.body.data.totalPages,
          totalCount: response.data.body.data.totalCount,
          currentPage: response.data.body.data.currentPage
        },
        headers: response.data.headers
      };
    }
    throw new Error('Invalid response structure');
  } catch (error) {
    logger.error('Error fetching paginated users:', error);
    throw error;
  }
};

// New user management functions
export const createUser = async (userData) => {
  try {
    const response = await userApis.post('/register', userData);
    return response.data;
  } catch (error) {
    logger.error('Error creating user:', error);
    throw error;
  }
};

export const enableUser = async (userId) => {
  try {
    const response = await userApis.put(`/enable/${userId}`);
    return response.data;
  } catch (error) {
    logger.error(`Error enabling user with ID ${userId}:`, error);
    throw error;
  }
};

export const disableUser = async (userId) => {
  try {
    const response = await userApis.put(`/disable/${userId}`);
    return response.data;
  } catch (error) {
    logger.error(`Error disabling user with ID ${userId}:`, error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await userApis.delete(`/delete/${userId}`);
    return response.data;
  } catch (error) {
    logger.error(`Error deleting user with ID ${userId}:`, error);
    throw error;
  }
};

export const assignRoleToUser = async (assignmentData) => {
  try {
    const response = await userApis.post('/assign/role', assignmentData);
    return response.data;
  } catch (error) {
    logger.error('Error assigning role to user:', error);
    throw error;
  }
};

// Role management functions
export const createRole = async (roleData) => {
  try {
    const response = await roleApis.post('', roleData);
    return response.data;
  } catch (error) {
    logger.error('Error creating role:', error);
    throw error;
  }
};

export const deleteRole = async (roleId) => {
  try {
    const response = await roleApis.delete(`/${roleId}`);
    return response.data;
  } catch (error) {
    logger.error(`Error deleting role with ID ${roleId}:`, error);
    throw error;
  }
};

export const fetchAllRoles = async () => {
  try {
    const response = await roleApis.get('');
    logger.debug(response.data);
    return response.data;
  } catch (error) {
    logger.error('Error fetching all roles:', error);
    throw error;
  }
};

export const getRoleById = async (roleId) => {
  try {
    const response = await roleApis.get(`/${roleId}`);
    return response.data;
  } catch (error) {
    logger.error(`Error fetching role with ID ${roleId}:`, error);
    throw error;
  }
};
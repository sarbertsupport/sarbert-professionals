import createApiInstance from "./apiInterceptor";
import logger from '../../utils/logger';
const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL || "http://localhost:8089";
const BASE_URL = `${BACKEND_BASE_URL}/api/v1/student-profiles`;
const teacherApis = createApiInstance(BASE_URL);

export const saveStudentProfile = async (profileData) => {
  const token = localStorage.getItem("authToken");
  try {
    const response = await fetch(`${BASE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData),
    });
    const data = await response.json();
    logger.debug("data", data);
    if (response.ok && data.headers.responseCode === 200) {
      return { success: true, data: data.body.data };
    } else {
      return { success: false, error: data.headers.customerMessage || 'Failed to save student profile' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getStudentProfileByUserId = async (userId) => {
  const token = localStorage.getItem("authToken");
  try {
    const response = await fetch(`${BASE_URL}/user/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    logger.debug("data", data);
    if (response.ok && data.headers.responseCode === 200) {
      return { success: true, data: data.body.data };
    } else {
      return { success: false, error: data.headers.customerMessage || 'Failed to get student profile' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateStudentProfile = async (studentId, profileData) => {
  const token = localStorage.getItem("authToken");
  try {
    const response = await fetch(`${BASE_URL}/${studentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData),
    });
    const data = await response.json();
    logger.debug("data", data);
    if (response.ok && data.headers.responseCode === 200) {
      return { success: true, data: data.body.data };
    } else {
      return { success: false, error: data.headers.customerMessage || 'Failed to update student profile' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const uploadStudentProfileImage = async (file) => {
  const token = localStorage.getItem("authToken");
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${BASE_URL}/upload-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    const data = await response.json();
    logger.debug("data", data);
    if (response.ok && data.headers.responseCode === 200) {
      return { success: true, data: data.body.data };
    } else {
      return { success: false, error: data.headers.customerMessage || 'Failed to upload profile image' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};
/** Admin detail: profile + email/username (requires auth). */
export const getStudentProfileById = async (studentId) => {
  try {
    const response = await teacherApis.get(`${studentId}`);
    const data = response.data;
    if (data.headers?.responseCode === 200) {
      return { success: true, body: data.body };
    }
    return {
      success: false,
      error: data.headers?.customerMessage || 'Failed to load client profile',
    };
  } catch (error) {
    const apiData = error.response?.data;
    const msg =
      apiData?.headers?.customerMessage ||
      apiData?.body?.message ||
      error.message ||
      'Failed to load client profile';
    logger.error('Error fetching student profile by id:', error);
    return { success: false, error: msg };
  }
};

export const getAllStudentProfiles = async (page = 1, pageSize = 5, searchTerm = null, genderFilter = null) => {
  try {
    const params = { page, size: pageSize };
    if (searchTerm) params.fullName = searchTerm;
    if (genderFilter) params.gender = genderFilter;

    const response = await teacherApis.get('', { params });
    const data = response.data;

    if (data.headers?.responseCode === 200) {
      return { success: true, body: data.body };
    }
    return {
      success: false,
      error: data.headers?.customerMessage || 'Failed to get student profiles',
    };
  } catch (error) {
    const apiData = error.response?.data;
    const msg =
      apiData?.headers?.customerMessage ||
      apiData?.body?.message ||
      error.message ||
      'Failed to get student profiles';
    logger.error('Error fetching student profiles:', error);
    return { success: false, error: msg };
  }
};
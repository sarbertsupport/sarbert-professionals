import { getTeacherDetailsByUserId } from "./displayTeacherId";
import logger from '../../utils/logger';
const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL || "http://localhost:8089";
export const fetchTeacherEducation = async (userId, token) => {
  logger.debug('fetchTeacherEducation - userId:', userId);
  logger.debug('fetchTeacherEducation - token:', token ? 'present' : 'missing');
  
  const response = await fetch(`${BACKEND_BASE_URL}/api/v1/teachers/education/users/${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  logger.debug('fetchTeacherEducation - response status:', response.status);
  logger.debug('fetchTeacherEducation - response ok:', response.ok);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    logger.debug('fetchTeacherEducation - error data:', errorData);
    throw new Error('Failed to fetch education data');
  }
  
  const data = await response.json();
  logger.debug('fetchTeacherEducation - success data:', data);
  return data.body.data;
};

export const updateTeacherEducation = async (educationId, userId, educationData, token) => {
  // Only send the fields the backend expects
  const requestBody = {
    institutionName: educationData.institutionName?.trim() || '',
    degreeType: educationData.degreeType || 'Bachelor',
    degreeName: educationData.degreeName?.trim() || '',
    startDate: educationData.startDate || null,
    endDate: educationData.endDate || null,
    association: educationData.association || 'Full-time',
    specialization: educationData.specialization?.trim() || '',
    score: Number(educationData.score) || 0
  };

  // Validate required fields
  if (!requestBody.institutionName) {
    throw new Error('Institution name is required');
  }
  if (!requestBody.degreeName) {
    throw new Error('Degree name is required');
  }
  if (!requestBody.startDate) {
    throw new Error('Start date is required');
  }

  const endpoint = `${BACKEND_BASE_URL}/api/v1/teachers/education/${educationId}?userId=${userId}`;
  logger.debug('updateTeacherEducation - endpoint:', endpoint);
  logger.debug('updateTeacherEducation - requestBody:', requestBody);

  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  logger.debug('updateTeacherEducation - response status:', response.status);
  logger.debug('updateTeacherEducation - response ok:', response.ok);

  if (!response.ok) {
    let errorMessage = 'Failed to update education data';
    try {
      const errorData = await response.json();
      logger.debug('updateTeacherEducation - error data:', errorData);
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (parseError) {
      logger.debug('updateTeacherEducation - could not parse error response');
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  logger.debug('updateTeacherEducation - success data:', data);
  return data.body.data;
};

export const createTeacherEducation = async (userId, educationData, token) => {
  // First get teacherId from user profile
  const teacherDetails = await getTeacherDetailsByUserId(userId);
  
  if (!teacherDetails.success) {
    throw new Error(teacherDetails.error || 'Failed to get teacher details');
  }

  const teacherId = teacherDetails.teacher.teacherId;

  const response = await fetch(`${BACKEND_BASE_URL}/api/v1/teachers/education`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userId: userId,
      teacherId: teacherId,
      institutionName: educationData.institutionName,
      degreeType: educationData.degreeType,
      degreeName: educationData.degreeName,
      startDate: educationData.startDate,
      endDate: educationData.endDate,
      association: educationData.association,
      specialization: educationData.specialization,
      score: Number(educationData.score) || 0
    })
  });

  if (!response.ok) {
    throw new Error('Failed to create education record');
  }

  const data = await response.json();
  return data.body.data;
};

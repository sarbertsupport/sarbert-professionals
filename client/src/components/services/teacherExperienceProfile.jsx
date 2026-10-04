// Add this to your services/teacherProfile.js file (or create it if it doesn't exist)
import { getTeacherDetailsByUserId } from "./displayTeacherId";
import logger from '../../utils/logger';
const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL || "http://localhost:8089";
export const fetchTeacherExperience = async (userId, token) => {
    const response = await fetch(`${BACKEND_BASE_URL}/api/v1/experiences/teacher/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch experience data');
    }
    
    const data = await response.json();
    return data.body.data; // Return the array of experience items
  };
  export const updateTeacherExperience = async (experienceId, userId, experienceData, token) => {
    // Only send the fields the backend expects
    const requestBody = {
      organizationName: experienceData.organizationName?.trim() || '',
      designation: experienceData.designation?.trim() || '',
      startDate: experienceData.startDate || null,
      endDate: experienceData.currentJob ? null : (experienceData.endDate || null),
      association: experienceData.association || 'Full-time',
      jobDescription: experienceData.jobDescription?.trim() || '',
      currentJob: !!experienceData.currentJob
    };

    // Validate required fields
    if (!requestBody.organizationName) {
      throw new Error('Organization name is required');
    }
    if (!requestBody.designation) {
      throw new Error('Designation is required');
    }
    if (!requestBody.startDate) {
      throw new Error('Start date is required');
    }

    const endpoint = `${BACKEND_BASE_URL}/api/v1/experiences/${experienceId}?userId=${userId}`;
    logger.debug('updateTeacherExperience - endpoint:', endpoint);
    logger.debug('updateTeacherExperience - requestBody:', requestBody);

    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    logger.debug('updateTeacherExperience - response status:', response.status);
    logger.debug('updateTeacherExperience - response ok:', response.ok);

    if (!response.ok) {
      let errorMessage = 'Failed to update experience data';
      try {
        const errorData = await response.json();
        logger.debug('updateTeacherExperience - error data:', errorData);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (parseError) {
        logger.debug('updateTeacherExperience - could not parse error response');
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    logger.debug('updateTeacherExperience - success data:', data);
    return data.body.data;
  };
  export const createTeacherExperience = async (userId, experienceData, token) => {
    // First get teacherId from user profile
    const teacherDetails = await getTeacherDetailsByUserId(userId);
    
    if (!teacherDetails.success) {
      throw new Error(teacherDetails.error || 'Failed to get teacher details');
    }
  
    const teacherId = teacherDetails.teacher.teacherId;
  
    const response = await fetch(`${BACKEND_BASE_URL}/api/v1/experiences`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: userId,
        teacherId: teacherId,
        organizationName: experienceData.organizationName,
        designation: experienceData.designation,
        startDate: experienceData.startDate,
        endDate: experienceData.endDate,
        association: experienceData.association,
        jobDescription: experienceData.jobDescription,
        currentJob: experienceData.currentJob
      })
    });
  
    if (!response.ok) {
      throw new Error('Failed to create education record');
    }
  
    const data = await response.json();
    return data.body.data;
  };
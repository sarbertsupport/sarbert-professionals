import axios from 'axios';
import logger from '../../utils/logger';
const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL || "http://localhost:8089";
const API_BASE_URL = `${BACKEND_BASE_URL}/api/v1/chat`;

/** True if the logged-in user already has a job_applicants row for this job (backend + JWT). */
export const getCurrentUserAppliedToJob = async (jobId, token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${jobId}/applicants/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = response.data?.body?.data;
    return data === true;
  } catch (error) {
    logger.error('Failed to fetch current user application status:', error);
    throw error;
  }
};

export const getJobApplicantCount = async (jobId, token) => {
  try {
    logger.debug("Fetching applicant count for jobId:", jobId);
    const response = await axios.get(
      `${API_BASE_URL}/${jobId}/applicants/count`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
    );
    
    // Return the count from response data
    const count = response.data?.body?.data;
    return count !== undefined && count !== null ? count : 0;
  } catch (error) {
    logger.error("Failed to fetch applicant count:", error);
    
    // Check if it's a SQL error specifically
    if (error.response?.data?.message?.includes('bad SQL grammar') || 
        error.response?.data?.message?.includes('executeMany')) {
      logger.warn("Backend SQL query error detected, returning fallback count");
      return 0; // Return 0 as fallback for SQL errors
    }
    
    // For other errors, throw to let the component handle it
    throw error;
  }
};
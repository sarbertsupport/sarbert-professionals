import logger from '../../utils/logger';
const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL || "http://localhost:8089";
const BASE_URL = `${BACKEND_BASE_URL}/api/v1/contacts`;

export const getJobPosterContacts = async (jobId, applicantId) => {
  const token = localStorage.getItem("authToken");
  try {
    const response = await fetch(`${BASE_URL}/jobs/${jobId}?applicantId=${applicantId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    logger.debug("API Response:", data);

    // Handle all response codes (including 400, 404, 410) without treating them as errors
    return {
      success: true, // Always true since we're not treating these as errors
      statusCode: data.headers.responseCode,
      message: data.headers.customerMessage,
      data: data.body.data
    };
    
  } catch (error) {
    logger.error("Network error:", error);
    return {
      success: false,
      error: error.message || 'Network error occurred'
    };
  }
};
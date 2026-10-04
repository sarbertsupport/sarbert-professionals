import axios from "axios";
import logger from '../../utils/logger';
const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL || "http://localhost:8089";
const API_BASE_URL = `${BACKEND_BASE_URL}/api/v1/jobs/users`;
const UPDATE_JOB_URL =`${BACKEND_BASE_URL}/api/v1/update/jobs`;
const CLOSE_JOB_URL = `${BACKEND_BASE_URL}/api/v1/close/jobs`;
const GET_JOB_BY_ID_URL = `${BACKEND_BASE_URL}/api/v1/jobs`; // Base URL for getting job by ID

export const fetchMyRequirements = async (userId, page = 1, size = 10, token) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/${userId}?page=${page}&size=${size}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const resCode = response.data?.headers?.responseCode;

    if (resCode === 404) {
      logger.warn("No results found");
      return []; // or [] if you prefer
    }

    return response.data?.body?.data;
  } catch (error) {
    logger.error("Failed to fetch requirements:", error);
    throw error;
  }
};


export const closeRequirement = async (jobId, userId, token) => {
  try {
    const response = await axios.put(
      `${CLOSE_JOB_URL}/${jobId}?userId=${userId}`,
      null, // Explicit null for empty body
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data?.body?.data;
  } catch (error) {
    logger.error("Failed to close requirement:", error);
    throw error;
  }
};

export const updateJobRequirement = async (jobId, userId, updatedData, token) => {
  try {
    logger.debug('Updating job requirement:', {
      jobId,
      userId,
      updatedData
    });

    const response = await axios.put(
      `${UPDATE_JOB_URL}/${jobId}?userId=${userId}`,
      updatedData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    logger.debug('Update response:', response.data);
    return response.data?.body?.data;
  } catch (error) {
    logger.error("Failed to update job requirement:", error);
    if (error.response) {
      logger.error("Error response:", error.response.data);
      logger.error("Error status:", error.response.status);
    }
    throw error;
  }
};

export const getJobById = async (jobId, token) => {
  try {
    logger.debug("jobId ",jobId)
    const response = await axios.get(
      `${GET_JOB_BY_ID_URL}/${jobId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
    );
    return response.data?.body?.data;
  } catch (error) {
    logger.error("Failed to fetch job details:", error);
    throw error;
  }
};
// src/services/teacherProfile.js
import axios from "axios";
import logger from '../../utils/logger';

const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL || "http://localhost:8089";
const API_URL = `${BACKEND_BASE_URL}/api/v1/profiles`;

export const fetchTeacherProfile = async (userId, token) => {
  try {
    const response = await axios.get(`${API_URL}/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data?.body?.data;
  } catch (error) {
    logger.error("Failed to fetch teacher profile:", error);
    throw error;
  }
};

export const updateTeacherProfile = async (userId, profileData, token) => {
  try {
    const response = await axios.put(
      `${API_URL}/${userId}`,
      {
        birthdate: profileData.birthdate,
        location: profileData.location,
        postalCode: profileData.postalCode,
        phoneNumber: profileData.phoneNumber,
        profileDescription: profileData.profileDescription
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data?.body?.data;
  } catch (error) {
    logger.error("Failed to update teacher profile:", error);
    throw error;
  }
};
// src/services/displayTeacherId.js
const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL || "http://localhost:8089";
const BASE_URL = `${BACKEND_BASE_URL}/api/v1/profiles/user`;

export const getTeacherDetailsByUserId = async (userId) => {
  try {
    const token = localStorage.getItem("authToken");

    const response = await fetch(`${BASE_URL}/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok && data?.headers?.responseCode === 200) {
      return { success: true, teacher: data.body.data };
    } else {
      return {
        success: false,
        error: data?.headers?.customerMessage || "Failed to retrieve teacher data",
      };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

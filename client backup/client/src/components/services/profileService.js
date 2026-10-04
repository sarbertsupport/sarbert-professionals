// profileService.js

const BASE_URL = 'http://localhost:8080/api/v1/profiles';


export const saveProfileDetails = async (formData) => {
    try {
      const response = await fetch(`${BASE_URL}/details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      console.log("data", data);
      // Check if the response code is 200 for success
      if (response.ok && data.headers.responseCode === 200) {
        return { success: true, data: data.body.data };
      } else {
        return { success: false, error: data.headers.customerMessage || 'Failed to save profile details' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  

export const uploadProfileImage = async (formData) => {
  try {
    const response = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    if (response.ok) {
      return { success: true, data };
    } else {
      return { success: false, error: data };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

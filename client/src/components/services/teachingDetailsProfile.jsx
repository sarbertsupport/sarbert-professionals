import logger from '../../utils/logger';
// Add this to your services/teacherProfile.js file (or create it if it doesn't exist)
const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL || "http://localhost:8089";
export const fetchTeachingDetails = async (userId, token) => {
    const response = await fetch(`${BACKEND_BASE_URL}/api/v1/teaching/details/teacher/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return null; // Return null when no details exist
      }
      throw new Error('Failed to fetch teaching details');
    }
    
    const data = await response.json();
    return data.body.data; // Return the array of experience items
  };

  export const updateTeachingDetails = async (id, userId, teachingDetail, token) => {
    logger.debug("teachingDetail", teachingDetail);
    
    // Only send the fields the backend expects
    const requestBody = {
      rate: teachingDetail.rate || "hourly",
      maxFee: Number(teachingDetail.maxFee) || 0,
      minFee: Number(teachingDetail.minFee) || 0,
      paymentDetails: teachingDetail.paymentDetails || "",
      totalExpYears: Number(teachingDetail.totalExpYears) || 0,
      onlineExpYears: Number(teachingDetail.onlineExpYears) || 0,
      travelWillingness: Boolean(teachingDetail.travelWillingness),
      travelDistance: Number(teachingDetail.travelDistance || 0),
      onlineAvailability: Boolean(teachingDetail.onlineAvailability),
      homeAvailability: Boolean(teachingDetail.homeAvailability),
      digitalPen: Boolean(teachingDetail.digitalPen || false), // Add missing field
      homeworkHelp: Boolean(teachingDetail.homeworkHelp),
      currentlyEmployed: Boolean(teachingDetail.currentlyEmployed),
      workPreference: teachingDetail.workPreference || ""
    };

    // Validate required fields
    if (!requestBody.rate) {
      throw new Error('Rate is required');
    }
    if (requestBody.maxFee < requestBody.minFee) {
      throw new Error('Maximum fee cannot be less than minimum fee');
    }

    const endpoint = `${BACKEND_BASE_URL}/api/v1/teaching/details/${id}?userId=${userId}`;
    logger.debug("updateTeachingDetails - endpoint:", endpoint);
    logger.debug("updateTeachingDetails - requestBody:", requestBody);

    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    logger.debug("updateTeachingDetails - response status:", response.status);
    logger.debug("updateTeachingDetails - response ok:", response.ok);

    if (!response.ok) {
      let errorMessage = 'Failed to update teaching details';
      try {
        const errorData = await response.json();
        logger.debug("updateTeachingDetails - error data:", errorData);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (parseError) {
        logger.debug("updateTeachingDetails - could not parse error response");
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    logger.debug("updateTeachingDetails - success data:", data);

    return data.body.data;
  };
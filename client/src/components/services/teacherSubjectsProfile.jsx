
export const fetchSubjectExperience = async (userId, token) => {
  const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL || "http://localhost:8089";  
  const response = await fetch(`${BACKEND_BASE_URL}/api/v1/teachers/subjects/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch teacher subject data');
    }
    
    const data = await response.json();
    return data.body.data; // Return the array of experience items
  };
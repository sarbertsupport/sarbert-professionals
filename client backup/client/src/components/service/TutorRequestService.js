// TutorRequestService.js
const API_URL = 'http://localhost:8080/api/v1/post/jobs';

const postTutorRequest = async (formData) => {
  const requestBody = {
    userId: "4", 
    location: formData.location,
    phone: `${formData.countryCode}${formData.phone}`,
    jobRequirements: formData.requirements,
    subjects: formData.subjects,
    level: formData.level,
    jobNature: formData.partTime,
    meetingOptions: formData.meetingOption.join(', '), 
    budget: parseFloat(formData.budget),
    frequency: formData.rate, 
    numberOfTutors: formData.tutorCount === 'Only One' ? 1 : 2,
    jobType: formData.iWant,
    language: formData.languages,
    profileImg: "", 
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();
    if (response.ok) {
      console.log('Job posted successfully:', result);
      return result;
    } else {
      console.error('Failed to post job:', result);
      return null;
    }
  } catch (error) {
    console.error('Error during the fetch request:', error);
    return null;
  }
};

export default postTutorRequest;

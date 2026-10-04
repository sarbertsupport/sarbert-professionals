export function validateTutorRequest(formData) {
  const newErrors = {};
  const requiredFields = [
    'location', 'phone', 'requirements', 'subjects', 'level',
    'budget', 'languages', 'jobCategory', 'iWant'
  ];

  requiredFields.forEach(field => {
    const value = formData[field];
    if (typeof value === 'string' && value.trim() === '') {
      newErrors[field] = 'This field is required';
    } else if (!value) {
      newErrors[field] = 'This field is required';
    }
  });

  if (formData.meetingOption.length === 0) {
    newErrors.meetingOption = 'Please select at least one meeting option';
  }

  if (formData.budget && isNaN(parseFloat(formData.budget))) {
    newErrors.budget = 'Budget must be a number';
  }

  return newErrors;
}

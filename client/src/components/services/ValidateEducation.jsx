export default function ValidationEducation(formData) {
    const errors = {};
  
    if (!formData.institutionName) {
      errors.institutionName = "Institution name is required";
    }
  
    if (!formData.degreeName) {
      errors.degreeName = "Degree name is required";
    }
  
    if (!formData.startDate) {
      errors.startDate = "Start Date is required";
    }
  
    // Validation logic for currentJob and endDate
      if (!formData.endDate) {
        errors.endDate = "End Date is required";
      }
    
  
    if (!formData.specialization) {
      errors.specialization = "Specialization is required";
    }
    if (!formData.score) {
        errors.score = "GPA/Score is required";
      } else {
        const score = parseFloat(formData.score);
        if (isNaN(score) || score < 1 || score > 4) {
          errors.score = "GPA/Score must be between 1.0 and 4.0";
        }
      }
  
    return errors;
  }
  
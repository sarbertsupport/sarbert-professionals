export default function ValidationExperience(formData) {
    const errors = {};
  
    if (!formData.organizationName) {
      errors.organizationName = "Organization name is required";
    }
  
    if (!formData.designation) {
      errors.designation = "Designation is required";
    }
  
    if (!formData.startDate) {
      errors.startDate = "Start Date is required";
    }
  
    // Validation logic for currentJob and endDate
    if (formData.currentJob) {
      if (formData.endDate) {
        delete errors.currentJob; // No error for currentJob if endDate is provided
      }
    } else {
      if (!formData.endDate) {
        errors.endDate = "End Date is required if not currently working";
      }
    }
  
    return errors;
  }
  
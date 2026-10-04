export default function StudentProfileValidation(formData) {
    const errors = {};
  
    if (!formData.fullName) {
      errors.fullName = "Full name is required";
    }
  
    if (!formData.gender) {
      errors.gender = "Gender is required";
    }
  
    if (!formData.birthdate) {
      errors.birthdate = "Date of birth is required";
    }
  
    if (!formData.location) {
      errors.location = "Location is required";
    }
  
    if (!formData.postalCode) {
      errors.postalCode = "Postal code is required";
    }
  
    if (!formData.phoneNumber) {
      errors.phoneNumber = "Phone number is required";
    }
  
    if (!formData.bio) {
      errors.bio = "About you is required";
    }
  
    return errors;
  }
export default function Validation(formData) {
    const errors = {};
  
    if (!formData.displayName) {
      errors.displayName = "Full name is required";
    }

    if (!formData.phoneNumber) {
      errors.phoneNumber = "Phone Number is required";
    }
    if (!formData.birthdate) {
      errors.birthdate = "Date of birth is required";
    }
    if (!formData.location) {
      errors.location = "Location is required";
    }
    if (!formData.postalCode) {
      errors.postalCode = "Postal Code is required";
    }
    if (!formData.profileDescription) {
      errors.profileDescription = "Description is required";
    }
  
    return errors;
  }
  
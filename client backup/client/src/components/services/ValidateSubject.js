export default function ValidateSubject(formData) {
    const errors = {};

    if (!formData.selectedSubjects || formData.selectedSubjects.length === 0) {
      errors.selectedSubjects = "At least one subject must be selected";
    }
  
    return errors;
  }
  
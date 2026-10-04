export default function ValidateSubject(formData) {
  const errors = {};

  if (!formData.selectedSubject) {
    errors.selectedSubject = "At least one subject must be selected";
  }

  return errors;
}

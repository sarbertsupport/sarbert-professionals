export default function ValidateTeachingDetails(formData) {
  const errors = {};

  if (!formData.minFee) {
    errors.minFee = "Minimum fee is required";
  }

  if (!formData.maxFee) {
    errors.maxFee = "Maximum fee is required";
  }

  if (!formData.totalExpYears) {
    errors.totalExpYears = "Years of Total experience is required";
  }
  if (!formData.onlineExpYears) {
    errors.onlineExpYears = "Years of online experience is required";
  }

  if (!formData.travelWillingness) {
      errors.travelWillingness = "Travel willingness is required";
  }

  // Only validate travelDistance if travelWillingness is 'true'
  if (formData.travelWillingness === 'true' && !formData.travelDistance) {
      errors.travelDistance = "Travel distance is required";
  }

  if (!formData.onlineAvailability) {
      errors.onlineAvailability = "Online availability is required";
  }
  if (!formData.homeworkHelp) {
      errors.homeworkHelp = "Homework help option is required";
  }
  if (!formData.currentlyEmployed) {
      errors.currentlyEmployed = "Employment Status option is required";
  }

  return errors;
}

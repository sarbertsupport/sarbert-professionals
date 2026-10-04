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
    if (!formData.totalTeachingExpYears) {
        errors.totalTeachingExpYears = "Years of total teaching experience is required";
    }
  
      if (!formData.onlineTeachingExpYears) {
        errors.onlineTeachingExpYears = "Year of online teaching experience is required";
    }

    if (!formData.travelWillingness) {
        errors.travelWillingness = "Travel willngness is required";
    }
    if (!formData.travelDistance) {
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
  
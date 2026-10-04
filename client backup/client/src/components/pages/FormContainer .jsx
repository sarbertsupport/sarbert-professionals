import React, { useState, useEffect } from 'react';

import ProfileInfoForm from './ProfileInfoForm';
import EducationForm from './EducationForm';
import TeacherExpereinceForm from './TeacherExpereinceForm';
import TeachingDetailsForm from './TeachingDetailsForm';
import TeachersSubject from './TeachersSubject';

const FormContainer = () => {
  const [step, setStep] = useState(0); // Track the current step
  const [formData, setFormData] = useState({
    profileInfo: {},
    education: {},
    teachingExperience: {},
    teacherSubjects: {},
    teachingDetails: {}
  });

  // Load form data from localStorage
  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem('formData'));
    if (savedData) {
      setFormData(savedData);
    }
  }, []);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('formData', JSON.stringify(formData));
  }, [formData]);

  const nextStep = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    console.log("Form Submitted: ", formData);
    localStorage.removeItem('formData'); // Clear local storage after submission
    alert('Form submitted successfully');
  };

  return (
    <div>
      <form>
        {/* Step 1 - Profile Info */}
        {step === 0 && (
          <ProfileInfoForm 
            formData={formData} 
            setFormData={setFormData} 
            nextStep={nextStep} 
            prevStep={prevStep} 
          />
        )}
        {/* Step 2 - Education */}
        {step === 1 && <EducationForm formData={formData} setFormData={setFormData} nextStep={nextStep} prevStep={prevStep} />}
        {/* Step 3 - Teaching Experience */}
        {step === 2 && <TeacherExpereinceForm formData={formData} setFormData={setFormData} nextStep={nextStep} prevStep={prevStep} />}
        {/* Step 4 - Teacher Subjects */}
        {step === 3 && <TeachersSubject formData={formData} setFormData={setFormData} nextStep={nextStep} prevStep={prevStep} />}
        {/* Step 5 - Teaching Details */}
        {step === 4 && <TeachingDetailsForm formData={formData} setFormData={setFormData} nextStep={nextStep} prevStep={prevStep} />}
        {/* Submit button on last step */}
        {step === 4 && (
          <div>
            <button type="button" onClick={handleSubmit}>
              Submit
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default FormContainer;

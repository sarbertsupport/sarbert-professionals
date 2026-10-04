import React, { useState } from 'react';
import Select from 'react-select';
import { FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import ValidateSubject from "../services/ValidateSubject";
import subjectOptionsData from '../student/subjectOptions.json';

const TeachersSubject = ({ formData, setFormData, nextStep, prevStep }) => {
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (selectedOptions) => {
    // Update selectedSubjects
    setSelectedSubjects(selectedOptions);
  
    // Update formData with selectedSubjects
    setFormData((prevData) => {
      const updatedFormData = {
        teacherSubjects: selectedOptions || [], // Ensure it's always an array
      };
  
      // Save the updated form data to localStorage
      localStorage.setItem("teacherSubjects", JSON.stringify(updatedFormData));
  
      return updatedFormData;
    });
  
    // Clear validation error for selectedSubjects if user starts typing/selecting
    if (errors.selectedSubjects) {
      setErrors((prevErrors) => {
        const { selectedSubjects, ...rest } = prevErrors; // Remove selectedSubjects error
        return rest;
      });
    }
  };
  

  const validateAndContinue = (e) => {
    e.preventDefault();
    const validationErrors = ValidateSubject(formData);
    setErrors(validationErrors);
    // If no validation errors, proceed to the next step
    if (Object.keys(validationErrors).length === 0) {
      nextStep();
    }
  };

  const handleAddMoreSubjects = () => {
    // Code to add more subjects goes here
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 px-5">
      <h2 className="text-2xl font-bold mb-6">Select Subjects</h2>
      {/* Message display */}
      {message && (
        <div
          className={`text-lg ${
            message.type === "error" ? "text-red-600" : "text-green-600"
          } mb-4`}
        >
          {message.text}
        </div>
      )}

      <Select
        options={subjectOptionsData} // Use dynamic subject options from the imported JSON
        isMulti
        className={`mb-4 border ${
          errors.selectedSubjects ? "border-red-500" : "border-gray-300"
        } focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm rounded-md`}
        style={{ padding: "10px", height: "35px" }}
        onChange={(selectedOptions) => {
          handleChange(selectedOptions); // Update `selectedSubjects` in state
          setFormData((prevData) => ({
            ...prevData,
            selectedSubjects: selectedOptions || [], // Ensure it's always an array
          }));
        }}
        placeholder="Select subjects..."
        value={formData.selectedSubjects || []}
      />
      {errors.selectedSubjects && (
        <p className="text-red-500 text-sm mt-1">{errors.selectedSubjects}</p>
      )}

      <div className="mb-4 flex justify-between items-center">
        <button
          type="button"
          onClick={prevStep}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-2"
        >
          <FiArrowLeft className="mr-2" />
          Back
        </button>
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={validateAndContinue}
        >
          Save and Continue
          <FiArrowRight className="ml-2" />
        </button>
      </div>
    </div>
  );
};

export default TeachersSubject;

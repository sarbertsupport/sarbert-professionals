import React, { useState } from 'react';
import { FiArrowRight,FiArrowLeft } from 'react-icons/fi';
import ValidateExperience from "../services/ValidateExperience";
const TeacherExpereinceForm = ({ nextStep, prevStep }) => {
  const [formData, setFormData] = useState({
    organizationName: '',
    designation: '',
    startDate: '',
    endDate: '',
    association: '',
    jobDescription: '',
    currentJob: false,
  });
  const [message, setMessage] = useState(null);
  const [errors, setErrors]  = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData((prevData) => {
      const newData = { ...prevData, [name]: val };
      // Save formData to localStorage on every change
      localStorage.setItem('teachingExperience', JSON.stringify(newData));
      return newData;
    });

  // Clear validation error for the field if it exists
  if (errors[name]) {
    setErrors((prevErrors) => {
      const { [name]: removedError, ...rest } = prevErrors; // Remove the specific error
      return rest;
    });
  }
  };

  const validateAndContinue = (e) => {
    e.preventDefault();
    const validationErrors = ValidateExperience(formData);
    setErrors(validationErrors);
   console.log("errors "+validationErrors);
   console.log(Object.keys(validationErrors).length);
    // If no validation errors, proceed to the next step
    if (Object.keys(validationErrors).length === 0) {
      nextStep();
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto mt-10 px-5">
      <h2 className="text-2xl font-bold mb-6">Experience Details</h2>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="col-span-1">
          <div className="mb-4">
            <label htmlFor="organizationName" className="block text-lg font-medium text-gray-700">
              Organization Name
            </label>
            <input
              type="text"
              id="organizationName"
              name="organizationName"
              value={formData.organizationName}
              onChange={handleChange}
              className={`mt-1 mr-2 border ${
                errors.organizationName ? "border-red-500" : "border-gray-300"
              } focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm rounded-md`}
              style={{ padding: "10px", height: "35px" }}
              
            />
            {errors.organizationName && (
                <p className="text-red-500 text-sm mt-1">{errors.organizationName}</p>
              )}
          </div>
          <div className="mb-4">
            <label htmlFor="designation" className="block text-lg font-medium text-gray-700">
              Designation
            </label>
            <input
              type="text"
              id="designation"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              className={`mt-1 mr-2 border ${
                errors.designation ? "border-red-500" : "border-gray-300"
              } focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm rounded-md`}
              style={{ padding: "10px", height: "35px" }}
              
            />
            {errors.designation && (
                <p className="text-red-500 text-sm mt-1">{errors.designation}</p>
              )}
          </div>
          <div className="mb-4">
            <label htmlFor="startDate" className="block text-lg font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className={`mt-1 mr-2 border ${
                errors.startDate ? "border-red-500" : "border-gray-300"
              } focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm rounded-md`}
              style={{ padding: "10px", height: "35px" }}
              
            />
            {errors.startDate && (
                <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
              )}
          </div>
          <div className="mb-4">
            <label htmlFor="endDate" className="block text-lg font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={(e) => {
                handleChange(e);
                if (formData.currentJob) {
                  setErrors((prevErrors) => ({ ...prevErrors, endDate: undefined }));
                }
              }}
              className={`mt-1 mr-2 border ${
                errors.endDate ? "border-red-500" : "border-gray-300"
              } focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm rounded-md`}
              style={{ padding: "10px", height: "35px" }}
            />
            {errors.endDate && (
              <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
            )}
        </div>
        </div>
        <div className="col-span-1">
          <div className="mb-4">
            <label htmlFor="association" className="block text-lg font-medium text-gray-700">
              Job Type
            </label>
            <select
              id="association"
              name="association"
              value={formData.association}
              onChange={handleChange}
              className="mt-1 mr-2 border focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-lg border-gray-300 rounded-md appearance-none"
              style={{ padding: '2px', height: '35px', backgroundColor: '#f7fafc' }}
            >
              <option value="">Please select</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="jobDescription" className="block text-lg font-medium text-gray-700">
              Job Description
            </label>
            <textarea
              id="jobDescription"
              name="jobDescription"
              value={formData.jobDescription}
              onChange={handleChange}
              rows="4"
              className="mt-1 mr-2 border focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-lg border-gray-300 rounded-md"
              style={{ padding: '10px' }}
            ></textarea>
          </div>
          <div className="mb-4">
            <label htmlFor="currentJob" className="flex items-center">
              <input
                type="checkbox"
                id="currentJob"
                name="currentJob"
                checked={formData.currentJob}
                onChange={(e) => {
                  handleChange(e);
                  if (e.target.checked) {
                    setErrors((prevErrors) => ({ ...prevErrors, endDate: undefined }));
                  }
                }}
                className="form-checkbox h-5 w-5 text-indigo-600"
              />
              <span className="ml-2 text-lg font-medium text-gray-700">Current Job</span>
            </label>
          </div>
        </div>
      </div>
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


    </form>
  );
};

export default TeacherExpereinceForm;

import React, { useState, useEffect } from 'react';
import { FiArrowRight,FiArrowLeft } from 'react-icons/fi';
import universitiesData from './worlduniversities.json';
import ValidateEducation from "../services/ValidateEducation";
const EducationForm = ({ nextStep, prevStep }) => {
  const [formData, setFormData] = useState({
    institutionName: '',
    degreeType: '',
    degreeName: '',
    startDate: '',
    endDate: '',
    association: '',
    specialization: '',
    score: '',
  });

  const [filteredOptions, setFilteredOptions] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [message, setMessage] = useState(null);
  const [errors, setErrors]  = useState({});
  
  const handleChange = (e) => {
    const { name, value } = e.target;
  
    // Update formData and save to localStorage
    setFormData((prevData) => {
      const updatedFormData = {
        ...prevData,
        [name]: value,
      };
  
      // Save updated formData to localStorage
      localStorage.setItem("education", JSON.stringify(updatedFormData));
  
      return updatedFormData;
    });
  
    // Clear validation error for the field if it exists
    if (errors[name]) {
      setErrors((prevErrors) => {
        const { [name]: removedError, ...rest } = prevErrors; // Remove the specific error
        return rest;
      });
    }
  
    // Filter university options
    if (value.trim() !== "") {
      const filtered = universitiesData.filter((uni) =>
        `${uni.name}, ${uni.country}`.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions([]);
    }
  };
  
  
const handleSuggestionClick = (suggestion) => {
    setFormData({ ...formData, institutionName: suggestion.name });
    setFilteredOptions([]);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
  };
  const validateAndContinue = (e) => {
    e.preventDefault();
    const validationErrors = ValidateEducation(formData);
    setErrors(validationErrors);
    // If no validation errors, proceed to the next step
    if (Object.keys(validationErrors).length === 0) {
      nextStep();
    }
  };
  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto mt-10 px-5">
      <h2 className="text-2xl font-bold mb-6">Education Details</h2>
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
          <label htmlFor="institutionName" className="block text-lg font-medium text-gray-700">
            Institution Name (if not listed, select Other)
          </label>
          <input
            list="institutions"
            id="institutionName"
            name="institutionName"
            value={formData.institutionName}
            onChange={handleChange}
            className={`mt-1 mr-2 border ${
              errors.institutionName ? "border-red-500" : "border-gray-300"
            } focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-lg rounded-md`}
            style={{ padding: "2px", height: "35px" }}
          />
          <datalist id="institutions">
            {universitiesData.map((uni) => (
              <option key={`${uni.name}, ${uni.country}`} value={`${uni.name}, ${uni.country}`} />
            ))}
          </datalist>
          {errors.institutionName && (
            <p className="text-red-500 text-sm mt-1">{errors.institutionName}</p>
          )}
        </div>
          <div className="mb-4">
              <label htmlFor="degreeType" className="block text-lg font-medium text-gray-700">
                Degree Type
              </label>
              <select
                id="degreeType"
                name="degreeType"
                value={formData.degreeType}
                onChange={handleChange}
                autoComplete="degreeType"
                className={`mt-1 mr-2 border ${
                  errors.degreeType ? "border-red-500" : "border-gray-300"
                } focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-lg rounded-md appearance-none`}
                style={{ padding: "2px", height: "35px", backgroundColor: "#f7fafc" }}
              > 
                <option value="Secondary">Secondary</option>
                <option value="Higher Secondary">Higher Secondary</option>
                <option value="Junior Secondary">Junior Secondary</option>
                <option value="Diploma">Diploma</option>
                <option value="Graduation">Graduation</option>
                <option value="Advanced Diploma">Advanced Diploma</option>
                <option value="Bachelor">Bachelor</option>
                <option value="Post Graduation">Post Graduation</option>
                <option value="Doctorate/PHD">Doctorate/PHD</option>
                <option value="Certification">Certification</option>
                <option value="Other">Other</option>
              </select>
              {errors.degreeType && (
                <p className="text-red-500 text-sm mt-1">{errors.degreeType}</p>
              )}
            </div>

          <div className="mb-4">
            <label htmlFor="degreeName" className="block text-lg font-medium text-gray-700">
              Degree Name
            </label>
            <input
              type="text"
              id="degreeName"
              name="degreeName"
              value={formData.degreeName}
              onChange={handleChange}
              autoComplete="degreeName"
              className={`mt-1 mr-2 border ${
                errors.degreeName ? "border-red-500" : "border-gray-300"
              } focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm rounded-md`}
              style={{ padding: "10px", height: "35px" }}
              
            />
            {errors.degreeName && (
                <p className="text-red-500 text-sm mt-1">{errors.degreeName}</p>
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
              autoComplete="startDate"
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
              onChange={handleChange}
              autoComplete="endDate"
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
              Mode Of Learning
            </label>
            <select
              id="association"
              name="association"
              value={formData.association}
              onChange={handleChange}
              autoComplete="association"
              className="mt-1 mr-2 border focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-lg border-gray-300 rounded-md appearance-none"
              style={{ padding: '2px', height: '35px', backgroundColor: '#f7fafc' }}
            >
              
              <option value="Full Time">Full Time</option>
              <option value="Part Time">Part Time</option>
              <option value="Distance Learning">Distance Learning</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="specialization" className="block text-lg font-medium text-gray-700">
              Specialization
            </label>
            <input
              type="text"
              id="specialization"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              autoComplete="specialization"
              className={`mt-1 mr-2 border ${
                errors.specialization ? "border-red-500" : "border-gray-300"
              } focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm rounded-md`}
              style={{ padding: "10px", height: "35px" }}
              
            />
            {errors.specialization && (
                <p className="text-red-500 text-sm mt-1">{errors.specialization}</p>
              )}
          </div>
          <div className="mb-4">
            <label htmlFor="score" className="block text-lg font-medium text-gray-700">
              Score
            </label>
            <input
              type="text"
              id="score"
              name="score"
              value={formData.score}
              onChange={handleChange}
              autoComplete="score"
              className={`mt-1 mr-2 border ${
                errors.score ? "border-red-500" : "border-gray-300"
              } focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm rounded-md`}
              style={{ padding: "10px", height: "35px" }}
              
            />
            {errors.score && (
                <p className="text-red-500 text-sm mt-1">{errors.score}</p>
              )}
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

export default EducationForm;

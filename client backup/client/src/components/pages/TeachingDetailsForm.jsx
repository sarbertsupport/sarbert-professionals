import React, { useState } from 'react';
import { FiArrowRight,FiArrowLeft } from 'react-icons/fi';
import ValidateTeachingDetails from "../services/ValidateTeachingDetails";
const TeachingDetailsForm = ({  nextStep, prevStep })  => {
  const [message, setMessage] = useState(null);
  const [errors, setErrors]  = useState({});
  const [formData, setFormData] = useState({
    rate: '',
    minFee: '',
    maxFee: '',
    feeDetails: '',
    totalExpYears: '',
    totalTeachingExpYears: '',
    onlineTeachingExpYears: '',
    travelWillingness: 'false',
    travelDistance: '',
    onlineAvailability: 'false',
    digitalPen: 'false',
    homeworkHelp: 'false',
    currentlyEmployed: 'false',
    workPreference: '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
  
    // Update formData and save to localStorage
    setFormData((prevData) => {
      const updatedFormData = {
        ...prevData,
        [name]: type === 'checkbox' ? checked.toString() : value,
      };
  
      // Save updated formData to localStorage
      localStorage.setItem("teachingDetails", JSON.stringify(updatedFormData));
  
      return updatedFormData;
    });
  };
  
  const validateAndSubmit = (e) => {
    e.preventDefault();
    const validationErrors = ValidateTeachingDetails(formData);
    setErrors(validationErrors);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = ValidateTeachingDetails(formData);
    setErrors(validationErrors);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto mt-10 px-5">
      <h2 className="text-2xl font-bold mb-6">Teaching Details</h2>
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
            <label htmlFor="rate" className="block text-lg font-medium text-gray-700">
              I charge
            </label>
            <select
              id="rate"
              name="rate"
              value={formData.rate}
              onChange={handleChange}
              className="mt-1 mr-2 border focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-lg border-gray-300 rounded-md"
              style={{ padding: '2px', height: '35px', backgroundColor: '#f7fafc' }}
            >
              <option value="">Select</option>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="minFee" className="block text-lg font-medium text-gray-700">
              Minimum fee( in USD)
            </label>
            <input
              type="number"
              id="minFee"
              name="minFee"
              value={formData.minFee}
              onChange={handleChange}
              placeholder="Minimum fee"
              className={`mt-1 mr-2 border ${
              errors.minFee ? "border-red-500" : "border-gray-300"
              } focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm rounded-md`}
              style={{ padding: "10px", height: "35px" }}
              
            />
            {errors.minFee && (
                <p className="text-red-500 text-sm mt-1">{errors.minFee}</p>
              )}
          </div>
          <div className="mb-4">
            <label htmlFor="maxFee" className="block text-lg font-medium text-gray-700">
              Maximum fee( in USD)
            </label>
            <input
              type="number"
              id="maxFee"
              name="maxFee"
              value={formData.maxFee}
              onChange={handleChange}
              placeholder="Maximum fee"
              className={`mt-1 mr-2 border ${
                errors.maxFee ? "border-red-500" : "border-gray-300"
                } focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm rounded-md`}
                style={{ padding: "10px", height: "35px" }}
                
              />
              {errors.maxFee && (
                  <p className="text-red-500 text-sm mt-1">{errors.maxFee}</p>
                )}
          </div>
          <div className="mb-4">
            <label htmlFor="feeDetails" className="block text-lg font-medium text-gray-700">
              Fee Details
            </label>
            <textarea
              id="feeDetails"
              name="feeDetails"
              value={formData.feeDetails}
              onChange={handleChange}
              className="mt-1 mr-2 border focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-lg border-gray-300 rounded-md"
              style={{ padding: '10px', minHeight: '100px', width: '100%' }}
              placeholder="Enter fee details"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="totalExpYears" className="block text-lg font-medium text-gray-700">
              Years of total experience
            </label>
            <input
              type="number"
              id="totalExpYears"
              name="totalExpYears"
              value={formData.totalExpYears}
              onChange={handleChange}
              placeholder="Total experience (years)"
              className={`mt-1 mr-2 border ${
                errors.totalExpYears ? "border-red-500" : "border-gray-300"
                } focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm rounded-md`}
                style={{ padding: "10px", height: "35px" }}
                
              />
              {errors.totalExpYears && (
                  <p className="text-red-500 text-sm mt-1">{errors.totalExpYears}</p>
                )}
          </div>
          <div className="mb-4">
            <label htmlFor="totalTeachingExpYears" className="block text-lg font-medium text-gray-700">
              Years of total teaching experience
            </label>
            <input
              type="number"
              id="totalTeachingExpYears"
              name="totalTeachingExpYears"
              value={formData.totalTeachingExpYears}
              onChange={handleChange}
              placeholder="Total teaching experience (years)"
              className={`mt-1 mr-2 border ${
                errors.totalTeachingExpYears ? "border-red-500" : "border-gray-300"
                } focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm rounded-md`}
                style={{ padding: "10px", height: "35px" }}
              />
              {errors.totalTeachingExpYears && (
                  <p className="text-red-500 text-sm mt-1">{errors.totalTeachingExpYears}</p>
                )}
          </div>
          <div className="mb-4">
            <label htmlFor="onlineTeachingExpYears" className="block text-lg font-medium text-gray-700">
              Years of online teaching experience
            </label>
            <input
              type="number"
              id="onlineTeachingExpYears"
              name="onlineTeachingExpYears"
              value={formData.onlineTeachingExpYears}
              onChange={handleChange}
              placeholder="Online teaching experience (years)"
              className={`mt-1 mr-2 border ${
                errors.onlineTeachingExpYears ? "border-red-500" : "border-gray-300"
                } focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm rounded-md`}
                style={{ padding: "10px", height: "35px" }}
              />
              {errors.onlineTeachingExpYears && (
                  <p className="text-red-500 text-sm mt-1">{errors.onlineTeachingExpYears}</p>
                )}
          </div>
        </div>
        <div className="col-span-1">
        
          <div className="mb-4">
            <label className="block text-lg font-medium text-gray-700">Are you willing to travel to Student?</label>
            <div>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="travelWillingness"
                  value="true"
                  checked={formData.travelWillingness === 'true'}
                  onChange={handleChange}
                  className="form-radio h-5 w-5 text-indigo-600"
                />
                <span className="ml-2">Yes</span>
              </label>
              <label className="inline-flex items-center ml-6">
                <input
                  type="radio"
                  name="travelWillingness"
                  value="false"
                  checked={formData.travelWillingness === 'false'}
                  onChange={handleChange}
                  className="form-radio h-5 w-5 text-indigo-600"
                />
                <span className="ml-2">No</span>
              </label>
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="travelDistance" className="block text-lg font-medium text-gray-700">
              How far can you travel? (kms.)
            </label>
            <input
              type="number"
              id="travelDistance"
              name="travelDistance"
              value={formData.travelDistance}
              onChange={handleChange}
              placeholder="Travel distance (kms)"
              className={`mt-1 mr-2 border ${
                errors.travelDistance ? "border-red-500" : "border-gray-300"
                } focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm rounded-md`}
                style={{ padding: "10px", height: "35px" }}
              />
              {errors.travelDistance && (
                  <p className="text-red-500 text-sm mt-1">{errors.travelDistance}</p>
                )}
          </div>
          <div className="mb-4">
            <label className="block text-lg font-medium text-gray-700">Available for online teaching?</label>
            <div>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="onlineAvailability"
                  value="true"
                  checked={formData.onlineAvailability === 'true'}
                  onChange={handleChange}
                  className="form-radio h-5 w-5 text-indigo-600"
                />
                <span className="ml-2">Yes</span>
              </label>
              <label className="inline-flex items-center ml-6">
                <input
                  type="radio"
                  name="onlineAvailability"
                  value="false"
                  checked={formData.onlineAvailability === 'false'}
                  onChange={handleChange}
                  className="form-radio h-5 w-5 text-indigo-600"
                />
                <span className="ml-2">No</span>
              </label>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-lg font-medium text-gray-700">Do you help with homework and assignments?</label>
            <div>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="homeworkHelp"
                  value="true"
                  checked={formData.homeworkHelp === 'true'}
                  onChange={handleChange}
                  className="form-radio h-5 w-5 text-indigo-600"
                />
                <span className="ml-2">Yes</span>
              </label>
              <label className="inline-flex items-center ml-6">
                <input
                  type="radio"
                  name="homeworkHelp"
                  value="false"
                  checked={formData.homeworkHelp === 'false'}
                  onChange={handleChange}
                  className="form-radio h-5 w-5 text-indigo-600"
                />
                <span className="ml-2">No</span>
              </label>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-lg font-medium text-gray-700">Are you currently employed as a professional?</label>
            <div>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="currentlyEmployed"
                  value="true"
                  checked={formData.currentlyEmployed === 'true'}
                  onChange={handleChange}
                  className="form-radio h-5 w-5 text-indigo-600"
                />
                <span className="ml-2">Yes</span>
              </label>
              <label className="inline-flex items-center ml-6">
                <input
                  type="radio"
                  name="currentlyEmployed"
                  value="false"
                  checked={formData.currentlyEmployed === 'false'}
                  onChange={handleChange}
                  className="form-radio h-5 w-5 text-indigo-600"
                />
                <span className="ml-2">No</span>
              </label>
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="workPreference" className="block text-lg font-medium text-gray-700">
              Opportunities you are interested in :
            </label>
            <select
              id="workPreference"
              name="workPreference"
              value={formData.workPreference}
              onChange={handleChange}
              className="mt-1 mr-2 border focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-lg border-gray-300 rounded-md"
              style={{ padding: '2px', height: '35px', backgroundColor: '#f7fafc' }}
            >
              <option value="">Select</option>
              <option value="Full Time">Full Time</option>
              <option value="Part Time">Part Time</option>
              <option value="Both">Both (Part Time & Full Time)</option>
            </select>
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
          onClick={handleSubmit}
        >
          Submit
          <FiArrowRight className="ml-2" />
        </button>
    </div>
    </form>
  );
};

export default TeachingDetailsForm;

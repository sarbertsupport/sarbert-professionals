import React, { useState, useEffect } from 'react';
import { FiArrowRight } from 'react-icons/fi';
import validateTeachingDetails from '../../components/services/ValidateTeachingDetails';
import { saveTeachingDetails } from '../../components/services/teachingDetailsService';
import { useNavigate } from "react-router-dom";
import { fetchUserProfile } from '../../components/services/authProfile';
import { getTeacherDetailsByUserId } from '../../components/services/displayTeacherId';
import logger from '../../utils/logger';
import { TEACHING_DETAILS_FORM_INITIAL } from './teachingDetailsFormConstants';
import { useTeachingFormProgress } from './useTeachingFormProgress';

const TeachingDetailsForm = () => {
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [formData, setFormData] = useState(TEACHING_DETAILS_FORM_INITIAL);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserProfileAndTeacherId = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const profile = await fetchUserProfile(token);
        const userId = profile.userId;

        setFormData((prevData) => ({
          ...prevData,
          userId: userId,
        }));

        const teacherResponse = await getTeacherDetailsByUserId(userId);

        if (teacherResponse.success) {
          setFormData((prevData) => ({
            ...prevData,
            teacherId: teacherResponse.teacher.teacherId,
          }));
        } else {
          setMessage({
            type: "error",
            text: teacherResponse.error || "Failed to load teacher details.",
          });
        }
      } catch (error) {
        setMessage({
          type: "error",
          text: "Failed to load user profile or teacher details.",
        });
      }
    };

    loadUserProfileAndTeacherId();
  }, []);

  useTeachingFormProgress(isSubmitting, setProgress);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked.toString() : value;

    setFormData((prevData) => ({
      ...prevData,
      [name]: val,
    }));

    // Clear error if exists
    if (errors[name]) {
      setErrors(prev => {
        const { [name]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setProgress(10); // Start progress
    
    const validationErrors = validateTeachingDetails(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        const response = await saveTeachingDetails(formData);
        setProgress(100); // Complete progress

        if (response.success) {
          setMessage({
            type: "success",
            text: "Teaching details saved successfully",
          });
          setTimeout(() => navigate("/complete"), 2000);
        } else {
          setMessage({
            type: "error",
            text: response.error || "Failed to save teaching details",
          });
        }
      } catch (error) {
        logger.error("Error saving teaching details:", error);
        setProgress(0);
        setMessage({
          type: "error",
          text: "An error occurred while saving teaching details",
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setProgress(0);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-700">
            <h2 className="text-2xl font-bold text-white">Teaching Service Details</h2>
            <p className="mt-1 text-sm text-blue-100">Provide details about your teaching services and preferences</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {message && (
              <div className={`mb-6 p-4 rounded-md ${
                message.type === "error" 
                  ? "bg-red-50 text-red-700 border border-red-200" 
                  : "bg-green-50 text-green-700 border border-green-200"
              }`}>
                {message.text}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div>
                <div className="mb-5">
                  <label htmlFor="rate" className="block text-sm font-medium text-gray-700 mb-1">
                    Rate Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="rate"
                    name="rate"
                    value={formData.rate}
                    onChange={handleChange}
                    className={`block w-full px-4 py-2 rounded-md border ${
                      errors.rate ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    } shadow-sm sm:text-sm bg-white`}
                  >
                    <option value="">Select rate type</option>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                  {errors.rate && (
                    <p className="mt-1 text-sm text-red-600">{errors.rate}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <div>
                    <label htmlFor="minFee" className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Fee (USD) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        id="minFee"
                        name="minFee"
                        value={formData.minFee}
                        onChange={handleChange}
                        placeholder="0.00"
                        className={`block w-full pl-7 pr-12 py-2 rounded-md border ${
                          errors.minFee ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                          : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        } shadow-sm sm:text-sm`}
                      />
                    </div>
                    {errors.minFee && (
                      <p className="mt-1 text-sm text-red-600">{errors.minFee}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="maxFee" className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Fee (USD) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        id="maxFee"
                        name="maxFee"
                        value={formData.maxFee}
                        onChange={handleChange}
                        placeholder="0.00"
                        className={`block w-full pl-7 pr-12 py-2 rounded-md border ${
                          errors.maxFee ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                          : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        } shadow-sm sm:text-sm`}
                      />
                    </div>
                    {errors.maxFee && (
                      <p className="mt-1 text-sm text-red-600">{errors.maxFee}</p>
                    )}
                  </div>
                </div>

                <div className="mb-5">
                  <label htmlFor="paymentDetails" className="block text-sm font-medium text-gray-700 mb-1">
                    Fee Details
                  </label>
                  <textarea
                    id="paymentDetails"
                    name="paymentDetails"
                    value={formData.paymentDetails}
                    onChange={handleChange}
                    rows={3}
                    className={`block w-full px-4 py-2 rounded-md border ${
                      errors.paymentDetails ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    } shadow-sm sm:text-sm`}
                    placeholder="Describe your fee structure, discounts, etc."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <div>
                    <label htmlFor="totalExpYears" className="block text-sm font-medium text-gray-700 mb-1">
                      Total Experience (Years) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="totalExpYears"
                      name="totalExpYears"
                      value={formData.totalExpYears}
                      onChange={handleChange}
                      min="0"
                      className={`block w-full px-4 py-2 rounded-md border ${
                        errors.totalExpYears ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      } shadow-sm sm:text-sm`}
                    />
                    {errors.totalExpYears && (
                      <p className="mt-1 text-sm text-red-600">{errors.totalExpYears}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="onlineExpYears" className="block text-sm font-medium text-gray-700 mb-1">
                      Online Experience (Years) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="onlineExpYears"
                      name="onlineExpYears"
                      value={formData.onlineExpYears}
                      onChange={handleChange}
                      min="0"
                      className={`block w-full px-4 py-2 rounded-md border ${
                        errors.onlineExpYears ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      } shadow-sm sm:text-sm`}
                    />
                    {errors.onlineExpYears && (
                      <p className="mt-1 text-sm text-red-600">{errors.onlineExpYears}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div>
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Willing to travel to students? <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="travelWillingness"
                        value="true"
                        checked={formData.travelWillingness === 'true'}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Yes</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="travelWillingness"
                        value="false"
                        checked={formData.travelWillingness === 'false'}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">No</span>
                    </label>
                  </div>
                </div>

                {formData.travelWillingness === 'true' && (
                  <div className="mb-5">
                    <label htmlFor="travelDistance" className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Travel Distance (km) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="travelDistance"
                      name="travelDistance"
                      value={formData.travelDistance}
                      onChange={handleChange}
                      min="0"
                      className={`block w-full px-4 py-2 rounded-md border ${
                        errors.travelDistance ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      } shadow-sm sm:text-sm`}
                    />
                    {errors.travelDistance && (
                      <p className="mt-1 text-sm text-red-600">{errors.travelDistance}</p>
                    )}
                  </div>
                )}

                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available for online teaching? <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="onlineAvailability"
                        value="true"
                        checked={formData.onlineAvailability === 'true'}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Yes</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="onlineAvailability"
                        value="false"
                        checked={formData.onlineAvailability === 'false'}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">No</span>
                    </label>
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Provide homework help? <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="homeworkHelp"
                        value="true"
                        checked={formData.homeworkHelp === 'true'}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Yes</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="homeworkHelp"
                        value="false"
                        checked={formData.homeworkHelp === 'false'}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">No</span>
                    </label>
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currently employed as teacher? <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="currentlyEmployed"
                        value="true"
                        checked={formData.currentlyEmployed === 'true'}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Yes</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="currentlyEmployed"
                        value="false"
                        checked={formData.currentlyEmployed === 'false'}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">No</span>
                    </label>
                  </div>
                </div>

                <div className="mb-5">
                  <label htmlFor="workPreference" className="block text-sm font-medium text-gray-700 mb-1">
                    Work Preference <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="workPreference"
                    name="workPreference"
                    value={formData.workPreference}
                    onChange={handleChange}
                    className={`block w-full px-4 py-2 rounded-md border ${
                      errors.workPreference ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    } shadow-sm sm:text-sm bg-white`}
                  >
                    <option value="">Select work preference</option>
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Both">Both (Part Time & Full Time)</option>
                  </select>
                  {errors.workPreference && (
                    <p className="mt-1 text-sm text-red-600">{errors.workPreference}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col items-end space-y-4 border-t pt-6">
              {isSubmitting && (
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              )}
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving... ({progress}%)
                  </>
                ) : (
                  <>
                    Submit Details
                    <FiArrowRight className="ml-2" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeachingDetailsForm;
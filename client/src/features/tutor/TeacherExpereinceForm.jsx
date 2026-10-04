import React, { useState, useEffect } from 'react';
import { FiArrowRight, FiArrowLeft, FiPlus } from 'react-icons/fi';
import validateExperience from '../../components/services/ValidateExperience';
import { saveExperienceDetails } from '../../components/services/experienceService';
import { useNavigate } from "react-router-dom";
import { fetchUserProfile } from '../../components/services/authProfile';
import { getTeacherDetailsByUserId } from '../../components/services/displayTeacherId';
import logger from '../../utils/logger';

const TeacherExperienceForm = () => {
  const [formData, setFormData] = useState({
    userId: null,
    teacherId: null,
    organizationName: '',
    designation: '',
    startDate: '',
    endDate: '',
    association: '',
    jobDescription: '',
    currentJob: false,
  });

  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

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

  useEffect(() => {
    let interval;
    if (isSubmitting) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return 90; // Cap at 90% until submission completes
          return prev + 5;
        });
      }, 300);
    } else {
      setProgress(0);
    }

    return () => clearInterval(interval);
  }, [isSubmitting]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    setFormData((prevData) => ({
      ...prevData,
      [name]: val
    }));

    if (errors[name]) {
      setErrors((prevErrors) => {
        const { [name]: removedError, ...rest } = prevErrors;
        return rest;
      });
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      userId: formData.userId,
      teacherId: formData.teacherId,
      organizationName: '',
      designation: '',
      startDate: '',
      endDate: '',
      association: '',
      jobDescription: '',
      currentJob: false,
    });
    setErrors({});
    setMessage(null);
  };

  // Save and add another experience entry
  const handleSaveAndAddAnother = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setProgress(10);
    
    const validationErrors = validateExperience(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        const response = await saveExperienceDetails(formData);
        setProgress(100);

        if (response.success) {
          setMessage({
            type: "success",
            text: "Experience details saved successfully. You can now add another entry.",
          });
          // Reset form for next entry
          setTimeout(() => {
            resetForm();
          }, 1500);
        } else {
          setMessage({
            type: "error",
            text: response.error || "Failed to save experience details",
          });
        }
      } catch (error) {
        logger.error("Error saving experience details:", error);
        setProgress(0);
        setMessage({
          type: "error",
          text: "An error occurred while saving experience details",
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setProgress(0);
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setProgress(10); // Start progress
    
    const validationErrors = validateExperience(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        const response = await saveExperienceDetails(formData);
        setProgress(100); // Complete progress

        if (response.success) {
          setMessage({
            type: "success",
            text: "Experience details saved successfully",
          });
          setTimeout(() => {
            navigate("/subjects");
          }, 2000);
        } else {
          setMessage({
            type: "error",
            text: response.error || "Failed to save experience details",
          });
        }
      } catch (error) {
        logger.error("Error saving experience details:", error);
        setProgress(0);
        setMessage({
          type: "error",
          text: "An error occurred while saving experience details",
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
            <h2 className="text-2xl font-bold text-white">Professional Experience</h2>
            <p className="mt-1 text-sm text-blue-100">Add your work history and positions held</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {message && (
              <div
                className={`mb-6 p-4 rounded-md ${
                  message.type === "error" 
                    ? "bg-red-50 text-red-700 border border-red-200" 
                    : "bg-green-50 text-green-700 border border-green-200"
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div>
                <div className="mb-5">
                  <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700 mb-1">
                    Organization Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="organizationName"
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleChange}
                    className={`block w-full px-4 py-2 rounded-md border ${
                      errors.organizationName 
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    } shadow-sm sm:text-sm`}
                    placeholder="e.g. Microsoft Corporation"
                  />
                  {errors.organizationName && (
                    <p className="mt-1 text-sm text-red-600">{errors.organizationName}</p>
                  )}
                </div>

                <div className="mb-5">
                  <label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-1">
                    Designation <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="designation"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    className={`block w-full px-4 py-2 rounded-md border ${
                      errors.designation 
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    } shadow-sm sm:text-sm`}
                    placeholder="e.g. Senior Software Engineer"
                  />
                  {errors.designation && (
                    <p className="mt-1 text-sm text-red-600">{errors.designation}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className={`block w-full px-4 py-2 rounded-md border ${
                        errors.startDate 
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                          : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      } shadow-sm sm:text-sm`}
                    />
                    {errors.startDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                      End Date {!formData.currentJob && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      disabled={formData.currentJob}
                      className={`block w-full px-4 py-2 rounded-md border ${
                        errors.endDate 
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                          : formData.currentJob 
                            ? "border-gray-200 bg-gray-100" 
                            : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      } shadow-sm sm:text-sm`}
                    />
                    {errors.endDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div>
                <div className="mb-5">
                  <label htmlFor="association" className="block text-sm font-medium text-gray-700 mb-1">
                    Employment Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="association"
                    name="association"
                    value={formData.association}
                    onChange={handleChange}
                    className={`block w-full px-4 py-2 rounded-md border ${
                      errors.association 
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    } shadow-sm sm:text-sm bg-white`}
                  >
                    <option value="">Select employment type</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                  {errors.association && (
                    <p className="mt-1 text-sm text-red-600">{errors.association}</p>
                  )}
                </div>

                <div className="mb-5">
                  <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Job Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="jobDescription"
                    name="jobDescription"
                    value={formData.jobDescription}
                    onChange={handleChange}
                    rows="4"
                    className={`block w-full px-4 py-2 rounded-md border ${
                      errors.jobDescription 
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    } shadow-sm sm:text-sm`}
                    placeholder="Describe your responsibilities and achievements..."
                  />
                  {errors.jobDescription && (
                    <p className="mt-1 text-sm text-red-600">{errors.jobDescription}</p>
                  )}
                </div>

                <div className="flex items-center mb-5">
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
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="currentJob" className="ml-2 block text-sm text-gray-700">
                    I currently work here
                  </label>
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
              
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handleSaveAndAddAnother}
                  disabled={isSubmitting}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
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
                      <FiPlus className="mr-2" />
                      Save and Add Another
                    </>
                  )}
                </button>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
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
                      Save and Continue
                      <FiArrowRight className="ml-2" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeacherExperienceForm;
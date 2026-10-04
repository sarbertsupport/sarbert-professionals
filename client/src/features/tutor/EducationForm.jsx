import React, { useState, useEffect } from 'react';
import { FiArrowRight, FiArrowLeft, FiPlus } from 'react-icons/fi';
import logger from '../../utils/logger';
// import worlduniversities from '../../pages/worlduniversities.json';
import { getTeacherDetailsByUserId } from '../../components/services/displayTeacherId';
import validateEducation from '../../components/services/ValidateEducation';
import { saveEducationDetails } from '../../components/services/educationService';
import { useNavigate } from "react-router-dom";
import { fetchUserProfile } from '../../components/services/authProfile';
import { EDUCATION_FORM_INITIAL } from './educationFormConstants';

const EducationForm = () => {
  const [formData, setFormData] = useState(EDUCATION_FORM_INITIAL);

  const navigate = useNavigate();
  const [filteredOptions, setFilteredOptions] = useState([]);
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
    const { name, value } = e.target;

    setFormData((prevData) => {
      const updatedFormData = {
        ...prevData,
        [name]: value,
      };
      return updatedFormData;
    });

    if (errors[name]) {
      setErrors((prevErrors) => {
        const { [name]: removedError, ...rest } = prevErrors;
        return rest;
      });
    }

    // All usage of worlduniversities is commented out or removed
  };

  const handleSuggestionClick = (suggestion) => {
    setFormData({ ...formData, institutionName: suggestion.name });
    setFilteredOptions([]);
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      userId: formData.userId,
      teacherId: formData.teacherId,
      institutionName: '',
      degreeType: '',
      degreeName: '',
      startDate: '',
      endDate: '',
      association: '',
      specialization: '',
      score: '',
    });
    setErrors({});
    setMessage(null);
  };

  // Save and add another education entry
  const handleSaveAndAddAnother = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setProgress(10);
    
    const validationErrors = validateEducation(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        const response = await saveEducationDetails(formData);
        setProgress(100);

        if (response.success) {
          setMessage({
            type: "success",
            text: "Education details saved successfully. You can now add another entry.",
          });
          // Reset form for next entry
          setTimeout(() => {
            resetForm();
          }, 1500);
        } else {
          setMessage({
            type: "error",
            text: response.error || "Failed to save education details",
          });
        }
      } catch (error) {
        logger.error("Error saving education details:", error);
        setProgress(0);
        setMessage({
          type: "error",
          text: "An error occurred while saving education details",
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
    
    const validationErrors = validateEducation(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        const response = await saveEducationDetails(formData);
        setProgress(100); // Complete progress

        if (response.success) {
          setMessage({
            type: "success",
            text: "Education details saved successfully",
          });
          setTimeout(() => {
            navigate("/experience");
          }, 2000);
        } else {
          setMessage({
            type: "error",
            text: response.error || "Failed to save education details",
          });
        }
      } catch (error) {
        logger.error("Error saving education details:", error);
        setProgress(0);
        setMessage({
          type: "error",
          text: "An error occurred while saving education details",
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
            <h2 className="text-2xl font-bold text-white">Education Details</h2>
            <p className="mt-1 text-sm text-blue-100">Please fill in your educational background</p>
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
                  <label htmlFor="institutionName" className="block text-sm font-medium text-gray-700 mb-1">
                    Institution Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      list="institutions"
                      id="institutionName"
                      name="institutionName"
                      value={formData.institutionName}
                      onChange={handleChange}
                      className={`block w-full px-4 py-2 rounded-md border ${
                        errors.institutionName 
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                          : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      } shadow-sm sm:text-sm`}
                      placeholder="Search for your institution"
                    />
                    <datalist id="institutions">
                      {/* {worlduniversities.map((uni) => (
                        <option key={`${uni.name}, ${uni.country}`} value={`${uni.name}, ${uni.country}`} />
                      ))} */}
                    </datalist>
                  </div>
                  {errors.institutionName && (
                    <p className="mt-1 text-sm text-red-600">{errors.institutionName}</p>
                  )}
                </div>

                <div className="mb-5">
                  <label htmlFor="degreeType" className="block text-sm font-medium text-gray-700 mb-1">
                    Degree Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="degreeType"
                    name="degreeType"
                    value={formData.degreeType}
                    onChange={handleChange}
                    className={`block w-full px-4 py-2 rounded-md border ${
                      errors.degreeType 
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    } shadow-sm sm:text-sm bg-white`}
                  >
                    <option value="">Select degree type</option>
                    <option value="Secondary">Secondary</option>
                    <option value="Higher Secondary">Higher Secondary</option>
                    <option value="Junior Secondary">Junior Secondary</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Graduation">Graduation</option>
                    <option value="Advanced Diploma">Advanced Diploma</option>
                    <option value="Bachelor">Bachelor</option>
                    <option value="Post Graduation">Post Graduation</option>
                    <option value="Doctorate/PHD">Doctorate/PHD</option>
                    <option value="Certification">Masters</option>
                    <option value="Certification">Certification</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.degreeType && (
                    <p className="mt-1 text-sm text-red-600">{errors.degreeType}</p>
                  )}
                </div>

                <div className="mb-5">
                  <label htmlFor="degreeName" className="block text-sm font-medium text-gray-700 mb-1">
                    Degree Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="degreeName"
                    name="degreeName"
                    value={formData.degreeName}
                    onChange={handleChange}
                    className={`block w-full px-4 py-2 rounded-md border ${
                      errors.degreeName 
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    } shadow-sm sm:text-sm`}
                    placeholder="e.g. Bachelor of Science"
                  />
                  {errors.degreeName && (
                    <p className="mt-1 text-sm text-red-600">{errors.degreeName}</p>
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
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      className={`block w-full px-4 py-2 rounded-md border ${
                        errors.endDate 
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
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
                    Mode of Learning <span className="text-red-500">*</span>
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
                    <option value="">Select mode of learning</option>
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Distance Learning">Distance Learning</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.association && (
                    <p className="mt-1 text-sm text-red-600">{errors.association}</p>
                  )}
                </div>

                <div className="mb-5">
                  <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">
                    Specialization <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="specialization"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    className={`block w-full px-4 py-2 rounded-md border ${
                      errors.specialization 
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    } shadow-sm sm:text-sm`}
                    placeholder="e.g. Computer Science"
                  />
                  {errors.specialization && (
                    <p className="mt-1 text-sm text-red-600">{errors.specialization}</p>
                  )}
                </div>

                <div className="mb-5">
                  <label htmlFor="score" className="block text-sm font-medium text-gray-700 mb-1">
                    GPA/Score <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="score"
                    name="score"
                    min="1"
                    max="4"
                    step="0.1"
                    value={formData.score}
                    onChange={handleChange}
                    className={`block w-full px-4 py-2 rounded-md border ${
                      errors.score 
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    } shadow-sm sm:text-sm`}
                    placeholder="Enter GPA between 1.0 and 4.0 (e.g. 3.8)"
                  />
                  {errors.score && (
                    <p className="mt-1 text-sm text-red-600">{errors.score}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col items-end space-y-4">
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

export default EducationForm;
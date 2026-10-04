import React, { useState, useEffect } from "react";
import PhoneInput from "react-phone-input-2";
import { useNavigate } from "react-router-dom";
import "react-phone-input-2/lib/style.css";
import { FiArrowRight, FiCheck } from 'react-icons/fi';
import { FiUser, FiBriefcase, FiPhone, FiCalendar, FiMapPin, FiMail } from 'react-icons/fi';
import "./ProfileInfoForm.css";
import { saveProfileDetails } from '../../components/services/profileService';
import Validation from '../../components/services/Validation';
import SkeletonProfileInfoForm from '../shared/SkeletonProfileInfoForm';
import ErrorBanner from '../shared/ErrorBanner';
import { useAuthStore } from '../../store/useAuthStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import logger from '../../utils/logger';

const ProfileInfoForm = () => {
  const user = useAuthStore((state) => state.user);
  const userId = user?.userId || null;
  const [formData, setFormData] = useState({
    userId: userId,
    companyName: "",
    role: "",
    displayName: "",
    gender: "",
    birthdate: "",
    location: "",
    postalCode: "",
    phoneNumber: "",
    profileDescription: "",
    imagePath: "",
    isCompany: "individual",
  });

  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const addNotification = useNotificationStore((state) => state.addNotification);

  // Update formData.userId if userId changes
  React.useEffect(() => {
    setFormData((prevData) => ({ ...prevData, userId }));
  }, [userId]);

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
    setErrors(prevErrors => ({ ...prevErrors, [name]: undefined }));
    
    if (name === "birthdate") {
      const formattedDate = value.split("-").map((part, index) => {
        return index === 1 || index === 2 ? part.padStart(2, "0") : part;
      }).join("-");
      setFormData({ ...formData, [name]: formattedDate });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    logger.debug("submit called?....")
    e.preventDefault();
    setIsSubmitting(true);
    setProgress(10);
    logger.debug("progress set....")
    const validationErrors = Validation(formData);
    setErrors(validationErrors);
    logger.debug("all fields okay ", Object.keys(validationErrors).length === 0)
    
    if (Object.keys(validationErrors).length === 0) {
      try {
        logger.debug("called save method")
        const response = await saveProfileDetails(formData);
        logger.debug("response ", response.data)
        setProgress(100); // Complete progress
        if (response.success) {
          setMessage({
            type: "success",
            text: "Profile details saved successfully",
          });
          setTimeout(() => navigate("/education"), 2000);
        } else {
          addNotification({ type: 'error', message: response.error || "Failed to save profile details" });
        }
      } catch (error) {
        setProgress(0);
        addNotification({ type: 'error', message: "An error occurred while saving profile details" });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setProgress(0);
      setIsSubmitting(false);
    }
  };

  if (formData.userId === null && !message) {
    return <SkeletonProfileInfoForm />;
  }

  if (message && message.type === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="w-full max-w-md">
          <ErrorBanner message={message.text} onRetry={() => window.location.reload()} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <h2 className="text-2xl font-bold">Personal Information</h2>
          <p className="opacity-90">Tell us about yourself</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8">
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === "error" 
                ? "bg-red-50 text-red-700" 
                : "bg-green-50 text-green-700"
            }`}>
              {message.text}
            </div>
          )}

          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <label htmlFor="isCompany" className="block text-sm font-medium text-gray-700 mb-1">
                    Joining as
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <select
                      id="isCompany"
                      name="isCompany"
                      value={formData.isCompany}
                      onChange={handleChange}
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="individual">Individual Teacher</option>
                      <option value="company">Company</option>
                    </select>
                  </div>
                </div>

                {formData.isCompany === "company" && (
                  <>
                    <div className="sm:col-span-3">
                      <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                        Company Name
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiBriefcase className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="companyName"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleChange}
                          className={`block w-full pl-10 pr-3 py-2 rounded-md border ${
                            errors.companyName ? 'border-red-300' : 'border-gray-300'
                          } shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                        />
                      </div>
                      {errors.companyName && (
                        <p className="mt-1 text-sm text-red-600" role="alert" aria-live="polite">{errors.companyName}</p>
                      )}
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                        Your Role
                      </label>
                      <input
                        type="text"
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className={`block w-full px-3 py-2 rounded-md border ${
                          errors.role ? 'border-red-300' : 'border-gray-300'
                        } shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      />
                      {errors.role && (
                        <p className="mt-1 text-sm text-red-600">{errors.role}</p>
                      )}
                    </div>
                  </>
                )}

                <div className="sm:col-span-6">
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="displayName"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-2 rounded-md border ${
                        errors.displayName ? 'border-red-300' : 'border-gray-300'
                      } shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                  </div>
                  {errors.displayName && (
                    <p className="mt-1 text-sm text-red-600" role="alert" aria-live="polite">{errors.displayName}</p>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={`block w-full px-3 py-2 rounded-md border ${
                      errors.gender ? 'border-red-300' : 'border-gray-300'
                    } shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.gender && (
                    <p className="mt-1 text-sm text-red-600" role="alert" aria-live="polite">{errors.gender}</p>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700 mb-1">
                    Birthdate
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCalendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="birthdate"
                      name="birthdate"
                      value={formData.birthdate}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-2 rounded-md border ${
                        errors.birthdate ? 'border-red-300' : 'border-gray-300'
                      } shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                  </div>
                  {errors.birthdate && (
                    <p className="mt-1 text-sm text-red-600" role="alert" aria-live="polite">{errors.birthdate}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
              
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="mt-1 relative">
                    <PhoneInput
                      country={'us'}
                      value={formData.phoneNumber}
                      onChange={(phone) => {
                        setErrors(prev => ({ ...prev, phoneNumber: undefined }));
                        setFormData({ ...formData, phoneNumber: phone });
                      }}
                      inputProps={{
                        name: "phoneNumber",
                        id: "phoneNumber",
                        required: true,
                        className: `block w-full pl-12 py-2 rounded-md border ${
                          errors.phoneNumber ? 'border-red-300' : 'border-gray-300'
                        } shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`,
                      }}
                      containerStyle={{
                        width: '100%',
                      }}
                      inputStyle={{
                        width: '100%',
                        height: '38px',
                        paddingLeft: '48px',
                      }}
                      buttonStyle={{
                        height: '38px',
                        border: errors.phoneNumber ? '1px solid #fca5a5' : '1px solid #d1d5db',
                        borderRight: 'none',
                        borderRadius: '0.375rem 0 0 0.375rem',
                        backgroundColor: '#f9fafb',
                      }}
                      dropdownStyle={{
                        borderRadius: '0.375rem',
                        marginTop: '4px',
                        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                      <FiPhone className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  {errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600" role="alert" aria-live="polite">{errors.phoneNumber}</p>
                  )}
                </div>

                <div className="sm:col-span-4">
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-2 rounded-md border ${
                        errors.location ? 'border-red-300' : 'border-gray-300'
                      } shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      placeholder="City, State"
                    />
                  </div>
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-600" role="alert" aria-live="polite">{errors.location}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      className={`block w-full px-3 py-2 rounded-md border ${
                        errors.postalCode ? 'border-red-300' : 'border-gray-300'
                      } shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      placeholder="ZIP/Postal Code"
                    />
                  </div>
                  {errors.postalCode && (
                    <p className="mt-1 text-sm text-red-600" role="alert" aria-live="polite">{errors.postalCode}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Summary</h3>
              <div>
                <label htmlFor="profileDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  About You
                </label>
                <textarea
                  id="profileDescription"
                  name="profileDescription"
                  rows={4}
                  value={formData.profileDescription}
                  onChange={handleChange}
                  className={`block w-full px-3 py-2 rounded-md border ${
                    errors.profileDescription ? 'border-red-300' : 'border-gray-300'
                  } shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="Tell us about your teaching experience, philosophy, and specialties..."
                />
                {errors.profileDescription && (
                  <p className="mt-1 text-sm text-red-600" role="alert" aria-live="polite">{errors.profileDescription}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-end space-y-4">
            {isSubmitting && (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
            
            <button
              type="submit"
              disabled={isSubmitting}
              aria-label="Save and Continue"
              className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
                isSubmitting ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
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
                  <FiArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileInfoForm;
import React, { useState } from 'react';
import { FaTimes, FaUser, FaBirthdayCake, FaMapMarkerAlt, FaPhone, FaIdCard, FaInfoCircle, FaSave, FaSpinner } from 'react-icons/fa';
import { updateStudentProfile } from '../../components/services/studentProfile';
import logger from '../../utils/logger';

const ProfileEditModal = ({ profile, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    fullName: profile.fullName || '',
    gender: profile.gender || '',
    birthdate: profile.birthdate ? 
      new Date(profile.birthdate[0], profile.birthdate[1] - 1, profile.birthdate[2])
      .toISOString().split('T')[0] : '',
    location: profile.location || '',
    postalCode: profile.postalCode || '',
    phoneNumber: profile.phoneNumber || '',
    bio: profile.bio || '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (formData.phoneNumber.trim().length < 10) newErrors.phoneNumber = 'Invalid phone number';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setApiError(null);

    try {
      // Convert birthdate back to array format expected by API
      const updatedProfile = {
        ...formData,
        birthdate: formData.birthdate ? 
          formData.birthdate.split('-').map(Number) : null
      };

      // Call the update API
      const result = await updateStudentProfile(profile.userId, updatedProfile);
      
      if (result.success) {
        onSave(result.data); // Notify parent component of successful update
      } else {
        setApiError(result.error || 'Failed to update profile');
      }
    } catch (error) {
      logger.error('Update error:', error);
      setApiError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="edit-profile-modal-title">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden transform transition-all duration-300 ease-out">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 id="edit-profile-modal-title" className="text-2xl font-bold">Edit Personal Information</h2>
              <p className="text-blue-100 mt-1">Update your profile details</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white hover:bg-opacity-20 rounded-full"
              aria-label="Close modal"
              autoFocus
              disabled={isSubmitting}
            >
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto max-h-[calc(95vh-120px)]">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {apiError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700 font-medium">{apiError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Full Name */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <FaUser className="text-blue-600 text-sm" />
                </div>
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 ${errors.fullName ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-blue-300 focus:border-blue-500'} rounded-xl focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white`}
                placeholder="Enter your full name"
                disabled={isSubmitting}
              />
              {errors.fullName && (
                <p className="text-sm text-red-600 font-medium flex items-center">
                  <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Gender and Birthdate */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <FaUser className="text-purple-600 text-sm" />
                  </div>
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 hover:border-purple-300 focus:border-purple-500 rounded-xl focus:ring-4 focus:ring-purple-100 transition-all duration-200 bg-white"
                  disabled={isSubmitting}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center">
                  <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center mr-3">
                    <FaBirthdayCake className="text-pink-600 text-sm" />
                  </div>
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="birthdate"
                  value={formData.birthdate}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border-2 border-gray-200 hover:border-pink-300 focus:border-pink-500 rounded-xl focus:ring-4 focus:ring-pink-100 transition-all duration-200 bg-white"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Location and Postal Code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <FaMapMarkerAlt className="text-green-600 text-sm" />
                  </div>
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 hover:border-green-300 focus:border-green-500 rounded-xl focus:ring-4 focus:ring-green-100 transition-all duration-200 bg-white"
                  placeholder="City/Region"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                    <FaIdCard className="text-orange-600 text-sm" />
                  </div>
                  Postal Code
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 hover:border-orange-300 focus:border-orange-500 rounded-xl focus:ring-4 focus:ring-orange-100 transition-all duration-200 bg-white"
                  placeholder="Postal code"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 flex items-center">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                  <FaPhone className="text-indigo-600 text-sm" />
                </div>
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 ${errors.phoneNumber ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-indigo-300 focus:border-indigo-500'} rounded-xl focus:ring-4 focus:ring-indigo-100 transition-all duration-200 bg-white`}
                placeholder="Phone number with country code"
                disabled={isSubmitting}
              />
              {errors.phoneNumber && (
                <p className="text-sm text-red-600 font-medium flex items-center">
                  <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                  {errors.phoneNumber}
                </p>
              )}
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 flex items-center">
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center mr-3">
                  <FaInfoCircle className="text-teal-600 text-sm" />
                </div>
                About You
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 border-2 border-gray-200 hover:border-teal-300 focus:border-teal-500 rounded-xl focus:ring-4 focus:ring-teal-100 transition-all duration-200 bg-white resize-none"
                placeholder="Tell us about yourself..."
                disabled={isSubmitting}
              ></textarea>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 rounded-xl font-semibold transition-all duration-200"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    Save Changes
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

export default ProfileEditModal;
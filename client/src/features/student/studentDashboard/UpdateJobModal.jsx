import React, { useState } from 'react';
import {
  FaEdit,
  FaTimes,
  FaCheckCircle,
  FaExclamationCircle,
  FaBriefcase,
  FaBook,
  FaHandshake,
  FaGraduationCap,
  FaMoneyBillWave,
  FaClock,
  FaUsers,
  FaLanguage,
  FaEye,
  FaMapMarkerAlt,
  FaPhone,
  FaFileAlt,
  FaImage,
  FaSave,
} from 'react-icons/fa';

export const UpdateJobModal = ({ job, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    jobCategory: job.jobCategory || "Education & Training",
    subjects: job.subjects || "",
    jobRequirements: job.jobRequirements || "",
    jobType: job.jobType || "Tutoring",
    level: job.level || "High School",
    language: job.language || "English",
    budget: job.budget || "",
    frequency: job.frequency || "Weekly",
    numberOfTutors: job.numberOfTutors || 1,
    jobNature: job.jobNature || "Part-time",
    meetingOptions: job.meetingOptions || "Online",
    location: job.location || "",
    phone: job.phone || "",
    profileImg: job.profileImg || ""
  });

  const [message, setMessage] = useState({ text: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear any existing messages when user starts typing
    if (message.text) {
      setMessage({ text: '', type: '' });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setMessage({ text: '', type: '' });
    
    try {
      await onUpdate(formData);
      setMessage({ text: 'Job requirement updated successfully!', type: 'success' });
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setMessage({ 
        text: error.message || 'Failed to update job requirement. Please try again.', 
        type: 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto border border-gray-100">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-3xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <FaEdit className="text-2xl" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Update Job Requirement</h3>
                <p className="text-blue-100 text-sm">Modify your tutoring request details</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-blue-100 transition-colors p-2 rounded-full hover:bg-white hover:bg-opacity-20"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Message Display */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-xl flex items-center ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.type === 'success' ? (
                <FaCheckCircle className="mr-3 text-lg text-green-600" />
              ) : (
                <FaExclamationCircle className="mr-3 text-lg text-red-600" />
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          )}

          {/* Enhanced Form Grid */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Column 1 */}
            <div className="space-y-6">
              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <FaBriefcase className="mr-2 text-blue-500" />
                  Job Category
                </label>
                <input
                  type="text"
                  name="jobCategory"
                  value={formData.jobCategory}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="e.g. Education & Training"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <FaBook className="mr-2 text-blue-500" />
                  Subjects
                </label>
                <input
                  type="text"
                  name="subjects"
                  value={formData.subjects}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="e.g. Mathematics, Physics"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <FaHandshake className="mr-2 text-blue-500" />
                  Job Type
                </label>
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="Tutoring">Tutoring</option>
                  <option value="One-time">One-time</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>

              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <FaGraduationCap className="mr-2 text-blue-500" />
                  Level
                </label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="Primary School">Primary School</option>
                  <option value="High School">High School</option>
                  <option value="University">University</option>
                  <option value="Professional">Professional</option>
                </select>
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-6">
              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <FaMoneyBillWave className="mr-2 text-blue-500" />
                  Budget ($)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <FaClock className="mr-2 text-blue-500" />
                  Frequency
                </label>
                <select
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="Hourly">Hourly</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Fixed">Fixed</option>
                </select>
              </div>

              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <FaUsers className="mr-2 text-blue-500" />
                  Tutors Needed
                </label>
                <input
                  type="number"
                  name="numberOfTutors"
                  value={formData.numberOfTutors}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  min="1"
                  max="10"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <FaLanguage className="mr-2 text-blue-500" />
                  Language
                </label>
                <input
                  type="text"
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="e.g. English"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <FaEye className="mr-2 text-blue-500" />
                  Meeting Options
                </label>
                <select
                  name="meetingOptions"
                  value={formData.meetingOptions}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="Online">Online</option>
                  <option value="At my place">At my place</option>
                  <option value="Travel to tutor">Travel to tutor</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>
          </div>

                      {/* Full-width fields */}
          <div className="mt-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-blue-500" />
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="e.g. Nairobi"
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <FaPhone className="mr-2 text-blue-500" />
                  Contact Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="e.g. +25411000002"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <FaClock className="mr-2 text-blue-500" />
                Job Nature
              </label>
              <select
                name="jobNature"
                value={formData.jobNature}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="Part-time">Part-time</option>
                <option value="Full-time">Full-time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            <div className="form-group">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <FaFileAlt className="mr-2 text-blue-500" />
                Requirements
              </label>
              <textarea
                name="jobRequirements"
                value={formData.jobRequirements}
                onChange={handleChange}
                rows={6}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                placeholder="Describe your tutoring requirements in detail..."
              />
            </div>

            <div className="form-group">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <FaImage className="mr-2 text-blue-500" />
                Profile Image URL (Optional)
              </label>
              <input
                type="text"
                name="profileImg"
                value={formData.profileImg}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Enter image URL or leave empty"
              />
            </div>
          </div>

          {/* Enhanced Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-8 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </span>
              ) : (
                <span className="flex items-center">
                  <FaSave className="mr-2" />
                  Update Requirement
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


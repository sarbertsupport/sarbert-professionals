import React, { useState, useEffect } from 'react';
import { FaKey, FaTimes, FaCheckCircle, FaExclamationTriangle, FaEye, FaEyeSlash, FaLock, FaShieldAlt } from 'react-icons/fa';
import { changePassword, validatePassword } from '../../components/services/changePassword';

const ChangePasswordModal = ({ onClose, onSave = () => {} })=> {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    form: ''
  });
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Validate individual fields on change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate new password complexity
  useEffect(() => {
    if (formData.newPassword && !errors.newPassword) {
      const validationError = validatePassword(formData.newPassword);
      if (validationError) {
        setErrors(prev => ({ ...prev, newPassword: validationError }));
      }
    }
  }, [formData.newPassword, errors.newPassword]);

  // Validate password match
  useEffect(() => {
    if (formData.confirmPassword && formData.newPassword !== formData.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: "Passwords don't match" }));
    } else if (errors.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: '' }));
    }
  }, [formData.confirmPassword, formData.newPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      form: ''
    });

    // Validate all fields
    let hasErrors = false;
    const newErrors = { ...errors };

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
      hasErrors = true;
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
      hasErrors = true;
    } else {
      const validationError = validatePassword(formData.newPassword);
      if (validationError) {
        newErrors.newPassword = validationError;
        hasErrors = true;
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
      hasErrors = true;
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await changePassword(
        token,
        formData.currentPassword,
        formData.newPassword,
        formData.confirmPassword
      );

      // Check backend response for success
      if (response.headers?.responseCode === 200) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          onSave();
        }, 1500);
      } else {
        throw new Error(response.headers?.customerMessage || 'Password change failed');
      }
    } catch (err) {
      // Handle specific error cases
      const errorMessage = err.message || 'Failed to change password';
      
      if (errorMessage.toLowerCase().includes('old password') || 
          errorMessage.toLowerCase().includes('current password')) {
        setErrors(prev => ({ 
          ...prev, 
          currentPassword: errorMessage,
          form: errorMessage 
        }));
      } else {
        setErrors(prev => ({ ...prev, form: errorMessage }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="change-password-modal-title">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden border border-gray-100">
        {/* Modal Header with Gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <FaShieldAlt className="h-6 w-6" />
              </div>
              <div>
                <h2 id="change-password-modal-title" className="text-xl font-bold">Change Password</h2>
                <p className="text-blue-100 text-sm">Update your account security</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              aria-label="Close modal"
              autoFocus
              disabled={isLoading}
            >
              <FaTimes size={20} />
            </button>
          </div>
        </div>
        
        {success ? (
          <div className="text-center py-12 px-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <FaCheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Password Changed!</h3>
            <p className="text-gray-600">
              Your password has been updated successfully.
            </p>
            <div className="mt-6">
              <div className="w-16 h-1 bg-green-500 rounded-full mx-auto"></div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {errors.form && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <FaExclamationTriangle className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{errors.form}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="currentPassword">
                  <div className="flex items-center space-x-2">
                    <FaLock className="h-4 w-4 text-gray-500" />
                    <span>Current Password</span>
                  </div>
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    id="currentPassword"
                    name="currentPassword"
                    className={`w-full px-4 py-3 text-sm border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12 text-gray-900 transition-all duration-200 ${
                      errors.currentPassword ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    value={formData.currentPassword}
                    onChange={handleChange}
                    disabled={isLoading}
                    placeholder="Enter your current password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => togglePasswordVisibility('current')}
                    tabIndex="-1"
                  >
                    {showPasswords.current ? (
                      <FaEyeSlash className="h-5 w-5" />
                    ) : (
                      <FaEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <FaExclamationTriangle className="h-4 w-4 mr-1" />
                    {errors.currentPassword}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="newPassword">
                  <div className="flex items-center space-x-2">
                    <FaKey className="h-4 w-4 text-gray-500" />
                    <span>New Password</span>
                  </div>
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    id="newPassword"
                    name="newPassword"
                    className={`w-full px-4 py-3 text-sm border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12 text-gray-900 transition-all duration-200 ${
                      errors.newPassword ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    value={formData.newPassword}
                    onChange={handleChange}
                    minLength="8"
                    disabled={isLoading}
                    placeholder="Enter your new password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => togglePasswordVisibility('new')}
                    tabIndex="-1"
                  >
                    {showPasswords.new ? (
                      <FaEyeSlash className="h-5 w-5" />
                    ) : (
                      <FaEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.newPassword ? (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <FaExclamationTriangle className="h-4 w-4 mr-1" />
                    {errors.newPassword}
                  </p>
                ) : (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-700 font-medium mb-1">Password Requirements:</p>
                    <ul className="text-xs text-blue-600 space-y-1">
                      <li>• At least 8 characters long</li>
                      <li>• Include uppercase and lowercase letters</li>
                      <li>• Include at least one special character</li>
                    </ul>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="confirmPassword">
                  <div className="flex items-center space-x-2">
                    <FaShieldAlt className="h-4 w-4 text-gray-500" />
                    <span>Confirm New Password</span>
                  </div>
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    className={`w-full px-4 py-3 text-sm border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12 text-gray-900 transition-all duration-200 ${
                      errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    minLength="8"
                    disabled={isLoading}
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => togglePasswordVisibility('confirm')}
                    tabIndex="-1"
                  >
                    {showPasswords.confirm ? (
                      <FaEyeSlash className="h-5 w-5" />
                    ) : (
                      <FaEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <FaExclamationTriangle className="h-4 w-4 mr-1" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-sm font-medium border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Changing...
                  </>
                ) : (
                  <>
                    <FaKey className="h-4 w-4 mr-2" />
                    Change Password
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChangePasswordModal;
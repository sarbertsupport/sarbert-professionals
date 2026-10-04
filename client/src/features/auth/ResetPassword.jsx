import React, { useState, useEffect } from 'react';
import { FaLock, FaCheck, FaEye, FaEyeSlash, FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNotificationStore } from '../../store/useNotificationStore';

const ResetPassword = () => {
  const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL || "http://localhost:8089";
  const API_BASE_URL = `${BACKEND_BASE_URL}/api/v1/users/reset-password`;
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(null);
  const addNotification = useNotificationStore((state) => state.addNotification);

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      return;
    }

    // You might want to add token validation API call here if needed
    setTokenValid(true);
  }, [token]);

  const validatePassword = (password) => {
    const requirements = [
      { regex: /.{8,}/, text: 'At least 8 characters' },
      { regex: /[0-9]/, text: 'Contains a number' },
      { regex: /[A-Z]/, text: 'Contains uppercase letter' },
      { regex: /[^A-Za-z0-9]/, text: 'Contains special character' }
    ];
    return requirements.map(req => ({
      text: req.text,
      valid: req.regex.test(password)
    }));
  };

  const passwordRequirements = validatePassword(formData.password);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validate form
    const newErrors = {};
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      try {
        const response = await axios.post(`${API_BASE_URL}`, {
          token,
          newPassword: formData.password,
          confirmPassword: formData.confirmPassword
        });
        
        // Handle response based on your API structure
        if (response.data?.headers?.responseCode === 200) {
          toast.success(response.data.headers.customerMessage || 'Password reset successfully');
          setIsSuccess(true);
        } else {
          addNotification({ type: 'error', message: response.data?.headers?.customerMessage || 'Failed to reset password' });
        }
      } catch (error) {
        // Handle different error scenarios
        if (error.response) {
          // The request was made and the server responded with a status code
          const errorData = error.response.data;
          const errorMessage = errorData?.headers?.customerMessage || 
                              errorData?.message || 
                              'Failed to reset password. Please try again.';
          
          addNotification({ type: 'error', message: errorMessage });
          
          // Handle validation errors from backend if they exist in the response
          if (error.response.status === 400 && errorData.body?.errors) {
            setErrors(errorData.body.errors);
          }
        } else if (error.request) {
          // The request was made but no response was received
          addNotification({ type: 'error', message: 'Network error. Please check your connection and try again.' });
        } else {
          // Something happened in setting up the request
          addNotification({ type: 'error', message: 'An unexpected error occurred. Please try again.' });
        }
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(false);
    }
  };

  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden w-full max-w-md">
          <div className="bg-red-500 p-6 text-white text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <FaExclamationTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold">Invalid Reset Link</h2>
            <p className="mt-2">The password reset link is invalid or has expired</p>
          </div>
          <div className="p-6 text-center">
            <Link
              to="/forgot-password"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Request New Reset Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden w-full max-w-md">
          <div className="bg-green-500 p-6 text-white text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <FaCheck className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold">Password Reset Successful!</h2>
            <p className="mt-2">You can now login with your new password</p>
          </div>
          <div className="p-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (tokenValid === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden w-full max-w-md p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800">Verifying reset link...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden w-full max-w-md">
        {/* Header */}
        <div className="bg-indigo-600 p-6 text-white">
          <Link 
            to="/login" 
            className="inline-flex items-center text-sm font-medium text-indigo-100 hover:text-white mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Back to login
          </Link>
          <h2 className="text-2xl font-bold">Reset Your Password</h2>
          <p className="text-indigo-100 mt-1">
            Create a new secure password
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`block w-full pl-10 pr-10 py-3 border ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="Enter new password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                ) : (
                  <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}

            {formData.password && (
              <div className="mt-3 space-y-1">
                <p className="text-xs text-gray-500">Password requirements:</p>
                {passwordRequirements.map((req, index) => (
                  <div key={index} className="flex items-center text-xs">
                    {req.valid ? (
                      <FaCheck className="text-green-500 mr-1" />
                    ) : (
                      <div className="w-3 h-3 rounded-full border border-gray-300 mr-1"></div>
                    )}
                    <span className={req.valid ? 'text-green-600' : 'text-gray-500'}>{req.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Confirm Password Input */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`block w-full pl-10 pr-10 py-3 border ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="Confirm new password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                ) : (
                  <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
              isSubmitting ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Resetting...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
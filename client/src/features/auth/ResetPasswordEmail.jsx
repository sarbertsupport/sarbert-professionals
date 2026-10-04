import React, { useState } from 'react';
import { FaEnvelope, FaPaperPlane, FaArrowLeft } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import logger from '../../utils/logger';

const ResetPasswordEmail = () => {
  const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL || "http://localhost:8089";
  const API_BASE_URL = `${BACKEND_BASE_URL}/api/v1/users/request-password-reset`;
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');
    
    if (!email) {
      setMessageType('error');
      setMessage('Please enter an email address');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}`, { email });
      logger.debug("response", response);
      
      if (response.data?.headers?.responseCode === 200) {
        setMessageType('success');
        setMessage(response.data.headers.customerMessage || 'Password reset link sent to your email');
        setTimeout(() => navigate('/login'), 3000); // Navigate after 3 seconds
      } else {
        setMessageType('error');
        setMessage(response.data?.headers?.customerMessage || 'Failed to send reset link');
      }
    } catch (error) {
      let errorMessage = 'Failed to send reset link. Please try again.';
      
      if (error.response) {
        const errorData = error.response.data;
        errorMessage = errorData?.headers?.customerMessage || 
                     errorData?.message || 
                     errorMessage;
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      setMessageType('error');
      setMessage(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

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
            Enter your email to receive a password reset link
          </p>
        </div>

        {/* Message display */}
        {message && (
          <div className={`p-4 mx-6 mt-4 rounded-md ${
            messageType === 'success' 
              ? 'bg-green-50 text-green-700' 
              : 'bg-red-50 text-red-700'
          }`}>
            <p className="text-sm">{message}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !email}
            className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
              isSubmitting || !email
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : (
              <>
                <FaPaperPlane className="mr-2" />
                Send Reset Link
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 text-center border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Didn't receive an email?{' '}
            <button 
              type="button" 
              className="font-medium text-indigo-600 hover:text-indigo-500"
              onClick={handleSubmit}
              disabled={isSubmitting || !email}
            >
              Resend link
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordEmail;
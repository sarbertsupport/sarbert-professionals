import React, { useState, useEffect } from 'react';
import { registerUser, getLatestTermsAndConditions } from '../../components/services/registerUser';
import { Eye, EyeOff, Check, X, Loader2, User, Mail, Lock, Shield, ArrowRight, Sparkles, GraduationCap, Briefcase } from 'lucide-react';
import logger from '../../utils/logger';

export default function RegistrationForm() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    joinAs: 'Tutor'
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [termsContent, setTermsContent] = useState(null);
  const [isLoadingTerms, setIsLoadingTerms] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isTermsModalOpen) {
        setIsTermsModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTermsModalOpen]);

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!acceptedTerms) {
      newErrors.terms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const res = await registerUser({
        ...formData,
        acceptedTerms: true
      });
      const responseCode = res?.headers?.responseCode;
      const customerMessage = res?.headers?.customerMessage || 'Registration successful!';

      if (responseCode === 200) {
        setMessageType('success');
        setMessage(customerMessage);
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          joinAs: 'Tutor'
        });
        setAcceptedTerms(false);
      } else {
        setMessageType('error');
        setMessage(customerMessage || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setMessageType('error');
      setMessage(err.message || 'Something went wrong. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewTerms = async (e) => {
    e.preventDefault();
    setIsLoadingTerms(true);
    
    try {
      const response = await getLatestTermsAndConditions();
      
      if (response?.body?.data?.content) {
        setTermsContent(response.body.data.content);
        setIsTermsModalOpen(true);
      } else {
        throw new Error('Invalid terms and conditions format');
      }
    } catch (error) {
      logger.error('Error loading terms:', error);
      setMessageType('error');
      setMessage('Failed to load terms and conditions. Please try again.');
      setIsTermsModalOpen(false);
    } finally {
      setIsLoadingTerms(false);
    }
  };

  const passwordRequirements = [
    { id: 1, text: 'At least 8 characters', meets: formData.password.length >= 8 },
    { id: 2, text: 'Contains a number', meets: /\d/.test(formData.password) },
    { id: 3, text: 'Contains a special character', meets: /[!@#$%^&*]/.test(formData.password) }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* SkillBridge Branded Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large SkillBridge text watermark */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-9xl font-bold text-blue-100/20 select-none pointer-events-none">
          SkillBridge
        </div>
        
        {/* Subtle geometric patterns */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-200/10 to-purple-200/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-200/10 to-blue-200/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-gradient-to-br from-purple-200/10 to-pink-200/10 rounded-full blur-2xl"></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.1) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
      </div>

      <div className="relative w-full max-w-md z-10">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Gradient Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Create Account</h2>
                <p className="text-blue-100 text-sm">Join the SkillBridge community</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Status Message */}
            {message && (
              <div className={`rounded-xl p-4 flex items-center ${
                messageType === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {messageType === 'success' ? (
                  <Check className="w-5 h-5 mr-3 text-green-500" />
                ) : (
                  <X className="w-5 h-5 mr-3 text-red-500" />
                )}
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Join As Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Join As</label>
                <div className="flex border-2 border-gray-200 rounded-xl overflow-hidden">
                  {['Tutor', 'Student'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                        formData.joinAs === role
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, joinAs: role }))}
                    >
                      {role === 'Tutor' ? (
                        <Briefcase className="h-4 w-4" />
                      ) : (
                        <GraduationCap className="h-4 w-4" />
                      )}
                      <span>{role}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>Username</span>
                  </div>
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 text-sm border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                    errors.username ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  placeholder="Choose your username"
                />
                {errors.username && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <X className="w-4 h-4 mr-2" />
                    {errors.username}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>Email Address</span>
                  </div>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 text-sm border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                    errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <X className="w-4 h-4 mr-2" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <Lock className="h-4 w-4 text-gray-500" />
                    <span>Password</span>
                  </div>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 pr-12 text-sm border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <X className="w-4 h-4 mr-2" />
                    {errors.password}
                  </p>
                )}

                {/* Password Requirements */}
                {formData.password && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-700 font-medium mb-2">Password Requirements:</p>
                    <div className="space-y-1">
                      {passwordRequirements.map(req => (
                        <div key={req.id} className="flex items-center text-xs">
                          {req.meets ? (
                            <Check className="text-green-500 mr-2 w-3 h-3" />
                          ) : (
                            <X className="text-gray-400 mr-2 w-3 h-3" />
                          )}
                          <span className={req.meets ? 'text-green-600' : 'text-gray-500'}>{req.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-gray-500" />
                    <span>Confirm Password</span>
                  </div>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 pr-12 text-sm border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <X className="w-4 h-4 mr-2" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="space-y-3">
                <div className="flex items-start">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="ml-3">
                    <label htmlFor="terms" className="text-sm text-gray-700">
                      I agree to the{' '}
                      <button
                        type="button"
                        onClick={handleViewTerms}
                        className="text-blue-600 hover:text-blue-500 underline font-medium"
                      >
                        Terms and Conditions
                      </button>
                    </label>
                    {errors.terms && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <X className="w-4 h-4 mr-2" />
                        {errors.terms}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !acceptedTerms}
                className={`w-full py-3 px-6 text-sm font-medium rounded-xl transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : !acceptedTerms
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Create Account
                  </>
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="text-center pt-6 border-t border-gray-100">
              <p className="text-gray-600">
                Already have an account?{' '}
                <a href="/login" className="text-blue-600 hover:text-blue-500 font-semibold underline">
                  Sign in
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Terms and Conditions Modal */}
      {isTermsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsTermsModalOpen(false)}
          />
          
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-white/20">
            <div className="p-8 overflow-y-auto max-h-[80vh]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Shield className="w-6 h-6 mr-3 text-blue-500" />
                  Terms and Conditions
                </h3>
                <button
                  onClick={() => setIsTermsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {isLoadingTerms ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
                </div>
              ) : (
                <div 
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: termsContent }}
                />
              )}
            </div>
            
            <div className="bg-gray-50 px-8 py-6 flex justify-end">
              <button
                type="button"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                onClick={() => setIsTermsModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
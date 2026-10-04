import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { saveBillingInfo } from '../../components/services/coinWallet';
import { FaUser, FaGlobe, FaMapMarkerAlt, FaCity, FaPhone, FaArrowRight, FaTimes, FaReceipt } from 'react-icons/fa';
import logger from '../../utils/logger';

const BillingInfoModal = ({ userId , isOpen, onClose, onContinue, initialData }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    country: '',
    state: '',
    city: '',
    address: '',
    contactNo: '',
  });

  const [loading, setLoading] = useState(false);

  // Pre-fill form if initialData is provided
  useEffect(() => {
    logger.debug('BillingInfoModal: useEffect triggered, isOpen:', isOpen);
    if (isOpen) {
      logger.debug('BillingInfoModal: initialData received:', initialData);
      
      if (initialData) {
        // Handle different data structures
        let billingData;
        if (initialData.body?.data?.body?.data) {
          // Structure: { body: { data: { body: { data: { ... } } } } }
          billingData = initialData.body.data.body.data;
          logger.debug('BillingInfoModal: Using body.data.body.data structure');
        } else if (initialData.body?.data) {
          // Structure: { body: { data: { ... } } }
          billingData = initialData.body.data;
          logger.debug('BillingInfoModal: Using body.data structure');
        } else if (initialData.body) {
          // Structure: { body: { ... } }
          billingData = initialData.body;
          logger.debug('BillingInfoModal: Using body structure');
        } else {
          // Structure: { ... } (direct data)
          billingData = initialData;
          logger.debug('BillingInfoModal: Using direct data structure');
        }
        
        logger.debug('BillingInfoModal: Extracted billing data:', billingData);
        
        const newFormData = {
          fullName: billingData.fullName || '',
          country: billingData.country || '',
          state: billingData.state || '',
          city: billingData.city || '',
          address: billingData.address || '',
          contactNo: billingData.contactNo || ''
        };
        
        logger.debug('BillingInfoModal: Setting form data:', newFormData);
        setFormData(newFormData);
        
        // Debug: Check if form data was actually set
        setTimeout(() => {
          logger.debug('BillingInfoModal: Current form data after setState:', formData);
        }, 100);
      } else {
        logger.debug('BillingInfoModal: No initial data provided');
        setFormData({
          fullName: '',
          country: '',
          state: '',
          city: '',
          address: '',
          contactNo: ''
        });
      }
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    // Basic validation
    if (!formData.fullName || !formData.country || !formData.city || !formData.address || !formData.contactNo) {
      toast.error('Please fill in all required fields');
      setLoading(false);
      return;
    }

    // Check if userId is available
    if (!userId) {
      toast.error('User ID not available. Please try refreshing the page.');
      setLoading(false);
      return;
    }
  
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication required');
      }
  
      logger.debug('BillingInfoModal: Saving billing info for userId:', userId);
      // Use the existing service function
      await saveBillingInfo(userId, formData, token);
      
      // Continue to payment
      if (onContinue && typeof onContinue === 'function') {
        onContinue(formData);
      } else {
        logger.warn('BillingInfoModal: onContinue function not provided');
        onClose();
      }
    } catch (err) {
      logger.error('BillingInfoModal: Error saving billing info:', err);
      toast.error(err.message || 'Failed to save billing information');
    } finally {
      setLoading(false);
    }
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header with Gradient */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <FaReceipt className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Billing Information</h2>
                <p className="text-blue-100 text-sm">Enter your billing details for payment</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              aria-label="Close modal"
              autoFocus
              disabled={loading}
            >
              <FaTimes size={20} />
            </button>
          </div>
        </div>
        {/* Info Box */}
        <div className="bg-blue-50 border-b border-blue-100 px-6 py-3 text-blue-700 text-sm flex items-center gap-2">
          <FaReceipt className="h-4 w-4 text-blue-400" />
          Please ensure your billing details are accurate for a smooth payment process.
        </div>
        {/* Scrollable Content Area */}
        <div className="overflow-y-auto flex-1 p-6">
          {logger.debug('BillingInfoModal: Rendering form with formData:', formData)}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2" htmlFor="fullName">
                <FaUser className="text-gray-500" />
                Full Name <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                id="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 border-gray-200 hover:border-gray-300 transition-all duration-200"
                required
                placeholder="Enter your full name"
                onFocus={() => logger.debug('BillingInfoModal: Full name field focused, value:', formData.fullName)}
              />
            </div>
            {/* Country */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2" htmlFor="country">
                <FaGlobe className="text-gray-500" />
                Country <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                name="country"
                id="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 border-gray-200 hover:border-gray-300 transition-all duration-200"
                required
                placeholder="Country of residence"
              />
            </div>
            {/* State/Region */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2" htmlFor="state">
                <FaMapMarkerAlt className="text-gray-500" />
                State/Region
              </label>
              <input
                type="text"
                name="state"
                id="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 border-gray-200 hover:border-gray-300 transition-all duration-200"
                placeholder="State or region (optional)"
              />
            </div>
            {/* City */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2" htmlFor="city">
                <FaCity className="text-gray-500" />
                City <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                name="city"
                id="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 border-gray-200 hover:border-gray-300 transition-all duration-200"
                required
                placeholder="City"
              />
            </div>
            {/* Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="address">
                Street Address <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                name="address"
                id="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 border-gray-200 hover:border-gray-300 transition-all duration-200"
                required
                placeholder="Street address, building, etc."
              />
            </div>
            {/* Contact Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2" htmlFor="contactNo">
                <FaPhone className="text-gray-500" />
                Phone Number <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="tel"
                name="contactNo"
                id="contactNo"
                value={formData.contactNo}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 border-gray-200 hover:border-gray-300 transition-all duration-200"
                required
                placeholder="e.g. +1234567890"
              />
            </div>
            {/* Action Buttons */}
            <div className="flex justify-between space-x-4 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`flex-1 px-6 py-3 rounded-xl font-medium text-white transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                  loading ? 'bg-indigo-400' : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700'
                }`}
                disabled={loading}
              >
                {loading ? 'Saving...' : (
                  <>
                    Continue to Payment
                    <FaArrowRight className="ml-2" />
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

export default BillingInfoModal;
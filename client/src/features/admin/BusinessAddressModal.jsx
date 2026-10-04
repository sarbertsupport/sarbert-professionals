import React, { useState, useEffect } from 'react';
import { X, Building2 } from 'lucide-react';
import { businessAddressService } from '../../components/services/businessAddressService';
import { toast } from 'react-toastify';
import { BusinessAddressModalFormSections } from './BusinessAddressModalFormSections';
import logger from '../../utils/logger';

const BusinessAddressModal = ({ isOpen, onClose, onSuccess, editingAddress }) => {
  const [formData, setFormData] = useState({
    businessName: '',
    businessDescription: '',
    contactPerson: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    physicalLocation: '',
    website: '',
    taxId: '',
    registrationNumber: '',
    isDefault: false,
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingAddress) {
      setFormData({
        businessName: editingAddress.businessName || '',
        businessDescription: editingAddress.businessDescription || '',
        contactPerson: editingAddress.contactPerson || '',
        email: editingAddress.email || '',
        phone: editingAddress.phone || '',
        addressLine1: editingAddress.addressLine1 || '',
        addressLine2: editingAddress.addressLine2 || '',
        city: editingAddress.city || '',
        state: editingAddress.state || '',
        postalCode: editingAddress.postalCode || '',
        country: editingAddress.country || '',
        physicalLocation: editingAddress.physicalLocation || '',
        website: editingAddress.website || '',
        taxId: editingAddress.taxId || '',
        registrationNumber: editingAddress.registrationNumber || '',
        isDefault: editingAddress.isDefault || false,
        isActive: editingAddress.isActive !== undefined ? editingAddress.isActive : true
      });
    } else {
      setFormData({
        businessName: '',
        businessDescription: '',
        contactPerson: '',
        email: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        physicalLocation: '',
        website: '',
        taxId: '',
        registrationNumber: '',
        isDefault: false,
        isActive: true
      });
    }
    setErrors({});
  }, [editingAddress, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    // Business Name - Required
    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    } else if (formData.businessName.trim().length < 2) {
      newErrors.businessName = 'Business name must be at least 2 characters';
    }

    // Contact Person - Optional but if provided, must be valid
    if (formData.contactPerson && formData.contactPerson.trim().length < 2) {
      newErrors.contactPerson = 'Contact person name must be at least 2 characters';
    }

    // Email - Optional but if provided, must be valid
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone - Optional but if provided, must be valid
    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Website - Optional but if provided, must be valid
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Please enter a valid website URL (include http:// or https://)';
    }

    // Address Line 1 - Optional but if provided, must be valid
    if (formData.addressLine1 && formData.addressLine1.trim().length < 5) {
      newErrors.addressLine1 = 'Street address must be at least 5 characters';
    }

    // City - Optional but if provided, must be valid
    if (formData.city && formData.city.trim().length < 2) {
      newErrors.city = 'City name must be at least 2 characters';
    }

    // State - Optional but if provided, must be valid
    if (formData.state && formData.state.trim().length < 2) {
      newErrors.state = 'State/Province name must be at least 2 characters';
    }

    // Postal Code - Optional but if provided, must be valid
    if (formData.postalCode && formData.postalCode.trim().length < 3) {
      newErrors.postalCode = 'Postal code must be at least 3 characters';
    }

    // Country - Optional but if provided, must be valid
    if (formData.country && formData.country.trim().length < 2) {
      newErrors.country = 'Country name must be at least 2 characters';
    }

    // Tax ID - Optional but if provided, must be valid
    if (formData.taxId && formData.taxId.trim().length < 3) {
      newErrors.taxId = 'Tax ID must be at least 3 characters';
    }

    // Registration Number - Optional but if provided, must be valid
    if (formData.registrationNumber && formData.registrationNumber.trim().length < 3) {
      newErrors.registrationNumber = 'Registration number must be at least 3 characters';
    }

    logger.debug('Validation errors:', newErrors); // Debug log
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    logger.debug('Form submitted, validating...'); // Debug log
    const isValid = validateForm();
    logger.debug('Form is valid:', isValid); // Debug log
    logger.debug('Current errors:', errors); // Debug log
    
    if (!isValid) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    try {
      setLoading(true);
      let response;
      
      if (editingAddress) {
        response = await businessAddressService.updateBusinessAddress(editingAddress.id, formData);
      } else {
        response = await businessAddressService.createBusinessAddress(formData);
      }

      if (response) {
        toast.success(editingAddress ? 'Business address updated successfully' : 'Business address created successfully');
        onSuccess();
        onClose();
      } else {
        toast.error(response.message || 'Operation failed');
      }
    } catch (error) {
      logger.error('Error saving business address:', error);
      toast.error('Failed to save business address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg mr-3">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {editingAddress ? 'Edit Business Address' : 'Add Business Address'}
              </h2>
              <p className="text-gray-600 text-sm">
                {editingAddress ? 'Update company information' : 'Add new company information for invoices and billing'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto max-h-[calc(90vh-100px)]">
          <BusinessAddressModalFormSections formData={formData} errors={errors} handleInputChange={handleInputChange} />

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              )}
              {editingAddress ? 'Update Address' : 'Create Address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BusinessAddressModal; 
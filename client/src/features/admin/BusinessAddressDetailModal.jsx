import React from 'react';
import { 
  X, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  FileText, 
  Calendar,
  Star,
  Edit,
  Trash2,
  CheckCircle,
  XCircle
} from 'lucide-react';

const BusinessAddressDetailModal = ({ 
  isOpen, 
  onClose, 
  address, 
  onEdit, 
  onDelete, 
  onSetDefault 
}) => {
  if (!isOpen || !address) return null;

  const formatDate = (dateArray) => {
    if (!dateArray || !Array.isArray(dateArray)) return 'N/A';
    
    // Your backend returns: [2025, 9, 5, 16, 56, 44, 476568000]
    // Convert to Date object: new Date(year, month-1, day, hour, minute, second)
    const [year, month, day, hour, minute, second] = dateArray;
    const date = new Date(year, month - 1, day, hour, minute, second);
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center">
            <div className="p-3 bg-blue-50 rounded-lg mr-4">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{address.businessName}</h2>
              <div className="flex items-center mt-1">
                {address.isDefault && (
                  <div className="flex items-center mr-4">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="text-sm text-yellow-600 font-medium">Default Address</span>
                  </div>
                )}
                <div className={`flex items-center ${address.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                  {address.isActive ? (
                    <CheckCircle className="w-4 h-4 mr-1" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-1" />
                  )}
                  <span className="text-sm font-medium">
                    {address.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(address)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                  Basic Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{address.businessName}</p>
                  </div>
                  {address.businessDescription && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{address.businessDescription}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-green-600" />
                  Contact Information
                </h3>
                <div className="space-y-4">
                  {address.contactPerson && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{address.contactPerson}</p>
                    </div>
                  )}
                  {address.email && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{address.email}</p>
                    </div>
                  )}
                  {address.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{address.phone}</p>
                    </div>
                  )}
                  {address.website && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                        <a href={address.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {address.website}
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Address Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-orange-600" />
                  Address Information
                </h3>
                <div className="space-y-4">
                  {address.addressLine1 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{address.addressLine1}</p>
                    </div>
                  )}
                  {address.addressLine2 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{address.addressLine2}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    {address.city && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{address.city}</p>
                      </div>
                    )}
                    {address.state && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
                        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{address.state}</p>
                      </div>
                    )}
                    {address.postalCode && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{address.postalCode}</p>
                      </div>
                    )}
                    {address.country && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{address.country}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Legal Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-purple-600" />
                  Legal Information
                </h3>
                <div className="space-y-4">
                  {address.taxId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{address.taxId}</p>
                    </div>
                  )}
                  {address.registrationNumber && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{address.registrationNumber}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Metadata */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-gray-600" />
                  Metadata
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Created Date</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                      {formatDate(address.createdAt)}
                    </p>
                  </div>
                  {address.updatedAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                        {formatDate(address.updatedAt)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-4">
            {!address.isDefault && (
              <button
                onClick={() => onSetDefault(address.id)}
                className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
              >
                <Star className="w-4 h-4 mr-2" />
                Set as Default
              </button>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onEdit(address)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              Edit Address
            </button>
            <button
              onClick={() => onDelete(address.id)}
              className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors"
            >
              Delete Address
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessAddressDetailModal; 
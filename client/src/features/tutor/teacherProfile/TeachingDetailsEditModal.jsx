import React, { useState } from 'react';

export const TeachingDetailsEditModal = ({ details, onClose, onSave, saveLoading }) => {
  const [formData, setFormData] = useState(details);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white/20">
        {/* Modern Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-3xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Edit Professional Details</h2>
                <p className="text-purple-100 text-sm">Update your professional service preferences</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/10">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-8">
          <div className="space-y-6">
            {/* Online Professional */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                </svg>
                Available for online professional services?
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="onlineProfessional"
                  checked={formData.onlineProfessional}
                  onChange={handleChange}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                />
                <label className="ml-3 text-sm font-medium text-gray-700">Online Professional Services</label>
              </div>
            </div>

            {/* Travel Willingness */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Willing to travel for professional services?
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="travelWillingness"
                  checked={formData.travelWillingness}
                  onChange={handleChange}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                />
                <label className="ml-3 text-sm font-medium text-gray-700">Travel for Professional Services</label>
              </div>
            </div>

            {/* Currently Employed */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.815-8.927-2.2M21 13.255L18.5 15.5m0 0l-3-3m3 3l3-3M3 13.255A23.931 23.931 0 0012 15c3.183 0 6.22-.815 8.927-2.2M3 13.255L5.5 15.5m0 0l3-3m-3 3l-3-3" />
                </svg>
                Currently employed as professional?
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="currentlyEmployed"
                  checked={formData.currentlyEmployed}
                  onChange={handleChange}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                />
                <label className="ml-3 text-sm font-medium text-gray-700">Currently Employed as Professional</label>
              </div>
            </div>

            {/* Digital Pen */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Digital Pen Available
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="digitalPen"
                  checked={formData.digitalPen}
                  onChange={handleChange}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                />
                <label className="ml-3 text-sm font-medium text-gray-700">Digital Pen Available</label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-end space-x-4">
            <button onClick={onClose} className="px-6 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105">
              Cancel
            </button>
            <button onClick={() => onSave(formData)} disabled={saveLoading} className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 ${saveLoading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl'}`}>
              {saveLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </div>
              ) : (
                'Save Professional Details'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

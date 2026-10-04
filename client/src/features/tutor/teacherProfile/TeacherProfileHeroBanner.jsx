import { Fragment } from 'react';

export function TeacherProfileHeroBanner({ userProfile, openProfileModal }) {
  return (
    <Fragment>
               {/* Modern Profile Header with Gradient Banner */}
<div className="mb-10 relative overflow-hidden">
  {/* Gradient Background */}
  <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 opacity-90"></div>
  
  {/* Glassmorphic Overlay */}
  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
  
  {/* Content */}
  <div className="relative z-10 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20">
    <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
      {/* Enhanced Profile Image */}
      <div className="flex-shrink-0 relative">
        <div className="w-40 h-40 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full overflow-hidden flex items-center justify-center shadow-2xl border-4 border-white/50 relative">
          {userProfile.imagePath ? (
            <img
              src={userProfile.imagePath}
              alt="Profile"
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="text-6xl text-indigo-400 font-bold">
              {userProfile.displayName?.charAt(0) || '?'}
            </div>
          )}
          {/* Status Badge */}
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-400 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
        </div>
      </div>
      
      {/* Profile Details */}
      <div className="flex-1 text-center lg:text-left">
        <div className="mb-6">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {userProfile.displayName}
          </h1>
          
          {/* Professional Title with Badge */}
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-sm font-semibold shadow-lg">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Professional
            </div>
          </div>
          
          {/* Contact Information with Enhanced Icons */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-6 mb-6">
            {userProfile.location && (
              <div className="flex items-center text-gray-600 bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
                <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-medium">{userProfile.location}</span>
              </div>
            )}
            {userProfile.phoneNumber && (
              <div className="flex items-center text-gray-600 bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
                <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="font-medium">{userProfile.phoneNumber}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Enhanced Personal Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800">Personal Details</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Gender</span>
                <span className="text-sm font-semibold text-gray-800">
                  {userProfile.gender ? (
                    <span className="capitalize bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs">{userProfile.gender}</span>
                  ) : (
                    <span className="text-gray-400">Not specified</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Birthdate</span>
                <span className="text-sm font-semibold text-gray-800">
                  {userProfile.birthdate ? (
                    new Date(userProfile.birthdate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  ) : (
                    <span className="text-gray-400">Not specified</span>
                  )}
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800">Address</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Postal Code</span>
                <span className="text-sm font-semibold text-gray-800">
                  {userProfile.postalCode || <span className="text-gray-400">Not specified</span>}
                </span>
              </div>
              {userProfile.companyName && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Company</span>
                  <span className="text-sm font-semibold text-gray-800">{userProfile.companyName}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Edit Button */}
      <div className="flex-shrink-0">
        <button 
          onClick={openProfileModal}
          className="group bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          aria-label="Edit profile"
        >
          <svg className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</div>
    </Fragment>
  );
}

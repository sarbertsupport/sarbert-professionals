import React from 'react';

const SkeletonProfileCard = () => (
  <div className="max-w-4xl mx-auto animate-pulse" aria-busy="true" aria-label="Loading profile...">
    <div className="flex flex-col md:flex-row md:items-center md:space-x-8 mb-8">
      <div className="h-40 w-40 rounded-full bg-gray-200 mb-6 md:mb-0"></div>
      <div className="flex-1">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="flex gap-2 mb-2">
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
          <div className="h-4 w-16 bg-gray-200 rounded"></div>
        </div>
        <div className="h-8 w-32 bg-gray-200 rounded"></div>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-gray-100 p-5 rounded-xl h-32"></div>
      <div className="bg-gray-100 p-5 rounded-xl h-32"></div>
    </div>
  </div>
);

export default SkeletonProfileCard; 
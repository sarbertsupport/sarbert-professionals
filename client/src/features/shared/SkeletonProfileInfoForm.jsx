import React from 'react';

const SkeletonProfileInfoForm = () => (
  <div className="max-w-2xl mx-auto animate-pulse" aria-busy="true" aria-label="Loading profile info form...">
    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
    {[...Array(8)].map((_, idx) => (
      <div key={idx} className="h-4 bg-gray-200 rounded w-full mb-6"></div>
    ))}
    <div className="h-10 w-40 bg-gray-200 rounded mt-8"></div>
  </div>
);

export default SkeletonProfileInfoForm; 
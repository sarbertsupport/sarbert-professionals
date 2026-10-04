import React from 'react';
import { FaCheck, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

export const formatProfileDate = (dateString) => {
  if (!dateString) return 'Present';
  const options = { year: 'numeric', month: 'short' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export const FormattedJobDescription = ({ description }) => {
  if (!description) return null;

  const points = description.split('\n').filter(point => point.trim() !== '');
  return (
    <ul className="mt-3 space-y-2">
      {points.map((point, index) => (
        <li key={index} className="flex items-start">
          <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
          <span className="text-gray-700">{point.trim()}</span>
        </li>
      ))}
    </ul>
  );
};

export const SubjectsChips = ({ subjects }) => {
  if (!subjects || subjects.length === 0) {
    return <p className="text-gray-500 italic">No subjects information provided.</p>;
  }

  return (
    <div className="flex flex-wrap gap-3">
      {subjects.map((subject, index) => (
        <span
          key={index}
          className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 rounded-xl text-sm font-semibold shadow-sm border border-blue-200 hover:shadow-md transition-all duration-200"
        >
          {subject.subjectName}
        </span>
      ))}
    </div>
  );
};

export const AvailabilityBadge = ({ isAvailable }) => {
  return isAvailable ? (
    <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
      <FaCheckCircle className="mr-1" />
      Available
    </span>
  ) : (
    <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
      <FaTimesCircle className="mr-1" />
      Not Available
    </span>
  );
};

// StudentDashboard.js
import React, { useState } from 'react';
import Menus from './Menus'; // Import the Menus component
import Footer from '../shared/Footer'; // Import the Footer component
import { FaMapMarkerAlt } from 'react-icons/fa';

const StudentDashboard = () => {
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const itemsPerPage = 3; // Items per page
  
  // Simulated requirement data
  const requirements = [
    {
      id: 1,
      title: 'Online JAVA, JAVA basics, Java Developer tutor required in Embakasi',
      description: 'I am looking for a java developer to teach me Java basics online at the rate of 9$/h',
      rate: 'KSh 1,000/hour (7.75 USD)',
      location: 'Kenya Pipeline Estate, Nairobi, Kenya',
    },
    {
        id: 1,
        title: 'Online JAVA, JAVA basics, Java Developer tutor required in Embakasi',
        description: 'I am looking for a java developer to teach me Java basics online at the rate of 9$/h',
        rate: 'KSh 1,000/hour (7.75 USD)',
        location: 'Kenya Pipeline Estate, Nairobi, Kenya',
      },
      {
        id: 1,
        title: 'Online JAVA, JAVA basics, Java Developer tutor required in Embakasi',
        description: 'I am looking for a java developer to teach me Java basics online at the rate of 9$/h',
        rate: 'KSh 1,000/hour (7.75 USD)',
        location: 'Kenya Pipeline Estate, Nairobi, Kenya',
      },
      {
        id: 1,
        title: 'Online JAVA, JAVA basics, Java Developer tutor required in Embakasi',
        description: 'I am looking for a java developer to teach me Java basics online at the rate of 9$/h',
        rate: 'KSh 1,000/hour (7.75 USD)',
        location: 'Kenya Pipeline Estate, Nairobi, Kenya',
      }
    // Other requirement objects...
  ];

  // Pagination Logic
  const totalPages = Math.ceil(requirements.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRequirements = requirements.slice(startIndex, startIndex + itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* Navigation Menu */}
      <Menus />

      {/* Main Content */}
      <div className="flex-grow p-8">
        <header className="flex justify-between items-center mb-6">
          <div className="text-2xl font-semibold text-gray-400" style={{ marginLeft: '20%', marginRight: '10%' }}>My Requirements</div>
          <button className="bg-blue-500 text-white py-2 px-4 rounded">Post Your Study Needs</button>
        </header>

        <div className="space-y-8">
          {/* Paginated Requirements */}
          {paginatedRequirements.map((requirement) => (
            <div key={requirement.id} className="bg-white shadow-md rounded p-6" style={{ marginLeft: '20%', marginRight: '10%' }}>
              <div className="text-blue-400 text-lg font-semibold">
                {requirement.title}
              </div>
              <p className="text-gray-400 mt-2">
                {requirement.description}
              </p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-gray-400 font-medium">{requirement.rate}</span>
                <span className="text-gray-400 flex items-center">
                  <FaMapMarkerAlt className="mr-2" /> {requirement.location}
                </span>
              </div>
              <div className="mt-4 flex space-x-4">
                <button className="bg-blue-400 text-white py-2 px-4 rounded">View Messages</button>
                <button className="bg-red-400 text-white py-2 px-4 rounded">Close</button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center mt-8">
          <button
            className="bg-gray-300 text-gray-700 py-2 px-4 rounded-l disabled:bg-gray-200 disabled:cursor-not-allowed"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="bg-gray-200 text-gray-700 py-2 px-4">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="bg-gray-300 text-gray-700 py-2 px-4 rounded-r disabled:bg-gray-200 disabled:cursor-not-allowed"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default StudentDashboard;

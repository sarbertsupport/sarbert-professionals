import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa'; // Import the search icon

const SearchForm = () => {
  // State to store input values
  const [subject, setSubject] = useState('');
  const [location, setLocation] = useState('');

  // Handle subject input change
  const handleSubjectChange = (e) => {
    setSubject(e.target.value);
  };

  // Handle location input change
  const handleLocationChange = (e) => {
    setLocation(e.target.value);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Perform search with subject and location values
    console.log('Subject:', subject);
    console.log('Location:', location);
  };

  return (
    <div className="max-w-screen-lg mx-auto p-4 md:py-8 md:px-4"> {/* Add padding for all sides */}
      <div className="bg-gray-100 rounded-lg shadow-md p-6"> {/* Change background to gray */}
        <p className="text-xl font-semibold text-center mb-6">Find Online and Home teachers here</p> {/* Increased font size */}
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row md:space-x-4">
          <input
            type="text"
            placeholder="Enter subject"
            value={subject}
            onChange={handleSubjectChange}
            className="border border-gray-300 rounded-md px-4 py-3 text-lg focus:outline-none focus:border-blue-500 mb-4 md:mb-0 md:flex-1" // Increased font size
          />
          <input
            type="text"
            placeholder="Enter location"
            value={location}
            onChange={handleLocationChange}
            className="border border-gray-300 rounded-md px-4 py-3 text-lg focus:outline-none focus:border-blue-500 mb-4 md:mb-0 md:flex-1" // Increased font size
          />
          <button type="submit" className="bg-blue-500 text-white flex items-center justify-center px-6 py-3 rounded-md hover:bg-blue-600 focus:outline-none w-full md:w-auto">
            <FaSearch className="h-5 w-5 mr-2" /> {/* Add search icon */}
            <span className="text-xl">Search</span> {/* Increased font size */}
          </button>
        </form>
        <div className="mt-6"></div> {/* Add margin between form and bottom of the card */}
      </div>
    </div>
  );
};

export default SearchForm;

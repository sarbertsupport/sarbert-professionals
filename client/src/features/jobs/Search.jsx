import React, { useState } from 'react';
import { FaSearch, FaBriefcase } from 'react-icons/fa';

const SearchForm = ({ setKeyword }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setKeyword(searchTerm);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mb-10">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
        <div className="flex items-center justify-center space-x-3 mb-2">
          <FaBriefcase className="text-2xl" />
          <h2 className="text-2xl md:text-3xl font-bold text-center">
            Discover Your Next Opportunity
          </h2>
        </div>
        <p className="text-center text-blue-100">
          Search through thousands of teaching positions worldwide
        </p>
      </div>

      <div className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-0 md:flex md:space-x-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Enter skills, subjects, or keywords (e.g. Java, Calculus, Graphic Design)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-4 py-4 border border-gray-300 rounded-xl shadow-sm text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="w-full md:w-auto flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl shadow-sm text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
          >
            <FaSearch className="mr-3" />
            Find Jobs
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          <span className="text-sm text-gray-500">Popular searches:</span>
          <button 
            type="button"
            onClick={() => setSearchTerm('Mathematics')}
            className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
          >
            Mathematics
          </button>
          <span className="text-gray-400">•</span>
          <button 
            type="button"
            onClick={() => setSearchTerm('Computer Science')}
            className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
          >
            Computer Science
          </button>
          <span className="text-gray-400">•</span>
          <button 
            type="button"
            onClick={() => setSearchTerm('English')}
            className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
          >
            English
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchForm;
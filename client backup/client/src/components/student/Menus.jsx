// Menus.js
import React, { useState } from 'react';
import { FaEnvelope, FaCog, FaSignOutAlt, FaUserCircle, FaMapMarkerAlt } from 'react-icons/fa';

const Menus = () => {
  const [isTutorsDropdownOpen, setTutorsDropdownOpen] = useState(false);
  const [isWalletDropdownOpen, setWalletDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setProfileDropdownOpen] = useState(false);
  
  // Simulated message count
  const messageCount = 5;

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      <div className="flex items-center space-x-8">
        <div className="text-2xl font-bold text-pink-500">teacherOn</div>
        <div className="relative space-x-4">
          <a href="#" className="text-gray-700 hover:text-blue-500">My Posts</a>

          {/* Find Tutors Dropdown */}
          <div className="inline-block relative">
            <button
              className="text-gray-700 hover:text-blue-500 focus:outline-none"
              onClick={() => setTutorsDropdownOpen(!isTutorsDropdownOpen)}
            >
              Find Tutors
            </button>
            {isTutorsDropdownOpen && (
              <div className="absolute mt-2 w-48 bg-white shadow-lg rounded">
                <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Find All</a>
                <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Home tutors</a>
                <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Online tutors</a>
              </div>
            )}
          </div>

          {/* Wallet Dropdown */}
          <div className="inline-block relative">
            <button
              className="text-gray-700 hover:text-blue-500 focus:outline-none"
              onClick={() => setWalletDropdownOpen(!isWalletDropdownOpen)}
            >
              Wallet
            </button>
            {isWalletDropdownOpen && (
              <div className="absolute mt-2 w-48 bg-white shadow-lg rounded">
                <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Coin Balance</a>
                <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Buy coins</a>
              </div>
            )}
          </div>

          <a href="#" className="text-gray-700 hover:text-blue-500">Reviews</a>
        </div>
      </div>

      {/* Right-Side Menu */}
      <div className="flex items-center space-x-8">
        {/* Messages with icon and count */}
        <div className="relative">
          <a href="#" className="text-gray-700 hover:text-blue-500 flex items-center">
            <FaEnvelope className="text-xl mr-1" />
            {messageCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1">
                {messageCount}
              </span>
            )}
            Messages
          </a>
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            className="text-gray-700 hover:text-blue-500 flex items-center focus:outline-none"
            onClick={() => setProfileDropdownOpen(!isProfileDropdownOpen)}
          >
            <FaUserCircle className="text-xl mr-2" />
            Sarah Mutuku
          </button>
          {isProfileDropdownOpen && (
            <div className="absolute mt-2 w-48 bg-white shadow-lg rounded right-0">
              <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center">
                <FaCog className="mr-2" /> Settings
              </a>
              <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center">
                <FaSignOutAlt className="mr-2" /> Logout
              </a>
            </div>
          )}
        </div>
      </div>

      <button className="bg-green-500 text-white py-2 px-4 rounded">Post Requirement</button>
    </nav>
  );
};

export default Menus;

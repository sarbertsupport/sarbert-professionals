import React, { useState, useEffect } from 'react';
import { FaStar, FaStarHalfAlt, FaEnvelope, FaPhone, FaMapMarkerAlt, FaThumbsUp, FaFemale, FaMale } from 'react-icons/fa';
import { FiBook, FiAward, FiDollarSign, FiCreditCard, FiMessageSquare, FiHome, FiCheckCircle, FiMapPin, FiMonitor } from 'react-icons/fi'; 
import Footer from '../../features/shared/Footer';
import logger from '../../utils/logger';

const TutorProfile = ({ teacherId }) => {
  const [tutorData, setTutorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL || "http://localhost:8089";

  useEffect(() => {
    const fetchTutorData = async () => {
      try {
        const response = await fetch(`${BACKEND_BASE_URL}/api/v1/teachers/profile/details/4`);
        const data = await response.json();
        
        if (data && data.body && data.body.data) {
          setTutorData(data.body.data);
        } else {
          setError('Invalid data format received from server');
        }
      } catch (error) {
        logger.error('Error fetching tutor data:', error);
        setError('Failed to load tutor profile');
      } finally {
        setLoading(false);
      }
    };

    fetchTutorData();
  }, [teacherId]);

  const renderStars = (rating) => {
    if (!rating) return null;
    
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} className="text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key={fullStars} className="text-yellow-400" />);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaStar key={i + fullStars + 1} className="text-gray-300" />);
    }

    return stars;
  };

  const renderSubjects = () => {
    if (!tutorData?.subjects) return <p className="text-gray-500">No subjects listed</p>;
    
    return (
      <div className="flex flex-wrap gap-2">
        {tutorData.subjects.split(',').map((subject, index) => (
          <span 
            key={index} 
            className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium"
          >
            {subject.trim()}
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-12 text-red-600">{error}</div>;
  }

  if (!tutorData) {
    return <div className="text-center py-12 text-gray-600">No tutor data available</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Profile Section */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="md:flex">
              {/* Tutor Image */}
              <div className="md:w-1/3 p-6 flex justify-center">
                <div className="relative">
                  {tutorData.image ? (
                    <img 
                      src={tutorData.image} 
                      alt={`Profile image of ${tutorData.fullName || 'Tutor'}`}
                      className="w-48 h-48 rounded-full object-cover border-4 border-white shadow-lg"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-48 h-48 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-xl">No Image</span>
                    </div>
                  )}
                  <div className="absolute -bottom-4 left-0 right-0 flex justify-center">
                    <div className="bg-blue-600 text-white px-4 py-1 rounded-full shadow-md flex items-center">
                      {renderStars(tutorData.rating)}
                      <span className="ml-2 font-medium">{tutorData.rating?.toFixed(1) || '0.0'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tutor Info */}
              <div className="md:w-2/3 p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{tutorData.fullName || 'Tutor'}</h1>
                    {tutorData.gender && (
                      <div className="flex items-center mt-2">
                        {tutorData.gender === 'Male' ? (
                          <FaMale className="text-blue-500 mr-2" />
                        ) : (
                          <FaFemale className="text-pink-500 mr-2" />
                        )}
                        <span className="text-gray-600">{tutorData.gender}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-3">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors">
                      <FaEnvelope className="mr-2" /> Message
                    </button>
                    <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors">
                      <FaPhone className="mr-2" /> Call
                    </button>
                  </div>
                </div>

                <div className="mt-6">
                  {tutorData.location && (
                    <div className="flex items-center text-gray-600 mb-2">
                      <FiHome className="mr-2" />
                      <span>Location: {tutorData.location}</span>
                    </div>
                  )}
                  {tutorData.travelDistance && (
                    <div className="flex items-center text-gray-600 mb-2">
                      <FiMapPin className="mr-2" />
                      <span>Willing to travel: {tutorData.travelDistance} km</span>
                    </div>
                  )}
                  <div className="flex items-center text-gray-600">
                    <FiMonitor className="mr-2" />
                    <span>Teaches online: {tutorData.teachingOnline ? 'Yes' : 'No'}</span>
                  </div>
                </div>

                {tutorData.description && (
                  <div className="mt-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">About Me</h3>
                    <p className="text-gray-700 leading-relaxed">{tutorData.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="md:col-span-2 space-y-6">
              {/* Subjects Section */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <FiBook className="mr-2 text-blue-600" />
                  Subjects & Expertise
                </h2>
                {renderSubjects()}
              </div>

              {/* Experience Section */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <FiAward className="mr-2 text-blue-600" />
                  Experience & Qualifications
                </h2>
                <div className="space-y-4">
                  {tutorData.totalTeachingExperience && (
                    <div>
                      <h3 className="font-semibold text-gray-800">Total Teaching Experience</h3>
                      <p className="text-gray-600">{tutorData.totalTeachingExperience} years</p>
                    </div>
                  )}
                  {tutorData.onlineTeachingExperience && (
                    <div>
                      <h3 className="font-semibold text-gray-800">Online Teaching Experience</h3>
                      <p className="text-gray-600">{tutorData.onlineTeachingExperience} years</p>
                    </div>
                  )}
                  {tutorData.education && (
                    <div>
                      <h3 className="font-semibold text-gray-800">Education</h3>
                      <p className="text-gray-600">{tutorData.education}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Teaching Options Section */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <FiCheckCircle className="mr-2 text-blue-600" />
                  Teaching Options
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full mr-3 ${tutorData.teachingOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>Online Teaching</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full mr-3 ${tutorData.teachesAtHome ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>At Student's Home</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full mr-3 ${tutorData.homeworkHelp ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>Homework Help</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Pricing Section */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <FiDollarSign className="mr-2 text-blue-600" />
                  Pricing & Payment
                </h2>
                <div className="space-y-4">
                  {tutorData.feeDetails && (
                    <div>
                      <h3 className="font-semibold text-gray-800">Fee Details</h3>
                      <p className="text-gray-600">{tutorData.feeDetails}</p>
                    </div>
                  )}
                  {tutorData.paymentDetails && (
                    <div>
                      <h3 className="font-semibold text-gray-800">Payment Methods</h3>
                      <p className="text-gray-600">{tutorData.paymentDetails}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Card */}
              <div className="bg-blue-50 rounded-xl shadow-md p-6 border border-blue-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Tutor</h2>
                <div className="space-y-4">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg flex items-center justify-center transition-colors">
                    <FaEnvelope className="mr-2" /> Send Message
                  </button>
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg flex items-center justify-center transition-colors">
                    <FaPhone className="mr-2" /> Request Call
                  </button>
                  <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg flex items-center justify-center transition-colors">
                    <FaThumbsUp className="mr-2" /> Write Review
                  </button>
                </div>
              </div>

              {/* Location Map Placeholder */}
              {tutorData.location && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Location</h2>
                  <div className="bg-gray-200 h-48 rounded-lg flex items-center justify-center text-gray-500">
                    <FaMapMarkerAlt className="text-2xl mr-2" />
                    <span>{tutorData.location}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TutorProfile;
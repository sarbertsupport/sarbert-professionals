import React, { useState, useEffect } from 'react';
import { FaStar, FaStarHalfAlt, FaEnvelope, FaPhone, FaMapMarkerAlt, FaThumbsUp, FaFemale, FaMale } from 'react-icons/fa';

const TutorProfile = ({ teacherId }) => {
  const [tutorData, setTutorData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTutorData = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/v1/teachers/profile/details/4');
        const data = await response.json();
        setTutorData(data.body.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tutor data:', error);
      }
    };

    fetchTutorData();
  }, [teacherId]);

  const renderStars = () => {
    if (!tutorData) return null;

    const stars = [];
    const rating = tutorData.rating;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} className="text-yellow-500 mr-1" />);
    }

    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key={fullStars} className="text-yellow-500 mr-1" />);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaStar key={i + fullStars + 1} className="text-gray-300 mr-1" />);
    }

    return stars;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full bg-gray-100 py-8">
      <div className="max-w-screen-lg mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-2/3 md:pr-8">
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <div className="flex items-center mb-4">
                {tutorData.image && (
                  <img src={tutorData.image} alt={tutorData.fullName} className="w-32 h-32 rounded-full mr-6" />
                )}
                <div>
                  <h2 className="text-3xl font-semibold">{tutorData.fullName}</h2>
                  <div className="flex items-center">
                    {renderStars()}
                    <p>{tutorData.rating}</p>
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Description</h3>
                <p className="text-gray-700">{tutorData.description}</p>
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Subjects</h3>
                <ul className="list-disc pl-6">
                  {tutorData.subjects.split(',').map((subject, index) => (
                    <li key={index} className="text-gray-700">{subject.trim()}</li>
                  ))}
                </ul>
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Experience</h3>
                <p className="text-gray-700">{tutorData.totalTeachingExperience} years</p>
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Education</h3>
                <p className="text-gray-700">{tutorData.education}</p>
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Fee Details</h3>
                <p className="text-gray-700">{tutorData.feeDetails}</p>
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Payment Details</h3>
                <p className="text-gray-700">{tutorData.paymentDetails}</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Reviews</h3>
                <p className="text-gray-700">{tutorData.reviews}</p>
              </div>
            </div>
          </div>
          <div className="md:w-1/3">
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <button className="bg-green-500 text-white px-6 py-3 rounded-md mb-4 block w-full text-left"><FaEnvelope className="mr-2" />Message</button>
              <button className="bg-green-500 text-white px-6 py-3 rounded-md mb-4 block w-full text-left"><FaPhone className="mr-2" />Call</button>
              <button className="bg-green-500 text-white px-6 py-3 rounded-md mb-4 block w-full text-left"><FaThumbsUp className="mr-2" />Write Review</button>
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Location</h3>
                <div className="flex items-center">
                  <FaMapMarkerAlt className="mr-2" />
                  <p className="text-gray-700">{tutorData.location}</p>
                </div>
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Can Travel Distance</h3>
                <p className="text-gray-700">{tutorData.travelDistance} km</p>
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Teaching Online</h3>
                <p className="text-gray-700">{tutorData.teachingOnline ? 'Yes' : 'No'}</p>
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Online Teaching Experience</h3>
                <p className="text-gray-700">{tutorData.onlineTeachingExperience} years</p>
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Total Teaching Experience</h3>
                <p className="text-gray-700">{tutorData.totalTeachingExperience} years</p>
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Teaches Online</h3>
                <p className="text-gray-700">{tutorData.teachingOnline ? 'Yes' : 'No'}</p>
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Teaches at Student's Home</h3>
                <p className="text-gray-700">{tutorData.teachesAtHome ? 'Yes' : 'No'}</p>
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Homework Help</h3>
                <p className="text-gray-700">{tutorData.homeworkHelp ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Gender</h3>
                <p className="text-gray-700">{tutorData.gender === 'Male' ? <FaMale /> : <FaFemale />}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorProfile;

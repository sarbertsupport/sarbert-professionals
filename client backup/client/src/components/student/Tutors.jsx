import React, { useState } from 'react';

const tutorsData = [
  {
    name: "Timothy Mwingirwa",
    description: "Secondary school physics and mathematics teacher",
    qualifications: "I am Timothy mwingirwa, a Kenyan based physics and mathematics teacher. I am a (BED SCIENCE) graduate from the university of Nairobi. I pride myself with a wide range of experience of teaching .I have taught in several schools including Chogoria girls secondary school. I am passionate about the overall success of my students both...",
    subjects: ["Mathematics (844/CBC primary)", "Secondary School physics"],
    location: "Meru County",
    rate: "KSh 500–1,500/hour",
    experience: "6.0 yr.",
    imageUrl: "/path-to-timothy-image.jpg",
  },
  {
    name: "Stephen",
    description: "University lecturer",
    qualifications: "I am a prolific teacher with both graduate and post graduate experience in teaching and lecturing. I am a result-oriented individual who is very patient and detailed when dealing with learners. My goal is aimed at getting perfection from learners as far as competence is concerned. I am resilient and jovial. My content delivery is learner...",
    subjects: ["Kiswahili language", "English & Literature"],
    location: "Machakos County",
    rate: "KSh 2,500–4,000/hour",
    experience: "30.0 yr.",
    imageUrl: "/path-to-stephen-image.jpg",
  },
];

const Tutors = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationTerm, setLocationTerm] = useState("");

  // Filter tutors based on search term and location
  const filteredTutors = tutorsData.filter((tutor) =>
    (tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tutor.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tutor.subjects.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase()))) &&
    tutor.location.toLowerCase().includes(locationTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Search Bar */}
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row justify-between items-center mb-4">
        {/* Subject/Skill Input */}
        <input
          type="text"
          placeholder="Subject / Skill"
          className="border border-gray-300 p-2 rounded-lg w-full md:w-1/3 focus:outline-none focus:ring focus:border-blue-300"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {/* Location Input */}
        <input
          type="text"
          placeholder="Location"
          className="border border-gray-300 p-2 rounded-lg w-full md:w-1/3 focus:outline-none focus:ring focus:border-blue-300"
          value={locationTerm}
          onChange={(e) => setLocationTerm(e.target.value)}
        />
        {/* Search Button */}
        <button className="bg-blue-600 text-white p-2 rounded-lg w-full md:w-auto">
          Search
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex flex-wrap justify-start items-center mb-6 space-x-4">
        <a href="#all" className="text-blue-600 hover:text-blue-800 font-medium">All</a>
        <a href="#online" className="text-blue-600 hover:text-blue-800 font-medium">Online</a>
        <a href="#home" className="text-blue-600 hover:text-blue-800 font-medium">Home</a>
        <a href="#assignment" className="text-blue-600 hover:text-blue-800 font-medium">Assignment</a>
        <select className="border border-gray-300 p-2 rounded-lg text-gray-600">
          <option value="all-levels">Level</option>
          <option value="primary">Primary</option>
          <option value="secondary">Secondary</option>
          <option value="university">University</option>
        </select>
      </div>

      {/* Tutors List */}
      {filteredTutors.length > 0 ? (
        filteredTutors.map((tutor, index) => (
          <div
            key={index}
            className="flex flex-col lg:flex-row bg-white shadow-md rounded-lg p-6 mb-6 border border-gray-300"
          >
            <div className="flex-shrink-0">
              <img
                className="h-24 w-24 object-cover rounded-md border border-gray-300"
                src={tutor.imageUrl}
                alt={tutor.name}
              />
            </div>
            <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col">
              <div className="flex items-center">
                <h2 className="text-lg font-semibold text-blue-700">{tutor.name}</h2>
                <span className="text-sm text-gray-500 ml-2">({tutor.experience} Experience)</span>
              </div>
              <p className="text-gray-700 italic text-sm">{tutor.description}</p>
              <p className="mt-2 text-sm text-gray-700">{tutor.qualifications}</p>
              <div className="mt-4">
                <h3 className="font-semibold text-gray-700">Subjects:</h3>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {tutor.subjects.map((subject, i) => (
                    <li key={i}>{subject}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-4 flex flex-col text-sm space-y-1 text-gray-600">
                <span>
                  <strong>Location: </strong>{tutor.location}
                </span>
                <span>
                  <strong>Rate: </strong>{tutor.rate}
                </span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500">No tutors found matching your search criteria.</p>
      )}
    </div>
  );
};

export default Tutors;

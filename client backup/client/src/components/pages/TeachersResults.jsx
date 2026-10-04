import React, { useState } from 'react';
import { FaMapMarkerAlt, FaClock, FaChalkboardTeacher, FaDollarSign,FaAngleDown, FaTimes  } from 'react-icons/fa';
import SearchForm from './Search';
const TeachersResults = () => {
    const [filter, setFilter] = useState('All');
    const [showLevelModal, setShowLevelModal] = useState(false);
    const [fromLevel, setFromLevel] = useState('');
    const [toLevel, setToLevel] = useState('');
  // Sample data for teachers (replace with actual data)
  const teachers = [
    {
      name: "John Doe",
      skills: ["Mathematics", "Physics","Computer Science","Design", "Python"],
      description: "Experienced teacher specializing in mathematics and physics tttrtettstttstttttttttttttt Lorem, ipsum dolor sit amet consectetur adipisicing elit. Fugiat quaerat ducimus est, rem aliquid minima aspernatur eos saepe iusto suscipit expedita, a ad modi deleniti quod laborum odio porro cum?.",
      location: "New York, USA",
      rate: "$50-100/hour",
      yearsOnline: 3,
      totalExperience: 10,
      image: "https://userphotos2.teacheron.com/2216549-72974.jpeg"
    },
    {
        name: "John Doe",
        skills: ["Mathematics", "Physics","Computer Science","Design", "Python"],
        description: "Experienced teacher specializing in mathematics and physics.Lorem, ipsum dolor sit amet consectetur adipisicing elit. Fugiat quaerat ducimus est, rem aliquid minima aspernatur eos saepe iusto suscipit expedita, a ad modi deleniti quod laborum odio porro cum?",
        location: "New York, USA",
        rate: "$50-100/hour",
        yearsOnline: 3,
        totalExperience: 10,
        image: ""
      },
      {
        name: "John Doe",
        skills: ["Mathematics", "Physics","Computer Science","Design", "Python"],
        description: "Experienced teacher specializing in mathematics and physics.Lorem, ipsum dolor sit amet consectetur adipisicing elit. Fugiat quaerat ducimus est, rem aliquid minima aspernatur eos saepe iusto suscipit expedita, a ad modi deleniti quod laborum odio porro cum?",
        location: "New York, USA",
        rate: "$50-100/hour",
        yearsOnline: 3,
        totalExperience: 10,
        image: "https://userphotos2.teacheron.com/2216535-26059.png"
      },
      {
        name: "John Doe",
        skills: ["Mathematics", "Physics","Computer Science","Design", "Python"],
        description: "Experienced teacher specializing in mathematics and physics.Lorem, ipsum dolor sit amet consectetur adipisicing elit. Fugiat quaerat ducimus est, rem aliquid minima aspernatur eos saepe iusto suscipit expedita, a ad modi deleniti quod laborum odio porro cum?",
        location: "New York, USA",
        rate: "$50-100/hour",
        yearsOnline: 3,
        totalExperience: 10,
        image: ""
      },
      {
        name: "John Doe",
        skills: ["Mathematics", "Physics","Computer Science","Design", "Python"],
        description: "Experienced teacher specializing in mathematics and physics.Lorem, ipsum dolor sit amet consectetur adipisicing elit. Fugiat quaerat ducimus est, rem aliquid minima aspernatur eos saepe iusto suscipit expedita, a ad modi deleniti quod laborum odio porro cum?",
        location: "New York, USA",
        rate: "$50-100/hour",
        yearsOnline: 3,
        totalExperience: 10,
        image: "https://userphotos2.teacheron.com/2216514-39214.jpg"
      },
      {
        name: "John Doe",
        skills: ["Mathematics", "Physics","Computer Science","Design", "Python"],
        description: "Experienced teacher specializing in mathematics and physics.Lorem, ipsum dolor sit amet consectetur adipisicing elit. Fugiat quaerat ducimus est, rem aliquid minima aspernatur eos saepe iusto suscipit expedita, a ad modi deleniti quod laborum odio porro cum?",
        location: "New York, USA",
        rate: "$50-100/hour",
        yearsOnline: 3,
        totalExperience: 10,
        image: "https://userphotos2.teacheron.com/2216514-39214.jpg"
      },
    // Add more teachers here...
  ];
  const filteredTeachers = teachers.filter(teacher => {
    if (filter === 'All') {
      return true;
    } else if (filter === 'Online') {
      return teacher.yearsOnline > 0;
    } else if (filter === 'Home') {
      // Add logic to filter teachers who teach at home
      return true; // Placeholder, replace with actual logic
    } else if (filter === 'Assignment') {
      // Add logic to filter teachers who assign work
      return true; // Placeholder, replace with actual logic
    }
  });
  const handleLevelFilter = () => {
    // Add logic to filter teachers by selected levels
    setShowLevelModal(false); // Close the modal after filtering
  };
 
  return (
    <div className="max-w-screen-lg mx-auto p-4 md:p-8">
      <div>
        <SearchForm />
      </div>
      <div className="mb-4 flex flex-wrap">
        <button className={filter === 'All' ? 'mr-4 mb-2 md:mb-0 bg-blue-500 text-white px-4 py-2 rounded-md' : 'mr-4 mb-2 md:mb-0 hover:bg-blue-500 hover:text-white px-4 py-2 rounded-md'} onClick={() => setFilter('All')}>All</button>
        <button className={filter === 'Online' ? 'mr-4 mb-2 md:mb-0 bg-blue-500 text-white px-4 py-2 rounded-md' : 'mr-4 mb-2 md:mb-0 hover:bg-blue-500 hover:text-white px-4 py-2 rounded-md'} onClick={() => setFilter('Online')}>Online</button>
        <button className={filter === 'Home' ? 'mr-4 mb-2 md:mb-0 bg-blue-500 text-white px-4 py-2 rounded-md' : 'mr-4 mb-2 md:mb-0 hover:bg-blue-500 hover:text-white px-4 py-2 rounded-md'} onClick={() => setFilter('Home')}>Home</button>
        <button className={filter === 'Assignment' ? 'mr-4 mb-2 md:mb-0 bg-blue-500 text-white px-4 py-2 rounded-md' : 'mr-4 mb-2 md:mb-0 hover:bg-blue-500 hover:text-white px-4 py-2 rounded-md'} onClick={() => setFilter('Assignment')}>Assignment</button>
        <div className="relative mb-2 md:mb-0">
          <button className="bg-white text-black px-4 py-2 rounded-md flex items-center" onClick={() => setShowLevelModal(true)}>
            Levels <FaAngleDown className="ml-1" />
          </button>
          {showLevelModal && (
            <div className="absolute top-10 right-0 bg-white p-4 border border-gray-200 rounded-lg shadow-md z-10">
              <div className="flex justify-between mb-2">
                <h3 className="text-lg font-semibold">Filter Subject by Level</h3>
                <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowLevelModal(false)}><FaTimes /></button>
              </div>
              <div className="flex flex-col">
                <select className="mb-4 border border-gray-200 rounded-md px-3 py-2" value={fromLevel} onChange={(e) => setFromLevel(e.target.value)}>
                  <option value="">-- Select Level --</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Expert">Expert</option>
                  {/* Add more options as needed */}
                </select>
                <select className="mb-4 border border-gray-200 rounded-md px-3 py-2" value={toLevel} onChange={(e) => setToLevel(e.target.value)}>
                  <option value="">-- Select Level --</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Expert">Expert</option>
                  {/* Add more options as needed */}
                </select>
                <button className="bg-blue-500 text-white px-4 py-2 rounded-md" onClick={handleLevelFilter}>Apply</button>
              </div>
            </div>
          )}
        </div>
      </div>
      <h2 className="text-3xl font-semibold mb-4">Teachers Results</h2>
      {filteredTeachers.map((teacher, index) => (
        <div key={index} className="bg-white p-4 rounded-lg shadow-md mb-4 hover:bg-gray-100 transition duration-300">
          <div className="flex flex-col md:flex-row justify-between mb-2">
            <div className="md:flex-shrink-0 mb-4 md:mb-0">
              {teacher.image && (
                <img src={teacher.image} alt={teacher.name} className="w-24 h-24 rounded-full" />
              )}
            </div>
            <div className="md:flex-grow md:ml-4">
              <h3 className="text-xl font-semibold mb-2"><a href="#" className="text-blue-600">{teacher.name}</a></h3>
              <p className="text-lg font-semibold">{teacher.title}</p>
            </div>
          </div>
          <div className="flex flex-wrap mb-2">
            {teacher.skills.slice(0, 5).map((skill, index) => (
              <a key={index} href="#" className="mr-2 bg-gray-200 hover:bg-gray-700 hover:text-white px-2 py-1 rounded-md transition duration-300 mb-2">{skill}</a>
            ))}
          </div>
          <p className="mb-2">{teacher.description}</p>
          <div className="flex flex-wrap items-center mb-2">
            <div className="flex items-center mr-6 mb-2 md:mb-0">
              <FaMapMarkerAlt className="mr-1" />
              <p className="mr-3">{teacher.location}</p>
            </div>
            <div className="flex items-center mr-6 mb-2 md:mb-0">
              <FaClock className="mr-1" />
              <p className="mr-3">{teacher.yearsOnline} Online Teaching yrs</p>
            </div>
            <div className="flex items-center mr-6 mb-2 md:mb-0">
              <p className="mr-1">Rate:</p>
              <p>{teacher.rate}</p>
            </div>
            <div className="flex items-center">
              <FaChalkboardTeacher className="mr-1" />
              <p>{teacher.totalExperience} Total Teaching yrs</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TeachersResults;

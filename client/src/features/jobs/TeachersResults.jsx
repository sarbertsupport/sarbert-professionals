import React, { useState, useCallback, useMemo } from 'react';
import { FaMapMarkerAlt, FaClock, FaChalkboardTeacher, FaAngleDown, FaTimes } from 'react-icons/fa';
import SearchForm from './Search';
import Footer from '../../features/shared/Footer';

const TeacherCard = React.memo(({ teacher }) => (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
    <div className="p-6">
      <div className="flex flex-col md:flex-row">
        {/* Teacher Image */}
        <div className="md:w-1/5 mb-4 md:mb-0 flex justify-center">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
            {teacher.image ? (
              <img 
                src={teacher.image} 
                alt={`Profile image of ${teacher.name}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <span>No Photo</span>
              </div>
            )}
          </div>
        </div>
        {/* Teacher Info */}
        <div className="md:w-4/5 md:pl-6">
          <div className="flex flex-col md:flex-row md:justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                <a href="#">{teacher.name}</a>
              </h3>
              <p className="text-gray-600 font-medium">{teacher.title}</p>
            </div>
            <div className="mt-2 md:mt-0">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {teacher.availability}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 ml-2">
                {teacher.category}
              </span>
            </div>
          </div>
          {/* Skills */}
          <div className="mt-3 flex flex-wrap gap-2">
            {teacher.skills.map((skill, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {skill}
              </span>
            ))}
          </div>
          {/* Description */}
          <p className="mt-3 text-gray-600 line-clamp-2">
            {teacher.description}
          </p>
          {/* Stats */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-wrap items-center text-sm text-gray-500 gap-y-2">
              <div className="flex items-center mr-6">
                <FaMapMarkerAlt className="mr-1.5 text-gray-400" />
                <span>{teacher.location}</span>
              </div>
              <div className="flex items-center mr-6">
                <FaClock className="mr-1.5 text-gray-400" />
                <span>{teacher.yearsOnline} yrs online</span>
              </div>
              <div className="flex items-center mr-6">
                <FaChalkboardTeacher className="mr-1.5 text-gray-400" />
                <span>{teacher.totalExperience} yrs experience</span>
              </div>
              <div className="flex items-center font-medium text-gray-900">
                <span>{teacher.rate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
));

const TeachersResults = () => {
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const handleAvailabilityFilter = useCallback((value) => {
    setAvailabilityFilter(value);
  }, []);

  const handleCategoryModalToggle = useCallback(() => {
    setShowCategoryModal((prev) => !prev);
  }, []);

  // Sample data for teachers
  const teachers = [
    {
      id: 1,
      name: "Sarah Johnson",
      title: "Senior Software Engineer",
      skills: ["JavaScript", "React", "Node.js", "TypeScript"],
      description: "Experienced full-stack developer with 8+ years in the industry. Specializes in modern JavaScript frameworks and loves teaching programming concepts in an accessible way.",
      location: "San Francisco, USA",
      rate: "$70-120/hour",
      yearsOnline: 4,
      totalExperience: 8,
      availability: "Online",
      category: "IT & Software",
      image: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      id: 2,
      name: "Michael Chen",
      title: "Finance Professor",
      skills: ["Investment", "Corporate Finance", "Risk Management", "Accounting"],
      description: "PhD in Finance with 15 years of teaching experience at university level. Provides practical insights into financial markets and investment strategies.",
      location: "New York, USA",
      rate: "$90-150/hour",
      yearsOnline: 2,
      totalExperience: 15,
      availability: "Physical",
      category: "Banking & Finance",
      image: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      id: 3,
      name: "Emma Rodriguez",
      title: "Machine Learning Specialist",
      skills: ["Python", "TensorFlow", "Data Science", "AI"],
      description: "Passionate about making AI accessible to everyone. Worked at leading tech companies before transitioning to teaching full-time.",
      location: "Austin, USA",
      rate: "$80-130/hour",
      yearsOnline: 3,
      totalExperience: 6,
      availability: "Online",
      category: "IT & Software",
      image: "https://randomuser.me/api/portraits/women/63.jpg"
    },
    {
      id: 4,
      name: "David Wilson",
      title: "Business Consultant",
      skills: ["Marketing", "Strategy", "Entrepreneurship", "Management"],
      description: "Helped launch dozens of successful startups. Focuses on practical business skills that students can apply immediately.",
      location: "Chicago, USA",
      rate: "$100-180/hour",
      yearsOnline: 1,
      totalExperience: 12,
      availability: "Physical",
      category: "Business",
      image: "https://randomuser.me/api/portraits/men/75.jpg"
    },
    {
      id: 5,
      name: "Priya Patel",
      title: "Electrical Engineer",
      skills: ["Circuit Design", "Embedded Systems", "IoT", "Robotics"],
      description: "Industry professional with a passion for teaching engineering concepts through hands-on projects and real-world applications.",
      location: "Boston, USA",
      rate: "$75-125/hour",
      yearsOnline: 2,
      totalExperience: 7,
      availability: "Online",
      category: "Engineering",
      image: "https://randomuser.me/api/portraits/women/25.jpg"
    },
    {
      id: 6,
      name: "James Taylor",
      title: "Mathematics Professor",
      skills: ["Calculus", "Linear Algebra", "Statistics", "Discrete Math"],
      description: "Makes complex mathematical concepts approachable and fun. Believes anyone can learn math with the right guidance.",
      location: "Seattle, USA",
      rate: "$60-110/hour",
      yearsOnline: 5,
      totalExperience: 10,
      availability: "Online",
      category: "Education",
      image: "https://randomuser.me/api/portraits/men/81.jpg"
    }
  ];

  const filteredTeachers = useMemo(() => teachers.filter(teacher => {
    // Filter by availability
    const availabilityMatch = 
      availabilityFilter === 'All' || 
      teacher.availability === availabilityFilter;
    
    // Filter by category
    const categoryMatch = 
      categoryFilter === 'All' || 
      teacher.category === categoryFilter;
    
    return availabilityMatch && categoryMatch;
  }), [teachers, availabilityFilter, categoryFilter]);

  const categories = [
    "All",
    "IT & Software",
    "Business",
    "Education",
    "Engineering",
    "Banking & Finance"
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search Section */}
          <div className="mb-8">
            <SearchForm />
          </div>

          {/* Filters Section */}
          <div className="mb-8 bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Filter Teachers</h2>
            
            <div className="flex flex-wrap gap-4">
              {/* Availability Filter */}
              <div className="w-full md:w-auto">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Availability</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAvailabilityFilter('All')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      availabilityFilter === 'All' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => handleAvailabilityFilter('Online')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      availabilityFilter === 'Online' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Online
                  </button>
                  <button
                    onClick={() => handleAvailabilityFilter('Physical')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      availabilityFilter === 'Physical' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    In-Person
                  </button>
                </div>
              </div>

              {/* Category Filter */}
              <div className="w-full md:w-auto relative">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Job Category</h3>
                <button
                  onClick={handleCategoryModalToggle}
                  className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {categoryFilter}
                  <FaAngleDown className="ml-2" />
                </button>

                {showCategoryModal && (
                  <div className="absolute z-10 mt-1 w-56 bg-white rounded-md shadow-lg border border-gray-200">
                    <div className="p-2">
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => {
                            setCategoryFilter(category);
                            setShowCategoryModal(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm rounded-md ${
                            categoryFilter === category
                              ? 'bg-blue-100 text-blue-800'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {filteredTeachers.length} Teachers Found
            </h2>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
              {filteredTeachers.map((teacher) => (
                <TeacherCard key={teacher.id} teacher={teacher} />
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TeachersResults;
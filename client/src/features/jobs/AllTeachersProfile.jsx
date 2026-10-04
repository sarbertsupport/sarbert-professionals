import React, { useState, useEffect } from 'react';
import { fetchAllTeachers, fetchAllTeachersWithoutFilters } from '../../components/services/allTeachersProfile';
import { FaChalkboardTeacher, FaVenusMars, FaMoneyBillWave, FaHome, FaLaptop, FaPhone, FaMapMarkerAlt, FaIdBadge, 
         FaStar, FaEye, FaClock, FaGraduationCap, FaBook, FaUserTie, FaBriefcase, FaCheckCircle, FaTimes, 
         FaFilter, FaSearch, FaSort, FaHeart, FaShare, FaEnvelope } from 'react-icons/fa';
import logger from '../../utils/logger';
import { FiFilter, FiDollarSign, FiCalendar, FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import { IoMdTime } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

const AllTeachersProfile = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    gender: '',
    minFee: '',
    maxFee: '',
    onlineAvailability: '',
    homeAvailability: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const navigate = useNavigate();

  useEffect(() => {
    loadTeachers();
  }, [filters]);

  const loadTeachers = async () => {
    setLoading(true);
    try {
      // Check if token is valid
      const isTokenValid = useAuthStore.getState().isTokenValid;
      if (!isTokenValid()) {
        useAuthStore.getState().forceLogout();
        navigate('/login');
        return;
      }
      
      // Convert string values to numbers for fee filtering
      const processedFilters = {
        ...filters,
        minFee: filters.minFee ? parseFloat(filters.minFee) : '',
        maxFee: filters.maxFee ? parseFloat(filters.maxFee) : ''
      };
      
      const response = await fetchAllTeachers(processedFilters);
      setTeachers(response.body.data.teachers);
      setPagination({
        currentPage: response.body.data.currentPage,
        totalPages: response.body.data.totalPages,
        totalItems: response.body.data.totalItems
      });
    } catch (error) {
      logger.error('Error loading teachers:', error);
      if (error.response?.status === 401) {
        useAuthStore.getState().forceLogout();
        navigate('/login');
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = async () => {
    setFilters({
      gender: '',
      minFee: '',
      maxFee: '',
      onlineAvailability: '',
      homeAvailability: ''
    });
    const response = await fetchAllTeachersWithoutFilters();
    setTeachers(response.body.data.teachers);
    setPagination({
      currentPage: response.body.data.currentPage,
      totalPages: response.body.data.totalPages,
      totalItems: response.body.data.totalItems
    });
  };

  const handleViewProfile = (teacherId) => {
    navigate(`/teachers/${teacherId}`);
  };

  const getAvailabilityBadges = (teacher) => {
    const badges = [];
    if (teacher.onlineAvailability) {
      badges.push(
        <span key="online" className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full mr-2">
          <FaLaptop className="mr-1" />
          Online
        </span>
      );
    }
    if (teacher.homeAvailability) {
      badges.push(
        <span key="home" className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
          <FaHome className="mr-1" />
          Home
        </span>
      );
    }
    return badges;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                <FaChalkboardTeacher className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Qualified Professionals</h1>
                <p className="text-gray-600 mt-1">Find the perfect professionals for your learning needs</p>
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 px-4 py-2 rounded-xl text-sm font-semibold">
                {teachers.length} of {pagination.totalItems} professionals
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Enhanced Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <FaFilter className="mr-2 text-blue-600" /> 
                  Filter Professionals
                </h2>
                <button 
                  onClick={resetFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-6">
                {/* Gender Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <FaVenusMars className="mr-2 text-blue-500" /> 
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={filters.gender}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                {/* Fee Range Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <FiDollarSign className="mr-2 text-blue-500" /> 
                    Fee Range (USD)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-2">Minimum</label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-400">$</span>
                        <input
                          type="number"
                          name="minFee"
                          placeholder="20"
                          value={filters.minFee}
                          onChange={handleFilterChange}
                          min="0"
                          step="0.01"
                          className="w-full pl-8 pr-3 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-2">Maximum</label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-400">$</span>
                        <input
                          type="number"
                          name="maxFee"
                          placeholder="100"
                          value={filters.maxFee}
                          onChange={handleFilterChange}
                          min="0"
                          step="0.01"
                          className="w-full pl-8 pr-3 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Availability Filters */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <IoMdTime className="mr-2 text-blue-500" /> 
                    Availability
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        name="onlineAvailability"
                        checked={filters.onlineAvailability === 'true'}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          onlineAvailability: e.target.checked ? 'true' : ''
                        }))}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex items-center">
                        <FaLaptop className="text-gray-600 mr-2" />
                        <span className="text-gray-700 font-medium">Online Lessons</span>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        name="homeAvailability"
                        checked={filters.homeAvailability === 'true'}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          homeAvailability: e.target.checked ? 'true' : ''
                        }))}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex items-center">
                        <FaHome className="text-gray-600 mr-2" />
                        <span className="text-gray-700 font-medium">Home Tutoring</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <FaStar className="mr-2 text-yellow-500" />
                    Quick Stats
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Professionals:</span>
                      <span className="font-semibold text-gray-800">{pagination.totalItems}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Showing:</span>
                      <span className="font-semibold text-gray-800">{teachers.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pages:</span>
                      <span className="font-semibold text-gray-800">{pagination.totalPages}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Teachers List */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="text-gray-600">Loading professionals...</p>
                  </div>
                </div>
              ) : teachers.length === 0 ? (
                <div className="text-center py-16">
                  <div className="mx-auto w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-6">
                    <FaChalkboardTeacher className="text-gray-400 text-3xl" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No professionals found</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">Try adjusting your filters or search criteria to find the perfect professional for your needs.</p>
                  <button
                    onClick={resetFilters}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg transform hover:scale-105"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className={`grid gap-6 p-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                  {teachers.map((teacher) => (
                    <div key={teacher.teacherId} className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-blue-200 transform hover:scale-105">
                      <div className="p-6">
                        {/* Header with Image and Basic Info */}
                        <div className="flex items-start space-x-4">
                          <div className="relative">
                            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-white shadow-lg">
                              {teacher.imagePath ? (
                                <img
                                  src={teacher.imagePath}
                                  alt={`Profile image of ${teacher.displayName}`}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <FaUserTie className="text-gray-400 text-2xl" />
                                </div>
                              )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full p-2 border-2 border-white shadow-lg">
                              <FaIdBadge className="text-white text-xs" />
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-xl font-bold text-gray-800 mb-1">{teacher.displayName}</h3>
                                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                  <span className="flex items-center">
                                    <FaVenusMars className="mr-1 text-gray-400" /> 
                                    {teacher.gender}
                                  </span>
                                  <span className="flex items-center">
                                    <FaMapMarkerAlt className="mr-1 text-gray-400" /> 
                                    {teacher.location}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2 mb-3">
                                  {getAvailabilityBadges(teacher)}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-blue-600">
                                  ${teacher.minFee}
                                </div>
                                <div className="text-sm text-gray-500">per hour</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* About Section */}
                        <div className="mt-4">
                          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                            <FaBook className="mr-2 text-blue-500" />
                            About
                          </h4>
                          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                            {teacher.profileDescription || "Experienced professional with expertise in various subjects and teaching methodologies."}
                          </p>
                        </div>

                        {/* Contact and Actions */}
                        <div className="mt-6 pt-4 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center text-sm text-gray-700">
                                <FaPhone className="mr-2 text-gray-400" />
                                <span className="font-medium">{teacher.phoneNumber}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-700">
                                <FaEnvelope className="mr-2 text-gray-400" />
                                <span className="font-medium">{teacher.email || "Contact via phone"}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                <FaHeart className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                                <FaShare className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleViewProfile(teacher.teacherId)}
                                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg transform hover:scale-105 flex items-center"
                              >
                                <FaEye className="mr-2" />
                                View Profile
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Enhanced Pagination */}
              {pagination.totalPages > 1 && (
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Showing page {pagination.currentPage} of {pagination.totalPages}
                    </div>
                    <nav className="inline-flex rounded-xl shadow-sm overflow-hidden">
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, pagination.currentPage - 1) }))}
                        disabled={pagination.currentPage === 1}
                        className="px-3 py-2 bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <FiArrowLeft className="w-4 h-4" />
                      </button>
                      
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => setFilters(prev => ({ ...prev, page }))}
                            className={`px-4 py-2 border border-gray-300 transition-colors ${
                              pagination.currentPage === page
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, page: Math.min(pagination.totalPages, pagination.currentPage + 1) }))}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className="px-3 py-2 bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <FiArrowRight className="w-4 h-4" />
                      </button>
                    </nav>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllTeachersProfile; 
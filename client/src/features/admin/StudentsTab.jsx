import { useState, useEffect, useMemo } from 'react';
import { Eye, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { getAllStudentProfiles, getStudentProfileById } from '../../components/services/studentProfile';
import { ClientProfileDetailModal } from './studentsTab/ClientProfileDetailModal';

const ClientsTab = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clientDetailProfile, setClientDetailProfile] = useState(null);
  const [profileDetailLoading, setProfileDetailLoading] = useState(false);
  const [profileDetailError, setProfileDetailError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  
  // Filters and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch students data with filters and pagination
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const result = await getAllStudentProfiles(
          currentPage,
          studentsPerPage,
          searchTerm || null,
          genderFilter !== 'all' ? genderFilter : null
        );
        
        if (result.success) {
          setStudents(result.body.data.students);
          setTotalItems(result.body.data.totalItems);
          setTotalPages(result.body.data.totalPages);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Add debounce to search to prevent too many API calls
    const timer = setTimeout(() => {
      fetchStudents();
    }, 300);

    return () => clearTimeout(timer);
  }, [currentPage, searchTerm, genderFilter]);

  // Filter students based on search term (client-side filtering for better UX)
  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students;
    return students.filter(student =>
      student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.phoneNumber?.includes(searchTerm) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  // Handle select all
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedStudents(filteredStudents.map(student => student.id));
    } else {
      setSelectedStudents([]);
    }
  };

  // Handle individual selection
  const handleSelectStudent = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  // Format date from array [year, month, day]
  const formatDate = (dateArray) => {
    if (!dateArray || dateArray.length < 3) return 'N/A';
    const [year, month, day] = dateArray;
    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const openClientDetail = async (student) => {
    setIsModalOpen(true);
    setClientDetailProfile(null);
    setProfileDetailError(null);
    setProfileDetailLoading(true);
    const result = await getStudentProfileById(student.id);
    if (result.success) {
      setClientDetailProfile(result.body.data);
    } else {
      setProfileDetailError(result.error);
    }
    setProfileDetailLoading(false);
  };

  const closeClientModal = () => {
    setIsModalOpen(false);
    setClientDetailProfile(null);
    setProfileDetailError(null);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Gender options for filter
  const genderOptions = [
    { value: 'all', label: 'All Genders' },
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center text-red-500">
        Error loading client data: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
          CREATE NEW
        </button>
            </div>

      {/* Search and Filters */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Clients</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
                onChange={handleSearch}
                placeholder="Search by name, location, or phone..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="lg:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Gender</label>
          <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={genderFilter}
            onChange={(e) => {
              setGenderFilter(e.target.value);
                setCurrentPage(1);
            }}
          >
            {genderOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left">
                  <input
                    type="checkbox"
                    checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">NAME</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">EMAIL</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">CLIENT ID</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">GENDER</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">BIRTHDATE</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">LOCATION</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">PHONE</th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => handleSelectStudent(student.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {student.fullName?.charAt(0)?.toUpperCase() || 'C'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{student.fullName}</div>
                        </div>
                      </div>
                  </td>
                    <td className="px-3 py-2 text-sm text-gray-900 break-all max-w-[200px]">
                      {student.email || '—'}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900 font-mono">{student.id}</td>
                    <td className="px-3 py-2 text-sm text-gray-900">{student.gender}</td>
                    <td className="px-3 py-2 text-sm text-gray-900">
                    {formatDate(student.birthdate)}
                  </td>
                    <td className="px-3 py-2 text-sm text-gray-900">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-900">{student.location}</span>
                        {student.postalCode && (
                          <span className="text-xs text-gray-500">{student.postalCode}</span>
                        )}
                      </div>
                  </td>
                    <td className="px-3 py-2 text-sm text-gray-900">{student.phoneNumber || 'N/A'}</td>
                    <td className="px-3 py-2 text-center">
                      <div className="flex items-center justify-center space-x-1">
                    <button 
                      type="button"
                      onClick={() => openClientDetail(student)}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                          title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                      </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                  <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                    No clients found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{((currentPage - 1) * studentsPerPage) + 1}</span> to{' '}
          <span className="font-medium">
            {Math.min(currentPage * studentsPerPage, totalItems)}
          </span>{' '}
                of <span className="font-medium">{totalItems}</span> results
              </p>
        </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
          <button
            onClick={() => handlePageChange(1)}
                  disabled={currentPage <= 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
          >
                  <ChevronsLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
          >
                  <ChevronLeft className="h-5 w-5" />
          </button>
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronRight className="h-5 w-5" />
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage >= totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
          >
                  <ChevronsRight className="h-5 w-5" />
          </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <ClientProfileDetailModal
        open={isModalOpen}
        clientProfile={clientDetailProfile}
        profileLoading={profileDetailLoading}
        profileError={profileDetailError}
        onClose={closeClientModal}
      />
    </div>
  );
};

export default ClientsTab;
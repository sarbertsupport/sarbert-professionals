import { useState, useEffect, useMemo } from 'react';
import { allTeachersPaginated, profileByTeacherId } from '../../components/services/allTeachersProfile';
import logger from '../../utils/logger';
import { TeachersTableSection } from './teachersTab/TeachersTableSection';
import { TeacherProfileDetailModal } from './teachersTab/TeacherProfileDetailModal';

const ProfessionalsTab = () => {
  const [teachersData, setTeachersData] = useState({
    teachers: [],
    totalItems: 0,
    totalPages: 1,
    currentPage: 1
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teacherProfile, setTeacherProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);

  const fetchTeachers = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await allTeachersPaginated(page, 10);
      if (response && response.data) {
        setTeachersData(response.data);
      }
    } catch (err) {
      setError('Failed to fetch professionals');
      logger.error('Error fetching professionals:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherProfile = async (teacherId) => {
    try {
      setProfileLoading(true);
      setProfileError(null);
      const response = await profileByTeacherId(teacherId);
      const payload = response?.body?.data;
      if (payload) {
        setTeacherProfile(payload);
      } else {
        const msg = response?.headers?.customerMessage || response?.body?.message || 'Invalid response';
        throw new Error(msg);
      }
    } catch (err) {
      const status = err.response?.status;
      const hint =
        status === 401
          ? 'Unauthorized — session may have expired.'
          : err.message || 'Request failed';
      setProfileError(`Failed to load professional profile${status ? ` (${status})` : ''}: ${hint}`);
      logger.error('Error fetching professional profile:', err);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleViewTeacher = async (teacher) => {
    setIsModalOpen(true);
    setTeacherProfile(null);
    setProfileError(null);
    await fetchTeacherProfile(teacher.teacherId);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredTeachers = useMemo(() => {
    if (!searchTerm) return teachersData.teachers;
    return teachersData.teachers.filter(teacher =>
      teacher.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.phoneNumber?.includes(searchTerm)
    );
  }, [teachersData.teachers, searchTerm]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedTeachers(filteredTeachers.map(teacher => teacher.teacherId));
    } else {
      setSelectedTeachers([]);
    }
  };

  const handleSelectTeacher = (teacherId) => {
    setSelectedTeachers(prev => 
      prev.includes(teacherId) 
        ? prev.filter(id => id !== teacherId)
        : [...prev, teacherId]
    );
  };

  const handlePageChange = (page) => {
    fetchTeachers(page);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTeacherProfile(null);
    setProfileError(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Professionals</h1>
        <button type="button" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
          CREATE NEW
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <TeachersTableSection
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        filteredTeachers={filteredTeachers}
        selectedTeachers={selectedTeachers}
        onSelectAll={handleSelectAll}
        onSelectTeacher={handleSelectTeacher}
        onViewTeacher={handleViewTeacher}
        teachersData={teachersData}
        onPageChange={handlePageChange}
      />

      <TeacherProfileDetailModal
        open={isModalOpen}
        teacherProfile={teacherProfile}
        profileLoading={profileLoading}
        profileError={profileError}
        onClose={closeModal}
      />
    </div>
  );
};

export default ProfessionalsTab;

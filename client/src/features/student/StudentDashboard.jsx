import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from '../shared/Footer';
import SkeletonRequirementCard from '../shared/SkeletonRequirementCard';
import { StudentDashboardPageHeader } from './studentDashboard/StudentDashboardPageHeader';
import ErrorBanner from '../shared/ErrorBanner';
import {
  FaExclamationCircle,
  FaCheckCircle,
  FaClock,
  FaUser,
  FaTimes,
  FaPlus,
  FaHandshake,
  FaStar,
  FaEye,
} from 'react-icons/fa';
import logger from '../../utils/logger';
import { fetchMyRequirements, closeRequirement, updateJobRequirement } from '../../components/services/myRequirements';
import { ROUTES } from '../../constants/routes';
import { useAuthStore } from '../../store/useAuthStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { formatJobPostedDate, truncateJobDescription } from './studentDashboard/jobPostingFormatters';
import { UpdateJobModal } from './studentDashboard/UpdateJobModal';
import { StudentDashboardJobCard } from './studentDashboard/StudentDashboardJobCard';
import { CloseRequirementConfirmModal } from './studentDashboard/CloseRequirementConfirmModal';

const StudentDashboard = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [requirements, setRequirements] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [processing, setProcessing] = useState(false);
  const itemsPerPage = 10;
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const userId = user?.userId;
  const addNotification = useNotificationStore((state) => state.addNotification);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = useAuthStore.getState().token || localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        // Check if token is valid
        const isTokenValid = useAuthStore.getState().isTokenValid;
        if (!isTokenValid()) {
          useAuthStore.getState().forceLogout();
          navigate('/login');
          return;
        }
        
        if (!userId) {
          throw new Error('User ID not found');
        }
        const requirementsData = await fetchMyRequirements(
          userId,
          currentPage,
          itemsPerPage,
          token
        );
        setRequirements(requirementsData.jobs || []);
        setTotalPages(requirementsData.totalPages || 1);
        setTotalItems(requirementsData.totalItems || 0);
        setExpandedDescriptions({});
      } catch (err) {
        logger.error('Error fetching requirements:', err);
        if (err.response?.status === 401) {
          useAuthStore.getState().forceLogout();
          navigate('/login');
          return;
        }
        addNotification({ type: 'error', message: err.message });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentPage, userId, navigate]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePostJob = () => {
    navigate('/postjob');
  };

  const handleViewMessages = (job) => {
    if (!job?.hasActiveConnections) {
      toast.info(
        'Messages open once a professional connects to this job (after they apply and you are linked). Post publicly or check back for applicants.'
      );
      return;
    }
    navigate(ROUTES.CLIENT_MESSAGES, { state: { focusJobId: job.jobId } });
  };

  const handleCloseClick = (job) => {
    if (job.jobStatus === 'Closed') {
      toast.info('This requirement is already closed');
      return;
    }
    setSelectedJob(job);
    setShowCloseConfirm(true);
  };

  const handleUpdateClick = (job) => {
    if (job.jobStatus === 'Closed') {
      toast.info('Closed requirements cannot be edited');
      return;
    }
    setSelectedJob(job);
    setShowUpdateModal(true);
  };

  const confirmCloseRequirement = async () => {
    try {
      setProcessing(true);
      const token = useAuthStore.getState().token || localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
      if (!userId) {
        throw new Error('User ID not found');
      }
      await closeRequirement(selectedJob.jobId, userId, token);
      const updatedRequirements = await fetchMyRequirements(
        userId,
        currentPage,
        itemsPerPage,
        token
      );
      setRequirements(updatedRequirements.jobs || []);
      setTotalPages(updatedRequirements.totalPages || 1);
      setTotalItems(updatedRequirements.totalItems || 0);
      setShowCloseConfirm(false);
      toast.success('Requirement closed successfully!');
    } catch (err) {
      logger.error('Error closing requirement:', err);
      addNotification({ type: 'error', message: err.message || 'Failed to close requirement' });
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateRequirement = async (formData) => {
    try {
      setProcessing(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
      if (!userId) {
        throw new Error('User ID not found');
      }

      logger.debug('Submitting update with data:', formData);
      
      await updateJobRequirement(
        selectedJob.jobId,
        userId,
        formData,
        token
      );
      
      const updatedRequirements = await fetchMyRequirements(
        userId,
        currentPage,
        itemsPerPage,
        token
      );
      setRequirements(updatedRequirements.jobs || []);
      setTotalPages(updatedRequirements.totalPages || 1);
      setTotalItems(updatedRequirements.totalItems || 0);
      setShowUpdateModal(false);
      toast.success('Requirement updated successfully!');
    } catch (err) {
      logger.error('Error updating requirement:', err);
      throw err; // Re-throw to let the modal handle the error
    } finally {
      setProcessing(false);
    }
  };

  const toggleDescription = (jobId) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [jobId]: !prev[jobId]
    }));
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 min-h-screen flex flex-col">
        <div className="flex-grow p-8">
          <div className="space-y-6" aria-busy="true" aria-label="Loading requirements...">
            {[...Array(4)].map((_, idx) => (
              <SkeletonRequirementCard key={idx} />
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 min-h-screen flex flex-col">
        <div className="flex-grow p-8 flex justify-center items-center">
          <div className="w-full max-w-md">
            <ErrorBanner message={error} onRetry={() => window.location.reload()} />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 min-h-screen flex flex-col">
      <main className="flex-grow p-6">
        <div className="max-w-7xl mx-auto">
          <StudentDashboardPageHeader totalItems={totalItems} requirements={requirements} onPostJob={handlePostJob} />

          {/* Main Content with Sidebar Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Stats Cards */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FaStar className="mr-2 text-yellow-500" />
                  Dashboard Stats
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                        <FaCheckCircle className="text-white text-sm" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Open</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      {requirements.filter(job => job.jobStatus === 'Open').length}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                        <FaHandshake className="text-white text-sm" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Connected</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">
                      {requirements.filter(job => job.hasActiveConnections).length}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center mr-3">
                        <FaTimes className="text-white text-sm" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Closed</span>
                    </div>
                    <span className="text-lg font-bold text-gray-600">
                      {requirements.filter(job => job.jobStatus === 'Closed').length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FaPlus className="mr-2 text-blue-500" />
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button 
                    onClick={handlePostJob}
                    className="w-full p-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <FaPlus className="mr-2" />
                    Post New Job
                  </button>
                  
                  <button 
                    onClick={() => navigate(ROUTES.CLIENT_MESSAGES)}
                    className="w-full p-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <FaEye className="mr-2" />
                    View Messages
                  </button>
                  
                  <button 
                    onClick={() => navigate('/profile')}
                    className="w-full p-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <FaUser className="mr-2" />
                    Edit Profile
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FaClock className="mr-2 text-orange-500" />
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {requirements.slice(0, 3).map((job, index) => (
                    <div key={job.jobId} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {job.jobCategory}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatJobPostedDate(job.createdAt)}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          job.jobStatus === 'Open' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {job.jobStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                  {requirements.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No recent activity
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {/* Requirements List */}
              <div className="space-y-6">
                {requirements.length > 0 ? (
                  requirements.map((job) => (
                    <StudentDashboardJobCard
                      key={job.jobId}
                      job={job}
                      expandedDescriptions={expandedDescriptions}
                      onToggleDescription={toggleDescription}
                      onUpdateClick={handleUpdateClick}
                      onCloseClick={handleCloseClick}
                      onViewMessages={handleViewMessages}
                      formatJobPostedDate={formatJobPostedDate}
                      truncateJobDescription={truncateJobDescription}
                    />
                  ))
                ) : (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                    <div className="max-w-md mx-auto">
                      <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <FaExclamationCircle className="text-white text-3xl" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-3">No Requirements Found</h3>
                      <p className="text-gray-600 mb-8 text-lg">You haven't posted any requirements yet. Get started by posting your first job!</p>
                      <button
                        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                        onClick={handlePostJob}
                      >
                        <FaPlus className="mr-2 inline" />
                        Post Your First Job
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <nav className="inline-flex rounded-xl shadow-lg overflow-hidden">
                    <button
                      aria-label="Previous Page"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className={`px-6 py-3 border-r border-gray-200 ${
                        currentPage === 1 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-white text-gray-700 hover:bg-gray-50 transition-colors'
                      }`}
                    >
                      Previous
                    </button>
                    <div className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold">
                      Page {currentPage} of {totalPages}
                    </div>
                    <button
                      aria-label="Next Page"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className={`px-6 py-3 ${
                        currentPage === totalPages 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-white text-gray-700 hover:bg-gray-50 transition-colors'
                      }`}
                    >
                      Next
                    </button>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {showUpdateModal && selectedJob && (
        <UpdateJobModal
          job={selectedJob}
          onClose={() => setShowUpdateModal(false)}
          onUpdate={handleUpdateRequirement}
        />
      )}

      {showCloseConfirm && (
        <CloseRequirementConfirmModal
          job={selectedJob}
          processing={processing}
          formatJobPostedDate={formatJobPostedDate}
          onCancel={() => setShowCloseConfirm(false)}
          onConfirm={confirmCloseRequirement}
        />
      )}
    </div>
  );
};

export default StudentDashboard;
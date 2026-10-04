import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { profileByTeacherId } from '../../components/services/allTeachersProfile';
import { fetchMyRequirements } from '../../components/services/myRequirements';
import { FaChalkboardTeacher, FaHeart, FaShare } from 'react-icons/fa';
import logger from '../../utils/logger';
import { FiArrowLeft } from 'react-icons/fi';
import { fetchUserProfile } from '../../components/services/authProfile';
import { deductCoinsClient } from '../../components/services/digitalCoins';
import ChatModal from '../chat/ChatModal';
import { useAuthStore } from '../../store/useAuthStore';
import { ContactProfessionalModal } from './viewTeacherProfile/ContactProfessionalModal';
import { ViewTeacherProfileSidebar } from './viewTeacherProfile/ViewTeacherProfileSidebar';
import { ViewTeacherProfileMainPanel } from './viewTeacherProfile/ViewTeacherProfileMainPanel';

const ViewTeacherProfile = () => {
    const { teacherId } = useParams();
    const navigate = useNavigate();
    const [teacher, setTeacher] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [imageError, setImageError] = useState(false);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [userJobs, setUserJobs] = useState([]);
    const [loadingJobs, setLoadingJobs] = useState(false);
    const [jobsError, setJobsError] = useState(null);
    const [userData, setUserData] = useState(null);
    const [currentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [showChat, setShowChat] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [chatError, setChatError] = useState(null);
    const [chatJobData, setChatJobData] = useState(null);
    const [activeTab, setActiveTab] = useState('about'); // 'about', 'education', 'experience', 'subjects'
  
    // Fetch teacher profile and user data
    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('authToken');
            
            // Check if token is valid
            const isTokenValid = useAuthStore.getState().isTokenValid;
            if (!isTokenValid()) {
                useAuthStore.getState().forceLogout();
                navigate('/login');
                return;
            }
            
            try {
                setLoading(true);
                const [userProfile, teacherResponse] = await Promise.all([
                    fetchUserProfile(token),
                    profileByTeacherId(teacherId)
                ]);
                setUserData(userProfile);
                setTeacher(teacherResponse.body.data);
            } catch (err) {
                logger.error('Error fetching data:', err);
                if (err.response?.status === 401) {
                    useAuthStore.getState().forceLogout();
                    navigate('/login');
                    return;
                }
                setError(err.message || 'Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [teacherId, navigate]);

    // Fetch user jobs when modal opens
    useEffect(() => {
        const fetchUserJobs = async () => {
            if (!isContactModalOpen || !userData?.userId) return;

            try {
                setLoadingJobs(true);
                setJobsError(null);
                const token = localStorage.getItem('authToken');
                const jobs = await fetchMyRequirements(
                    userData.userId,
                    currentPage,
                    itemsPerPage,
                    token
                );
                setUserJobs(jobs.jobs?.filter(job => job.jobStatus === 'Open') || []);
            } catch (err) {
                setJobsError(err.message || 'Failed to load your job postings');
            } finally {
                setLoadingJobs(false);
            }
        };

        fetchUserJobs();
    }, [isContactModalOpen, userData, currentPage, itemsPerPage]);

    const openContactModal = () => {
        setIsContactModalOpen(true);
    };

    const closeContactModal = () => {
        setIsContactModalOpen(false);
        setSelectedJob(null);
    };

    const handleContactProfessional = async () => {
        if (!selectedJob || !teacherId) return;
        
        try {
            setIsProcessing(true);
            setChatError(null);
            
            const token = localStorage.getItem('authToken');
            if (!token || !userData?.userId) {
                setChatError('Please login to connect with the teacher');
                return;
            }
            const firstFiveWords = selectedJob.jobRequirements.split(" ").slice(0, 5).join(" ");
            const payload = {
                coins: selectedJob.coins,
                reason: `For contacting Professional ${teacher.displayName} regarding job# ${selectedJob.jobId}-${firstFiveWords}`,
                jobId: selectedJob.jobId
            };

            logger.debug('ViewTeacherProfile: Deducting coins with payload:', payload);
            const response = await deductCoinsClient(teacherId, userData?.userId, payload, token);
            logger.debug('ViewTeacherProfile: Deduct coins response:', response);
            
            if (response.headers.responseCode === 200 || response.headers.responseCode === 409) {
                            logger.debug('ViewTeacherProfile: Coins deducted successfully, opening chat');
            logger.debug('ViewTeacherProfile: Teacher data:', teacher);
            logger.debug('ViewTeacherProfile: Chat job data:', {
                jobId: selectedJob.jobId,
                subjects: selectedJob.subjects,
                teacherId: teacherId,
                teacherUserId: teacher.userId // This should be the actual userId of the teacher
            });
            setChatJobData({
                jobId: selectedJob.jobId,
                subjects: selectedJob.subjects,
                teacherUserId: teacher.userId // Pass the teacher's actual userId
            });
            setShowChat(true);
            closeContactModal();
            } else {
                logger.debug('ViewTeacherProfile: Failed to deduct coins:', response.headers.customerMessage);
                setChatError(response.headers.customerMessage || 'Failed to deduct coins. Please try again.');
            }
        } catch (error) {
            logger.error('Error deducting coins:', error);
            setChatError(error.response?.data?.headers?.customerMessage || 'An error occurred while processing your request.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                    <p className="text-gray-600 text-lg">Loading professional profile...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">Error Loading Profile</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg transform hover:scale-105 flex items-center mx-auto"
                    >
                        <FiArrowLeft className="mr-2" /> Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (!teacher) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
                    <div className="text-gray-400 text-6xl mb-4">
                        <FaChalkboardTeacher className="inline-block" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">Professional Not Found</h2>
                    <p className="text-gray-600 mb-6">The requested professional profile could not be found.</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg transform hover:scale-105 flex items-center mx-auto"
                    >
                        <FiArrowLeft className="mr-2" /> Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
            {/* Error Modal */}
            {chatError && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
                        <div className="flex items-center mb-4">
                            <div className="bg-red-100 p-3 rounded-full mr-4">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Error</h3>
                        </div>
                        <div className="mt-2">
                            <p className="text-sm text-gray-600">{chatError}</p>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setChatError(null)}
                                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ContactProfessionalModal
                isOpen={isContactModalOpen}
                onClose={closeContactModal}
                loadingJobs={loadingJobs}
                jobsError={jobsError}
                userJobs={userJobs}
                selectedJob={selectedJob}
                onSelectJob={(jobId) => {
                    const job = userJobs.find(j => j.jobId.toString() === jobId);
                    setSelectedJob(job || null);
                }}
                isProcessing={isProcessing}
                onContact={handleContactProfessional}
                professionalName={teacher?.displayName}
            />

            {/* Chat Modal */}
            {showChat && teacherId && userData && chatJobData && teacher && (
                <ChatModal
                  isOpen={showChat}
                  receiverId={teacher.userId}
                  jobId={chatJobData.jobId}
                  onClose={() => {
                    setShowChat(false);
                    setChatJobData(null);
                  }}
                  initialMessage={`Hi, I'm interested in your tutoring services for my ${chatJobData.subjects} requirement`}
                  senderType="student"
                />
            )}

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Enhanced Header */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors group"
                        >
                            <FiArrowLeft className="mr-2 transition-transform group-hover:-translate-x-1" /> 
                            Back to Professionals
                        </button>
                        <div className="flex items-center space-x-4">
                            <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                <FaHeart className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                                <FaShare className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <ViewTeacherProfileSidebar
                        teacher={teacher}
                        imageError={imageError}
                        setImageError={setImageError}
                        openContactModal={openContactModal}
                    />
                    <ViewTeacherProfileMainPanel
                        teacher={teacher}
                        imageError={imageError}
                        setImageError={setImageError}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                    />
                </div>
            </div>
        </div>
    );
};

export default ViewTeacherProfile;
import React, { useState, useEffect } from "react";
import Footer from '../shared/Footer';
import { fetchTeacherProfile } from '../../components/services/teacherProfile';
import { fetchTeacherEducation } from '../../components/services/teacherEducationProfile';
import { fetchTeacherExperience } from "../../components/services/teacherExperienceProfile";
import { fetchTeachingDetails } from "../../components/services/teachingDetailsProfile";
import { fetchSubjectExperience } from "../../components/services/teacherSubjectsProfile";
import { useAuthStore } from '../../store/useAuthStore';
import logger from '../../utils/logger';
import { ProfileEditModal } from './teacherProfile/ProfileEditModal';
import { EducationEditModal } from './teacherProfile/EducationEditModal';
import { ExperienceEditModal } from './teacherProfile/ExperienceEditModal';
import { TeachingDetailsEditModal } from './teacherProfile/TeachingDetailsEditModal';
import { TeacherProfileMainContent } from './teacherProfile/TeacherProfileMainContent';
import { fetchWithTimeout } from './teacherProfile/fetchWithTimeout';
import { useTeacherProfileSaves } from './teacherProfile/useTeacherProfileSaves';

export default function TeacherProfile() {
  const [userProfile, setUserProfile] = useState({
    userId: '',
    displayName: '',
    gender: '',
    birthdate: '',
    location: '',
    postalCode: '',
    phoneNumber: '',
    profileDescription: '',
    imagePath: '',
  });

  const [educationList, setEducationList] = useState([]);
  const [experienceList, setExperienceList] = useState([]);
  const [teachingDetails, setTeachingDetails] = useState({
    teacherId: '',
    rate: "hourly",
    maxFee: 0,
    minFee: 0,
    paymentDetails: "",
    totalExpYears: 0,
    onlineExpYears: 0,
    travelWillingness: false,
    travelDistance: 0,
    onlineAvailability: false,
    homeAvailability: false,
    homeworkHelp: false,
    currentlyEmployed: false,
    workPreference: "",
  });
  const [subjects, setSubjects] = useState([]);
  
  // Modal states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [showTeachingModal, setShowTeachingModal] = useState(false);
  const [currentEducationIndex, setCurrentEducationIndex] = useState(null);
  const [currentExperienceIndex, setCurrentExperienceIndex] = useState(null);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [loadingSections, setLoadingSections] = useState({
    profile: true,
    education: true,
    experience: true,
    teaching: true,
    subjects: true
  });
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [saveLoading, setSaveLoading] = useState({ profile: false, education: false, experience: false, teaching: false });

  // Get user from auth store
  const authUser = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  const { saveProfile, saveEducation, saveExperience, saveTeachingDetails } = useTeacherProfileSaves({
    token,
    userProfile,
    setUserProfile,
    educationList,
    setEducationList,
    currentEducationIndex,
    setCurrentEducationIndex,
    setShowEducationModal,
    experienceList,
    setExperienceList,
    currentExperienceIndex,
    setCurrentExperienceIndex,
    setShowExperienceModal,
    teachingDetails,
    setTeachingDetails,
    setShowTeachingModal,
    setShowProfileModal,
    setSaveLoading,
    setNotification,
  });

  // Move fetchProfileData outside useEffect
  const fetchProfileData = async () => {
    if (!token || !authUser?.userId) {
      setError('No authentication token or user data found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Use userId from auth store instead of fetching again
      const userId = authUser.userId;
      
      // Fetch critical data first (profile)
      const teacherProfile = await fetchWithTimeout(() => fetchTeacherProfile(userId, token));
      
      setUserProfile({
        userId: teacherProfile.userId,
        displayName: teacherProfile.displayName || '',
        gender: teacherProfile.gender || '',
        birthdate: teacherProfile.birthdate || '',
        location: teacherProfile.location || '',
        postalCode: teacherProfile.postalCode || '',
        phoneNumber: teacherProfile.phoneNumber || '',
        profileDescription: teacherProfile.profileDescription || '',
        imagePath: teacherProfile.imagePath || '',
      });
      setLoadingSections(prev => ({ ...prev, profile: false }));

      // Fetch remaining data in parallel with individual error handling
      const fetchPromises = [
        // Education
        fetchWithTimeout(() => fetchTeacherEducation(userId, token))
          .then(data => {
            setEducationList((data || []).map(edu => ({
              educationId: edu.educationId,
              institutionName: edu.institutionName || '',
              degreeType: edu.degreeType || 'Bachelor',
              degreeName: edu.degreeName || '',
              startDate: edu.startDate || '',
              endDate: edu.endDate || '',
              association: edu.association || "Full-time",
              specialization: edu.specialization || '',
              score: edu.score || 0
            })));
            setLoadingSections(prev => ({ ...prev, education: false }));
          })
          .catch(() => {
            setEducationList([]);
            setLoadingSections(prev => ({ ...prev, education: false }));
          }),

        // Experience
        fetchWithTimeout(() => fetchTeacherExperience(userId, token))
          .then(data => {
            setExperienceList((data || []).map(exp => ({
              experienceId: exp.experienceId,
              organizationName: exp.organizationName || '',
              organizationUrl: exp.organizationUrl || "#",
              designation: exp.designation || '',
              jobDescription: exp.jobDescription || "No description provided",
              startDate: exp.startDate || '',
              endDate: exp.endDate || '',
              association: exp.association || "Full-time",
              skills: exp.skills || [],
              currentJob: exp.currentJob || false
            })));
            setLoadingSections(prev => ({ ...prev, experience: false }));
          })
          .catch(() => {
            setExperienceList([]);
            setLoadingSections(prev => ({ ...prev, experience: false }));
          }),

        // Professional Details
        fetchWithTimeout(() => fetchTeachingDetails(userId, token))
          .then(data => {
            if (data) {
              setTeachingDetails({
                teacherId: data.teacherId,
                rate: data.rate || "hourly",
                maxFee: data.maxFee || 0,
                minFee: data.minFee || 0,
                paymentDetails: data.paymentDetails || "",
                totalExpYears: data.totalExpYears || 0,
                onlineExpYears: data.onlineExpYears || 0,
                travelWillingness: data.travelWillingness || false,
                travelDistance: data.travelDistance || 0,
                onlineAvailability: data.onlineAvailability || false,
                homeAvailability: data.homeAvailability || false,
                homeworkHelp: data.homeworkHelp || false,
                currentlyEmployed: data.currentlyEmployed || false,
                workPreference: data.workPreference || "",
              });
            }
            setLoadingSections(prev => ({ ...prev, teaching: false }));
          })
          .catch(() => {
            setLoadingSections(prev => ({ ...prev, teaching: false }));
          }),

        // Subjects
        fetchWithTimeout(() => fetchSubjectExperience(userId, token))
          .then(data => {
            setSubjects(data.subjects || []);
            setLoadingSections(prev => ({ ...prev, subjects: false }));
          })
          .catch(() => {
            setSubjects([]);
            setLoadingSections(prev => ({ ...prev, subjects: false }));
          })
      ];

      await Promise.allSettled(fetchPromises);
      setLoading(false);
    } catch (err) {
      logger.error("Error fetching profile data:", err);
      setError(err.message || "Failed to load profile data");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && authUser?.userId) {
      fetchProfileData();
    } else if (!token) {
      setLoading(false);
      setError('No authentication token available. Please login again.');
    } else if (!authUser?.userId) {
      setLoading(false);
      setError('User data not available. Please login again.');
    } else {
      setLoading(false);
      setError('No authentication data available');
    }
  }, [token, authUser?.userId]);

  // Add loading and error states to the return
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="sticky top-0 z-10">
        </div>
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile data...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="sticky top-0 z-10">
        </div>
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center text-red-500">
            <p>Error loading profile: {error}</p>
            <button 
              onClick={() => fetchProfileData()}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Keep all the modal handlers the same
  const openProfileModal = () => setShowProfileModal(true);
  const openEducationModal = (index = null) => {
    setCurrentEducationIndex(index);
    setShowEducationModal(true);
  };
  const openExperienceModal = (index = null) => {
    setCurrentExperienceIndex(index);
    setShowExperienceModal(true);
  };
  const openTeachingModal = () => setShowTeachingModal(true);

  // The rest of your component remains the same
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar at the top */}
      <div className="sticky top-0 z-10">
      </div>
      
      {/* Main content */}
      <main className="flex-grow">
        <TeacherProfileMainContent
          userProfile={userProfile}
          educationList={educationList}
          experienceList={experienceList}
          subjects={subjects}
          teachingDetails={teachingDetails}
          openProfileModal={openProfileModal}
          openEducationModal={openEducationModal}
          openExperienceModal={openExperienceModal}
          openTeachingModal={openTeachingModal}
        />
      </main>
      
      {/* Footer at the bottom */}
      <Footer />

      {/* Enhanced Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 max-w-sm w-full ${
          notification.type === 'success' 
            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
            : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
        } rounded-2xl shadow-2xl border border-white/20 backdrop-blur-sm p-6 transform transition-all duration-500 ease-out animate-in slide-in-from-right-full`}>
          <div className="flex items-start">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
              notification.type === 'success' ? 'bg-green-400' : 'bg-red-400'
            }`}>
              {notification.type === 'success' ? (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <h4 className={`text-lg font-bold mb-1 ${
                notification.type === 'success' ? 'text-green-100' : 'text-red-100'
              }`}>
                {notification.type === 'success' ? 'Success!' : 'Error!'}
              </h4>
              <p className="text-white/90 leading-relaxed">
                {notification.message}
              </p>
            </div>
            <button 
              onClick={() => setNotification(null)}
              className="ml-4 text-white/70 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showProfileModal && (
        <ProfileEditModal
          profile={userProfile}
          onClose={() => setShowProfileModal(false)}
          onSave={saveProfile}
          saveLoading={saveLoading.profile}
        />
      )}

      {showEducationModal && (
        <EducationEditModal
          education={currentEducationIndex !== null ? educationList[currentEducationIndex] : {
            institutionName: "",
            degreeType: "Bachelor",
            degreeName: "",
            startDate: "",
            endDate: "",
            association: "Full-time",
            specialization: "",
            score: 0,
          }}
          onClose={() => setShowEducationModal(false)}
          onSave={saveEducation}
          saveLoading={saveLoading.education}
        />
      )}

      {showExperienceModal && (
       <ExperienceEditModal
       experience={currentExperienceIndex !== null ? experienceList[currentExperienceIndex] : {
         organizationName: "",
         organizationUrl: "",
         designation: "",
         startDate: "",
         endDate: "",
         association: "Full-time",
         jobDescription: "",
         skills: [],
         currentJob: false,
       }}
       onClose={() => setShowExperienceModal(false)}
       onSave={saveExperience}
       currentExperienceIndex={currentExperienceIndex}
       saveLoading={saveLoading.experience}
     />
      )}

      {showTeachingModal && (
        <TeachingDetailsEditModal
          details={teachingDetails}
          onClose={() => setShowTeachingModal(false)}
          onSave={saveTeachingDetails}
          saveLoading={saveLoading.teaching}
        />
      )}
    </div>
  );
}

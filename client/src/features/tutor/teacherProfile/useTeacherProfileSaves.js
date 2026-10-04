import { fetchTeacherProfile, updateTeacherProfile } from '../../../components/services/teacherProfile';
import { fetchTeacherEducation, updateTeacherEducation, createTeacherEducation } from '../../../components/services/teacherEducationProfile';
import { fetchTeacherExperience, updateTeacherExperience, createTeacherExperience } from '../../../components/services/teacherExperienceProfile';
import { fetchTeachingDetails, updateTeachingDetails } from '../../../components/services/teachingDetailsProfile';
import { fetchWithTimeout } from './fetchWithTimeout';

export function useTeacherProfileSaves({
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
}) {
  const saveProfile = async (data) => {
    setSaveLoading((prev) => ({ ...prev, profile: true }));
    try {
      if (!token) throw new Error('No authentication token found');
      await updateTeacherProfile(
        userProfile.userId,
        {
          birthdate: data.birthdate,
          location: data.location,
          postalCode: data.postalCode,
          phoneNumber: data.phoneNumber,
          profileDescription: data.profileDescription,
        },
        token
      );
      const teacherProfile = await fetchWithTimeout(() => fetchTeacherProfile(userProfile.userId, token));
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
      setShowProfileModal(false);
      setNotification({ type: 'success', message: 'Profile updated successfully!' });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({ type: 'error', message: `Error updating profile: ${error.message}` });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setSaveLoading((prev) => ({ ...prev, profile: false }));
    }
  };

  const saveEducation = async (data) => {
    setSaveLoading((prev) => ({ ...prev, education: true }));
    try {
      if (!token) throw new Error('No authentication token found');
      if (currentEducationIndex !== null) {
        const educationToUpdate = educationList[currentEducationIndex];
        await updateTeacherEducation(
          educationToUpdate.educationId,
          userProfile.userId,
          {
            institutionName: data.institutionName,
            degreeType: data.degreeType,
            degreeName: data.degreeName,
            startDate: data.startDate,
            endDate: data.endDate,
            association: data.association,
            specialization: data.specialization,
            score: data.score,
          },
          token
        );
        setNotification({ type: 'success', message: 'Education updated successfully!' });
      } else {
        await createTeacherEducation(
          userProfile.userId,
          {
            institutionName: data.institutionName,
            degreeType: data.degreeType,
            degreeName: data.degreeName,
            startDate: data.startDate,
            endDate: data.endDate,
            association: data.association,
            specialization: data.specialization,
            score: data.score,
          },
          token
        );
        setNotification({ type: 'success', message: 'Education added successfully!' });
      }
      const educationData = await fetchWithTimeout(() => fetchTeacherEducation(userProfile.userId, token));
      setEducationList(
        (educationData || []).map((edu) => ({
          educationId: edu.educationId,
          institutionName: edu.institutionName || '',
          degreeType: edu.degreeType || 'Bachelor',
          degreeName: edu.degreeName || '',
          startDate: edu.startDate || '',
          endDate: edu.endDate || '',
          association: edu.association || 'Full-time',
          specialization: edu.specialization || '',
          score: edu.score || 0,
        }))
      );
      setShowEducationModal(false);
      setCurrentEducationIndex(null);
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({ type: 'error', message: `Error saving education: ${error.message}` });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setSaveLoading((prev) => ({ ...prev, education: false }));
    }
  };

  const saveExperience = async (data) => {
    setSaveLoading((prev) => ({ ...prev, experience: true }));
    try {
      if (!token) throw new Error('No authentication token found');
      if (currentExperienceIndex !== null) {
        const experienceToUpdate = experienceList[currentExperienceIndex];
        await updateTeacherExperience(
          experienceToUpdate.experienceId,
          userProfile.userId,
          {
            organizationName: data.organizationName,
            designation: data.designation,
            association: data.association,
            startDate: data.startDate,
            endDate: data.currentJob ? null : data.endDate,
            jobDescription: data.jobDescription,
            currentJob: data.currentJob,
            organizationUrl: data.organizationUrl,
            skills: data.skills,
          },
          token
        );
        setNotification({ type: 'success', message: 'Experience updated successfully!' });
      } else {
        await createTeacherExperience(
          userProfile.userId,
          {
            organizationName: data.organizationName,
            designation: data.designation,
            startDate: data.startDate,
            endDate: data.currentJob ? null : data.endDate,
            association: data.association,
            jobDescription: data.jobDescription,
            currentJob: data.currentJob,
            organizationUrl: data.organizationUrl,
            skills: data.skills,
          },
          token
        );
        setNotification({ type: 'success', message: 'Experience added successfully!' });
      }
      const experienceData = await fetchWithTimeout(() => fetchTeacherExperience(userProfile.userId, token));
      setExperienceList(
        (experienceData || []).map((exp) => ({
          experienceId: exp.experienceId,
          organizationName: exp.organizationName || '',
          organizationUrl: exp.organizationUrl || '#',
          designation: exp.designation || '',
          jobDescription: exp.jobDescription || 'No description provided',
          startDate: exp.startDate || '',
          endDate: exp.endDate || '',
          association: exp.association || 'Full-time',
          skills: exp.skills || [],
          currentJob: exp.currentJob || false,
        }))
      );
      setShowExperienceModal(false);
      setCurrentExperienceIndex(null);
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({ type: 'error', message: `Error saving experience: ${error.message}` });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setSaveLoading((prev) => ({ ...prev, experience: false }));
    }
  };

  const saveTeachingDetails = async (data) => {
    setSaveLoading((prev) => ({ ...prev, teaching: true }));
    try {
      if (!token) throw new Error('No authentication token found');
      const updateData = {
        rate: data.rate,
        maxFee: Number(data.maxFee),
        minFee: Number(data.minFee),
        paymentDetails: data.paymentDetails || '',
        totalExpYears: Number(data.totalExpYears),
        onlineExpYears: Number(data.onlineExpYears),
        travelWillingness: data.travelWillingness,
        travelDistance: Number(data.travelDistance || 0),
        onlineAvailability: data.onlineAvailability,
        homeAvailability: data.homeAvailability,
        homeworkHelp: data.homeworkHelp,
        currentlyEmployed: data.currentlyEmployed,
        workPreference: data.workPreference,
      };
      const teachingDetailsId = teachingDetails.teacherId;
      await updateTeachingDetails(teachingDetailsId, userProfile.userId, updateData, token);
      setNotification({ type: 'success', message: 'Professional details updated successfully!' });
      const teachingDetailsData = await fetchWithTimeout(() => fetchTeachingDetails(userProfile.userId, token));
      if (teachingDetailsData) {
        setTeachingDetails({
          teacherId: teachingDetailsData.teacherId,
          rate: teachingDetailsData.rate || 'hourly',
          maxFee: teachingDetailsData.maxFee || 0,
          minFee: teachingDetailsData.minFee || 0,
          paymentDetails: teachingDetailsData.paymentDetails || '',
          totalExpYears: teachingDetailsData.totalExpYears || 0,
          onlineExpYears: teachingDetailsData.onlineExpYears || 0,
          travelWillingness: teachingDetailsData.travelWillingness || false,
          travelDistance: teachingDetailsData.travelDistance || 0,
          onlineAvailability: teachingDetailsData.onlineAvailability || false,
          homeAvailability: teachingDetailsData.homeAvailability || false,
          homeworkHelp: teachingDetailsData.homeworkHelp || false,
          currentlyEmployed: teachingDetailsData.currentlyEmployed || false,
          workPreference: teachingDetailsData.workPreference || '',
        });
      }
      setShowTeachingModal(false);
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({ type: 'error', message: `Error updating teaching details: ${error.message}` });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setSaveLoading((prev) => ({ ...prev, teaching: false }));
    }
  };

  return { saveProfile, saveEducation, saveExperience, saveTeachingDetails };
}

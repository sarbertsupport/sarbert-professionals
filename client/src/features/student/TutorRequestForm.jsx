import React, { useState, useEffect } from 'react';
import postTutorRequest from '../../services.js';
import logger from '../../utils/logger';
import { fetchUserProfile } from '../../components/services/authProfile';
import SkeletonTutorRequestForm from '../shared/SkeletonTutorRequestForm';
import ErrorBanner from '../shared/ErrorBanner';
import { useNotificationStore } from '../../store/useNotificationStore';
import { validateTutorRequest } from './tutorRequest/validateTutorRequest';
import { TutorRequestSidebar } from './tutorRequest/TutorRequestSidebar';
import { TutorRequestFormPageIntro } from './tutorRequest/TutorRequestFormPageIntro';
import { TutorRequestFormMainPanel } from './tutorRequest/TutorRequestFormMainPanel';

function TutorRequestForm() {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    location: '',
    phone: '',
    countryCode: '+254',
    requirements: '',
    subjects: '',
    level: '',
    meetingOption: [],
    budget: '',
    rate: 'Per Hour',
    genderPreference: 'None',
    tutorCount: 'Only One',
    partTime: 'Part Time',
    languages: '',
    jobCategory: 'Education & Training',
    iWant: 'Help with Homework'
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep] = useState(1);
  const addNotification = useNotificationStore((state) => state.addNotification);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No access token found');
        }
        
        const userData = await fetchUserProfile(token);
        if (userData && userData.userId) {
          setUserId(userData.userId);
        } else {
          throw new Error('User ID not found in profile');
        }
      } catch (error) {
        logger.error('Failed to fetch user ID:', error);
        addNotification({ type: 'error', message: 'Failed to load user information. Please log in again.' });
      } finally {
        setLoading(false);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    let interval;
    if (isSubmitting) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return 90;
          return prev + 5;
        });
      }, 300);
    } else {
      setProgress(0);
    }
    return () => clearInterval(interval);
  }, [isSubmitting]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prevState => ({
        ...prevState,
        meetingOption: checked
          ? [...prevState.meetingOption, value]
          : prevState.meetingOption.filter(option => option !== value)
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const handleSelectChange = (selectedOption, { name }) => {
    setFormData(prevState => ({
      ...prevState,
      [name]: selectedOption ? selectedOption.value : ''
    }));
  };

  const validateForm = () => validateTutorRequest(formData);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userId) {
      addNotification({ type: 'error', message: 'User information not available. Please log in again.' });
      return;
    }

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setProgress(10);
    
    try {
      const response = await postTutorRequest(formData, userId);
      setProgress(100);

      if (response) {
        if (response.ok) {
          setMessage({
            text: response.headers?.customerMessage || 'Tutoring request posted successfully!',
            type: 'success'
          });
          setFormData({
            location: '',
            phone: '',
            countryCode: '+254',
            requirements: '',
            subjects: '',
            level: '',
            meetingOption: [],
            budget: '',
            rate: 'Per Hour',
            genderPreference: 'None',
            tutorCount: 'Only One',
            partTime: 'Part Time',
            languages: '',
            jobCategory: 'Education & Training',
            iWant: 'Help with Homework'
          });
          setErrors({});
        } else {
          addNotification({ type: 'error', message: response.headers?.customerMessage || response.body?.message || 'Request completed but with some issues' });
        }
      } else {
        addNotification({ type: 'error', message: 'No response received from server' });
      }
    } catch (error) {
      setProgress(0);
      addNotification({ type: 'error', message: 'An unexpected error occurred while submitting your request.' });
      logger.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <SkeletonTutorRequestForm />;
  }

  if (!userId && message.type === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="w-full max-w-md">
          <ErrorBanner message={message.text} onRetry={() => window.location.reload()} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <TutorRequestFormPageIntro currentStep={currentStep} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <TutorRequestSidebar />
          <TutorRequestFormMainPanel
            message={message}
            formData={formData}
            errors={errors}
            handleSubmit={handleSubmit}
            handleChange={handleChange}
            handleSelectChange={handleSelectChange}
            isSubmitting={isSubmitting}
            progress={progress}
          />
        </div>
      </div>
    </div>
  );
}

export default TutorRequestForm;

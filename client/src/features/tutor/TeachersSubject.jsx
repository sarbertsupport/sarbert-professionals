import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { FiArrowRight, FiArrowLeft, FiCheck } from 'react-icons/fi';
import validateSubject from '../../components/services/ValidateSubject';
import { saveSubjectDetails } from '../../components/services/subjectService';
import { fetchUserProfile } from '../../components/services/authProfile';
import { getTeacherDetailsByUserId } from '../../components/services/displayTeacherId';
import { useNavigate } from "react-router-dom";
import logger from '../../utils/logger';

const TeachersSubject = () => {
  const [formData, setFormData] = useState({
    userId: null,
    teacherId: null,
    selectedSubject: null
  });
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [savedSubjects, setSavedSubjects] = useState([]);
  const navigate = useNavigate();
  const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL || "http://localhost:8089";

  // Load user profile and teacher ID
  useEffect(() => {
    const loadUserProfileAndTeacherId = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const profile = await fetchUserProfile(token);
        const userId = profile.userId;

        setFormData((prevData) => ({
          ...prevData,
          userId: userId,
        }));

        const teacherResponse = await getTeacherDetailsByUserId(userId);

        if (teacherResponse.success) {
          setFormData((prevData) => ({
            ...prevData,
            teacherId: teacherResponse.teacher.teacherId,
          }));
        } else {
          setMessage({
            type: "error",
            text: teacherResponse.error || "Failed to load teacher details.",
          });
        }
      } catch (error) {
        setMessage({
          type: "error",
          text: "Failed to load user profile or teacher details.",
        });
      }
    };

    loadUserProfileAndTeacherId();
  }, []);

  // Load subject options
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch(`${BACKEND_BASE_URL}/api/v1/subjects/all`);
        const data = await response.json();
        const options = data.body.data.map(subject => ({
          value: subject.subjectId,
          label: subject.subjectName,
        }));
        setSubjectOptions(options);
      } catch (error) {
        logger.error("Error fetching subjects:", error);
        setMessage({
          type: "error",
          text: "Failed to load subject options. Please try again later.",
        });
      }
    };

    fetchSubjects();
  }, []);

  // Progress indicator effect
  useEffect(() => {
    let interval;
    if (isSubmitting) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return 90; // Cap at 90% until submission completes
          return prev + 10;
        });
      }, 300);
    } else {
      setProgress(0);
    }

    return () => clearInterval(interval);
  }, [isSubmitting]);

  const handleChange = (selectedOption) => {
    setFormData((prevData) => ({
      ...prevData,
      selectedSubject: selectedOption,
    }));
    if (errors.selectedSubject) {
      const { selectedSubject, ...rest } = errors;
      setErrors(rest);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    logger.debug("handling skill")
    setIsSubmitting(true);
    setProgress(10); // Start progress
    
    const validationErrors = validateSubject({ selectedSubject: formData.selectedSubject });
    setErrors(validationErrors);
    logger.debug(validationErrors);
    logger.debug("skils okay? ",Object.keys(validationErrors).length > 0)
    if (Object.keys(validationErrors).length > 0) {
      setProgress(0);
      setIsSubmitting(false);
      return;
    }

    try {
      logger.debug("about to call save")
      const response = await saveSubjectDetails({
        teacherId: formData.teacherId,
        userId: formData.userId,
        subjectId: formData.selectedSubject.value,
      });
      logger.debug("response ",response)

      if (!response.success) {
        if (response.error?.includes("The number of subjects cannot exceed")) {
          setMessage({ type: "error", text: response.error });
          setTimeout(() => {
            navigate("/details");
          }, 3000);
        } else {
          setMessage({
            type: "error",
            text: response.error || "Failed to save subject details",
          });
        }
      } else {
        setMessage({
          type: "success",
          text: `${formData.selectedSubject.label} saved successfully`,
        });
        setSavedSubjects([...savedSubjects, formData.selectedSubject]);
        setFormData(prev => ({
          ...prev,
          selectedSubject: null
        }));
      }
    } catch (error) {
      logger.error("Error saving subject details:", error);
      setMessage({
        type: "error",
        text: "An error occurred while saving subject",
      });
    } finally {
      setProgress(100);
      setTimeout(() => setIsSubmitting(false), 500);
    }
  };

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: '50px',
      borderColor: errors.selectedSubject ? '#ef4444' : state.isFocused ? '#3b82f6' : '#d1d5db',
      boxShadow: state.isFocused && !errors.selectedSubject ? '0 0 0 1px #3b82f6' : 'none',
      '&:hover': {
        borderColor: errors.selectedSubject ? '#ef4444' : '#9ca3af'
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#1e40af',
      fontWeight: '500',
    }),
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-700">
            <h2 className="text-2xl font-bold text-white">Professional Expertise</h2>
            <p className="mt-1 text-sm text-blue-100">Add skills you're qualified to teach (one at a time)</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {message && (
              <div
                className={`mb-6 p-4 rounded-md ${
                  message.type === "error" 
                    ? "bg-red-50 text-red-700 border border-red-200" 
                    : "bg-green-50 text-green-700 border border-green-200"
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="mb-6">
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Skills <span className="text-red-500">*</span>
              </label>
              <Select
                id="subject"
                name="subject"
                options={subjectOptions.filter(option => 
                  !savedSubjects.some(saved => saved.value === option.value)
                )}
                value={formData.selectedSubject}
                onChange={handleChange}
                placeholder="Search and select a subject..."
                className="basic-single-select"
                classNamePrefix="select"
                styles={customStyles}
                noOptionsMessage={() => "No subjects found"}
                isClearable
              />
              {errors.selectedSubject && (
                <p className="mt-2 text-sm text-red-600">{errors.selectedSubject}</p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                Select one skill at a time. You can add multiple skills by saving each one individually.
              </p>
              <p className="mt-2 text-sm text-blue-600 font-medium">
                ⚠️ You need to add at least 5 skills to proceed to the next step.
              </p>
            </div>

            {savedSubjects.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Saved Subjects:</h3>
                <div className="flex flex-wrap gap-2">
                  {savedSubjects.map((subject, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium"
                    >
                      {subject.label}
                      <FiCheck className="ml-1" />
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col items-end space-y-4 border-t pt-6">
              {isSubmitting && (
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              )}
              
              <button
                type="submit"
                disabled={isSubmitting || !formData.selectedSubject}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving... ({progress}%)
                  </>
                ) : (
                  <>
                    {savedSubjects.length > 0 ? 'Add Another Subject' : 'Save Subject'}
                    <FiArrowRight className="ml-2" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeachersSubject;
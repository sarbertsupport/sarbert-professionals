import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveStudentProfile } from '../../components/services/studentProfile';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { FiPhone } from 'react-icons/fi';
import { FiCheckCircle } from 'react-icons/fi';
import StudentProfileValidation from '../../components/services/StudentProfileValidation';
import SkeletonBioDataForm from '../shared/SkeletonBioDataForm';
import ErrorBanner from '../shared/ErrorBanner';
import { useAuthStore } from '../../store/useAuthStore';
import { useNotificationStore } from '../../store/useNotificationStore';

const StudentBioData = () => {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const userId = user?.userId || '';
    const [formData, setFormData] = useState({
        userId: userId,
        fullName: '',
        gender: '',
        birthdate: '',
        location: '',
        postalCode: '',
        phoneNumber: '',
        bio: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState(null);
    const [errors, setErrors] = useState({});
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const addNotification = useNotificationStore((state) => state.addNotification);
    
    // Remove effect that fetches user profile for userId
    // Update formData.userId if userId changes
    useEffect(() => {
        setFormData((prev) => ({ ...prev, userId }));
    }, [userId]);

    // Progress indicator effect
    useEffect(() => {
        let interval;
        if (isSubmitting) {
            interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 90) return 90; // Cap at 90% until submission completes
                    return prev + 5;
                });
            }, 300);
        } else {
            setProgress(0);
        }
        return () => clearInterval(interval);
    }, [isSubmitting]);

    useEffect(() => {
        let timer;
        if (showSuccessModal) {
            timer = setTimeout(() => {
                navigate('/studentdashboard');
            }, 5000);
        }
        return () => clearTimeout(timer);
    }, [showSuccessModal, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setErrors(prev => ({ ...prev, [name]: undefined }));
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.userId) {
            addNotification({ type: 'error', message: "User information not loaded. Please wait or refresh the page." });
            return;
        }

        setIsSubmitting(true);
        setProgress(10); // Start progress
        const validationErrors = StudentProfileValidation(formData);
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            try {
                const result = await saveStudentProfile(formData);
                setProgress(100); // Complete progress
                if (result.success) {
                    setShowSuccessModal(true);
                } else {
                    addNotification({ type: 'error', message: result.error || "Failed to save profile" });
                }
            } catch (error) {
                setProgress(0);
                addNotification({ type: 'error', message: error.message || "An error occurred" });
            } finally {
                setIsSubmitting(false);
            }
        } else {
            setProgress(0);
            setIsSubmitting(false);
        }
    };

    const handleModalClose = () => {
        setShowSuccessModal(false);
        navigate('/studentdashboard');
    };

    if (!formData.userId && !message) {
        return <SkeletonBioDataForm />;
    }

    if (message && message.type === 'error') {
        return (
            <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
                <div className="w-full max-w-md">
                    <ErrorBanner message={message.text} onRetry={() => window.location.reload()} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="success-modal-title">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
                            <div>
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                                    <FiCheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="mt-3 text-center sm:mt-5">
                                    <h3 id="success-modal-title" className="text-lg leading-6 font-medium text-gray-900">
                                        Profile Completed Successfully!
                                    </h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            Congratulations on completing your profile! You can now post jobs, connect with professionals, 
                                            and access all features of SkillBridge.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-5 sm:mt-6">
                                <button
                                    type="button"
                                    onClick={handleModalClose}
                                    className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                                    autoFocus
                                >
                                    Okay, take me to Dashboard
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-2xl mx-auto">
                {/* Banner */}
                <div className="mb-6 bg-blue-50 border-l-4 border-blue-400 p-4">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-blue-700">
                                You're completing your profile on <strong>SkillBridge</strong> - Connecting students with opportunities
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6 sm:p-8">
                    <div className="mb-8 text-center">
                        <h2 className="text-2xl font-bold text-gray-800">Student Profile</h2>
                        <p className="text-gray-600 mt-2">
                            Tell us about yourself to complete your profile. This information helps us personalize your experience.
                        </p>
                    </div>

                    {message && (
                        <div className={`mb-6 p-4 rounded-lg ${
                            message.type === "error" 
                                ? "bg-red-50 text-red-700" 
                                : "bg-green-50 text-green-700"
                        }`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            {/* Full Name */}
                            <div className="sm:col-span-2">
                                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    id="fullName"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-md ${
                                        errors.fullName ? 'border-red-300' : 'border-gray-300'
                                    } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                    placeholder="Your full name"
                                />
                                {errors.fullName && (
                                    <p className="mt-1 text-sm text-red-600" role="alert" aria-live="polite">{errors.fullName}</p>
                                )}
                            </div>

                            {/* Gender */}
                            <div>
                                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                                    Gender
                                </label>
                                <select
                                    id="gender"
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-md ${
                                        errors.gender ? 'border-red-300' : 'border-gray-300'
                                    } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                    <option value="Prefer not to say">Prefer not to say</option>
                                </select>
                                {errors.gender && (
                                    <p className="mt-1 text-sm text-red-600" role="alert" aria-live="polite">{errors.gender}</p>
                                )}
                            </div>

                            {/* Birthdate */}
                            <div>
                                <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700 mb-1">
                                    Date of Birth
                                </label>
                                <input
                                    type="date"
                                    id="birthdate"
                                    name="birthdate"
                                    value={formData.birthdate}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-md ${
                                        errors.birthdate ? 'border-red-300' : 'border-gray-300'
                                    } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                />
                                {errors.birthdate && (
                                    <p className="mt-1 text-sm text-red-600" role="alert" aria-live="polite">{errors.birthdate}</p>
                                )}
                            </div>

                            {/* Location */}
                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                                    City/Region
                                </label>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-md ${
                                        errors.location ? 'border-red-300' : 'border-gray-300'
                                    } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                    placeholder="Your location"
                                />
                                {errors.location && (
                                    <p className="mt-1 text-sm text-red-600" role="alert" aria-live="polite">{errors.location}</p>
                                )}
                            </div>

                            {/* Postal Code */}
                            <div>
                                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                                    Postal/Zip Code
                                </label>
                                <input
                                    type="text"
                                    id="postalCode"
                                    name="postalCode"
                                    value={formData.postalCode}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-md ${
                                        errors.postalCode ? 'border-red-300' : 'border-gray-300'
                                    } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                    placeholder="Postal code"
                                />
                                {errors.postalCode && (
                                    <p className="mt-1 text-sm text-red-600" role="alert" aria-live="polite">{errors.postalCode}</p>
                                )}
                            </div>

                            {/* Phone Number */}
                            <div className="sm:col-span-2">
                                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number
                                </label>
                                <div className="mt-1 relative">
                                    <PhoneInput
                                        country={'us'}
                                        value={formData.phoneNumber}
                                        onChange={(phone) => {
                                            setErrors(prev => ({ ...prev, phoneNumber: undefined }));
                                            setFormData({ ...formData, phoneNumber: phone });
                                        }}
                                        inputProps={{
                                            name: "phoneNumber",
                                            id: "phoneNumber",
                                            className: `block w-full pl-12 py-2 rounded-md border ${
                                                errors.phoneNumber ? 'border-red-300' : 'border-gray-300'
                                            } shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm`,
                                        }}
                                        containerStyle={{
                                            width: '100%',
                                        }}
                                        inputStyle={{
                                            width: '100%',
                                            height: '38px',
                                            paddingLeft: '48px',
                                        }}
                                        buttonStyle={{
                                            height: '38px',
                                            border: errors.phoneNumber ? '1px solid #fca5a5' : '1px solid #d1d5db',
                                            borderRight: 'none',
                                            borderRadius: '0.375rem 0 0 0.375rem',
                                            backgroundColor: '#f9fafb',
                                        }}
                                        dropdownStyle={{
                                            borderRadius: '0.375rem',
                                            marginTop: '4px',
                                            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                                        }}
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                        <FiPhone className="h-5 w-5 text-gray-400" />
                                    </div>
                                </div>
                                {errors.phoneNumber && (
                                    <p className="mt-1 text-sm text-red-600" role="alert" aria-live="polite">{errors.phoneNumber}</p>
                                )}
                            </div>

                            {/* Bio */}
                            <div className="sm:col-span-2">
                                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                                    About You
                                </label>
                                <textarea
                                    id="bio"
                                    name="bio"
                                    rows={4}
                                    value={formData.bio}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-md ${
                                        errors.bio ? 'border-red-300' : 'border-gray-300'
                                    } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                    placeholder="Tell us about your academic interests, hobbies, or anything else you'd like to share..."
                                />
                                {errors.bio && (
                                    <p className="mt-1 text-sm text-red-600" role="alert" aria-live="polite">{errors.bio}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col items-end space-y-4">
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
                                disabled={isSubmitting}
                                aria-label="Save Profile"
                                className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
                                    isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
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
                                    'Save Profile'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default StudentBioData;
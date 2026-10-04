import React, { useState } from 'react';
import { FiArrowRight, FiArrowLeft  } from 'react-icons/fi';
import { fetchUserProfile } from "../services/authProfile";
import { getTeacherDetailsByUserId } from "../services/displayTeacherId";
const ExperienceForm = ({ onNext }) => {
  const [formData, setFormData] = useState({
    userId: null,
    teacherId:null,
    organizationName: '',
    designation: '',
    startDate: '',
    endDate: '',
    association: '',
    jobDescription: '',
    currentJob: false,
  });

  useEffect(() => {
    const loadUserProfileAndTeacherId = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const profile = await fetchUserProfile(token);
        const userId = profile.userId;
  
        // First set userId
        setFormData((prevData) => ({
          ...prevData,
          userId: userId,
        }));
  
        // Then fetch teacherId using userId
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData({ ...formData, [name]: val });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto mt-10 px-5">
      <h2 className="text-2xl font-bold mb-6">Experience Details</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="col-span-1">
          <div className="mb-4">
            <label htmlFor="organizationName" className="block text-lg font-medium text-gray-700">
              Organization Name
            </label>
            <input
              type="text"
              id="organizationName"
              name="organizationName"
              value={formData.organizationName}
              onChange={handleChange}
              className="mt-1 mr-2 border focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-lg border-gray-300 rounded-md"
              style={{ padding: '10px', height: '35px' }}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="designation" className="block text-lg font-medium text-gray-700">
              Designation
            </label>
            <input
              type="text"
              id="designation"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              className="mt-1 mr-2 border focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-lg border-gray-300 rounded-md"
              style={{ padding: '10px', height: '35px' }}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="startDate" className="block text-lg font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="mt-1 mr-2 border focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-lg border-gray-300 rounded-md"
              style={{ padding: '10px', height: '35px' }}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="endDate" className="block text-lg font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="mt-1 mr-2 border focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-lg border-gray-300 rounded-md"
              style={{ padding: '10px', height: '35px' }}
            />
          </div>
        </div>
        <div className="col-span-1">
          <div className="mb-4">
            <label htmlFor="association" className="block text-lg font-medium text-gray-700">
              Association
            </label>
            <select
              id="association"
              name="association"
              value={formData.association}
              onChange={handleChange}
              className="mt-1 mr-2 border focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-lg border-gray-300 rounded-md appearance-none"
              style={{ padding: '2px', height: '35px', backgroundColor: '#f7fafc' }}
            >
              <option value="">Please select</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="jobDescription" className="block text-lg font-medium text-gray-700">
              Job Description
            </label>
            <textarea
              id="jobDescription"
              name="jobDescription"
              value={formData.jobDescription}
              onChange={handleChange}
              rows="4"
              className="mt-1 mr-2 border focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-lg border-gray-300 rounded-md"
              style={{ padding: '10px' }}
            ></textarea>
          </div>
          <div className="mb-4">
            <label htmlFor="currentJob" className="flex items-center">
              <input
                type="checkbox"
                id="currentJob"
                name="currentJob"
                checked={formData.currentJob}
                onChange={handleChange}
                className="form-checkbox h-5 w-5 text-indigo-600"
              />
              <span className="ml-2 text-lg font-medium text-gray-700">Current Job</span>
            </label>
          </div>
        </div>
      </div>
      <div className="mb-4">
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Save and Continue <FiArrowRight className="mt-1 ml-3" size={24}/>
        </button>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Back <FiArrowLeft className="mt-1 ml-3" size={24}/>
        </button>
      </div>
    </form>
  );
};

export default ExperienceForm;

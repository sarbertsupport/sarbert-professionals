import React, { useState } from 'react';
import Menus from './Menus'; // Ensure this import is correct based on your project structure
import Select from 'react-select'; // Import the react-select component
import postTutorRequest from '../service/TutorRequestService';

// Options for the searchable country dropdown
import countryOptions from './countryOptions.json';
function TutorRequestForm() {
  const [formData, setFormData] = useState({
    location: '',
    phone: '',
    countryCode: '+1', // Default country code
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
    countryScope: 'All countries',
    tutorsNeeded: 'One Tutor',
    iWant: 'Help with Homework'
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ text: '', type: '' }); 

  
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

 // Validation function to check mandatory fields
 const validateForm = () => {
  const newErrors = {};
  const requiredFields = [
    'location', 'phone', 'requirements', 'subjects', 'level', 'budget', 
    'languages', 'meetingOption', 'countryScope', 'tutorsNeeded', 'iWant'
  ];

  requiredFields.forEach(field => {
    const value = formData[field];

    // Check if the field is a string and empty
    if (typeof value === 'string' && value.trim() === '') {
      newErrors[field] = 'This field is required';
    }

    // Check if the field is an array and empty
    else if (Array.isArray(value) && value.length === 0) {
      newErrors[field] = 'This field is required';
    }

    // Check if the field is undefined or null (for both strings and arrays)
    else if (!value) {
      newErrors[field] = 'This field is required';
    }
  });

  return newErrors;
};


const handleSubmit = async (e) => {
  e.preventDefault();
  const validationErrors = validateForm();
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  const result = await postTutorRequest(formData);
  if (result) {
    setMessage({
      text: 'Tutor request posted successfully!',
      type: 'success'
    });
    setFormData({
      location: '',
      phone: '',
      countryCode: '+1',
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
      countryScope: 'All countries',
      tutorsNeeded: 'One Tutor',
      iWant: 'Help with Homework',
    });
  } else {
    setMessage({
      text: 'Failed to post tutor request.',
      type: 'error'
    });
  }
};


  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Menus Component */}
      <Menus />

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-6 bg-white shadow-md mt-6 rounded-lg">
        <div className="text-center text-xl font-semibold text-gray-600 pb-4">
          Request Trainer
        </div>
       
        <div className="flex flex-col space-y-4">
          {/* Form Fields */}
          <div className="flex flex-col mb-4">
            <label htmlFor="location" className="block text-gray-700 text-sm font-medium mb-1">
              Location
            </label>
            <input
              type="text"
              name="location"
              id="location"
              value={formData.location}
              onChange={handleChange}
              className={`border ${errors.location ? 'border-red-500' : 'border-gray-300'} rounded-md py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:border-blue-500`}
             />
              {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
          
          </div>

          <div className="flex flex-col mb-4">
            <label htmlFor="phone" className="block text-gray-700 text-sm font-medium mb-1">
              Phone
            </label>
            <div className="flex space-x-2">
              <Select
                name="countryCode"
                value={countryOptions.find(option => option.value === formData.countryCode)}
                onChange={handleSelectChange}
                options={countryOptions}
                className="flex-1"
                classNamePrefix="react-select"
                placeholder="Select country"
              />
              <input
                type="text"
                name="phone"
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:border-blue-500`}
             />
              {errors.phone && <p className="text-red-500 text-sm">{errors.location}</p>}
          
            </div>
          </div>

          <div className="flex flex-col mb-4">
            <label htmlFor="requirements" className="block text-gray-700 text-sm font-medium mb-1">
              Details of your requirement(Do not share your Contacts)
            </label>
            <textarea
              name="requirements"
              id="requirements"
              rows="3"
              value={formData.requirements}
              onChange={handleChange}
              className={`border ${errors.requirements ? 'border-red-500' : 'border-gray-300'} rounded-md py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:border-blue-500`}
              />
               {errors.requirements && <p className="text-red-500 text-sm">{errors.location}</p>}
           
          </div>

          <div className="flex flex-col mb-4">
            <label htmlFor="subjects" className="block text-gray-700 text-sm font-medium mb-1">
              Subjects
            </label>
            <input
              type="text"
              name="subjects"
              id="subjects"
              value={formData.subjects}
              onChange={handleChange}
              className={`border ${errors.subjects ? 'border-red-500' : 'border-gray-300'} rounded-md py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:border-blue-500`}
              />
               {errors.subjects && <p className="text-red-500 text-sm">{errors.location}</p>}
           
          </div>

          <div className="flex flex-col mb-4">
            <label htmlFor="level" className="block text-gray-700 text-sm font-medium mb-1">
              Your level
            </label>
            <select
              name="level"
              id="level"
              value={formData.level}
              onChange={handleChange}
              className={`border ${errors.level ? 'border-red-500' : 'border-gray-300'} rounded-md py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:border-blue-500`}
              >
              <option value="Early Childhood Education">Early Childhood Education</option>
              <option value="Primary/Elementary Education">Primary/Elementary Education</option>
              <option value="Middle School/Junior High">Middle School/Junior High</option>
              <option value="High School/Secondary School">High School/Secondary School</option>
              <option value="Vocational/Technical Schools">Vocational/Technical Schools</option>
              <option value="Undergraduate/College">Undergraduate/College</option>
              <option value="Masters Degree">Masters Degree</option>
              <option value="Doctoral Degree-PhD">Doctoral Degree-PhD</option>
              <option value="Other">Other</option>
            </select>
            {errors.level && <p className="text-red-500 text-sm">{errors.level}</p>}
          </div>

          <div className="flex flex-col mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Meeting options
            </label>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="meetingOption"
                  id="online"
                  value="Online"
                  checked={formData.meetingOption.includes("Online")}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="online" className="text-sm">
                  Online
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="meetingOption"
                  id="atPlace"
                  value="At my place"
                  checked={formData.meetingOption.includes("At my place")}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="atPlace" className="text-sm">
                  At my place
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="meetingOption"
                  id="travel"
                  value="Travel to tutor"
                  checked={formData.meetingOption.includes("Travel to tutor")}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="travel" className="text-sm">
                  Travel to Trainer
                </label>
              </div>
            </div>
            {errors.meetingOption && <p className="text-red-500 text-sm">{errors.meetingOption}</p>}
         
          </div>

          {/* Budget and Rate in the same row */}
          <div className="flex space-x-4 mb-4">
            <div className="w-1/2">
              <label htmlFor="budget" className="block text-gray-700 text-sm font-medium mb-1">
                Budget
              </label>
              <input
                type="text"
                name="budget"
                id="budget"
                value={formData.budget}
                onChange={handleChange}
                className={`border ${errors.budget ? 'border-red-500' : 'border-gray-300'} rounded-md py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:border-blue-500`}
             />
              {errors.budget && <p className="text-red-500 text-sm">{errors.location}</p>}
          
            </div>
            <div className="w-1/2">
              <label htmlFor="rate" className="block text-gray-700 text-sm font-medium mb-1">
                Rate
              </label>
              <select
                name="rate"
                id="rate"
                value={formData.rate}
                onChange={handleChange}
                className="border border-gray-300 rounded-md py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:border-blue-500"
              >
                <option value="Per Hour">Per Hour</option>
                <option value="Per Week">Per Week</option>
                <option value="Per Month">Per Month</option>
                <option value="Fixed">Fixed</option>
                <option value="Per Day">Per Day</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col mb-4">
            <label htmlFor="genderPreference" className="block text-gray-700 text-sm font-medium mb-1">
              Gender Preference
            </label>
            <select
              name="genderPreference"
              id="genderPreference"
              value={formData.genderPreference}
              onChange={handleChange}
              className="border border-gray-300 rounded-md py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:border-blue-500"
            >
              <option value="None">None</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="flex flex-col mb-4">
            <label htmlFor="tutorCount" className="block text-gray-700 text-sm font-medium mb-1">
              Number of Trainer
            </label>
            <select
              name="tutorCount"
              id="tutorCount"
              value={formData.tutorCount}
              onChange={handleChange}
              className="border border-gray-300 rounded-md py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:border-blue-500"
            >
              <option value="Only One">Only One</option>
              <option value="More than One">More than One</option>
            </select>
          </div>

          <div className="flex flex-col mb-4">
            <label htmlFor="partTime" className="block text-gray-700 text-sm font-medium mb-1">
              Trainer Availability
            </label>
            <select
              name="partTime"
              id="partTime"
              value={formData.partTime}
              onChange={handleChange}
              className="border border-gray-300 rounded-md py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:border-blue-500"
            >
              <option value="Part Time">Part Time</option>
              <option value="Full Time">Full Time</option>
            </select>
          </div>

          <div className="flex flex-col mb-4">
            <label htmlFor="languages" className="block text-gray-700 text-sm font-medium mb-1">
              Languages
            </label>
            <input
              type="text"
              name="languages"
              id="languages"
              value={formData.languages}
              onChange={handleChange}
              className={`border ${errors.languages ? 'border-red-500' : 'border-gray-300'} rounded-md py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:border-blue-500`}
              />
               {errors.la && <p className="text-red-500 text-sm">{errors.location}</p>}
           
          </div>

          <div className="flex flex-col mb-4">
            <label htmlFor="countryScope" className="block text-gray-700 text-sm font-medium mb-1">
              Scope of Trainer
            </label>
            <select
              name="countryScope"
              id="countryScope"
              value={formData.countryScope}
              onChange={handleChange}
              className="border border-gray-300 rounded-md py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:border-blue-500"
            >
              <option value="All countries">All countries</option>
              <option value="Only local">Only local</option>
            </select>
          </div>

          <div className="flex flex-col mb-4">
            <label htmlFor="tutorsNeeded" className="block text-gray-700 text-sm font-medium mb-1">
              Trainers Needed
            </label>
            <select
              name="tutorsNeeded"
              id="tutorsNeeded"
              value={formData.tutorsNeeded}
              onChange={handleChange}
              className="border border-gray-300 rounded-md py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:border-blue-500"
            >
              <option value="One Trainer">One Trainer</option>
              <option value="More than One Trainer">More than One Trainer</option>
            </select>
          </div>

          <div className="flex flex-col mb-4">
            <label htmlFor="iWant" className="block text-gray-700 text-sm font-medium mb-1">
              Help me with
            </label>
            <select
              name="iWant"
              id="iWant"
              value={formData.iWant}
              onChange={handleChange}
              className="border border-gray-300 rounded-md py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:border-blue-500"
            >
              <option value="Homework">Homework</option>
              <option value="Improve Grades">Improve Grades</option>
              <option value="Project">Project</option>
              <option value="Thesis">Thesis</option>
              <option value="Reserch paper">Reserch paper</option>
              <option value="Academic Writing">Academic Writing</option> 
              <option value="Test Preparation">Test Preparation</option>
            </select>
          </div>
        </div>

        <div className="text-center mt-6">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Submit
          </button>
           {/* Success/Error Message */}
        {message.text && (
          <div className={`text-center text-lg font-medium mb-4 ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {message.text}
          </div>
        )}
        </div>
      </form>
    </div>
  );
}
export default TutorRequestForm;

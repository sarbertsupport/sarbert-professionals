import Select from 'react-select';
import {
  FaMapMarkerAlt,
  FaExclamationCircle,
  FaPhone,
  FaGraduationCap,
  FaClock,
  FaMoneyBillWave,
  FaUsers,
  FaLanguage,
  FaHandshake,
  FaEye,
  FaBriefcase,
  FaFileAlt,
  FaCalendarAlt
} from 'react-icons/fa';
import jobCategories from '../../../data/jobCategories.json';
import countryOptions from '../countryOptions.json';

export function TutorRequestFormFieldsGrid({
  formData,
  errors,
  handleChange,
  handleSelectChange
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="md:col-span-2">
        <label htmlFor="location" className="block text-lg font-bold text-gray-800 mb-4 flex items-center">
          <FaMapMarkerAlt className="mr-3 text-blue-500 text-xl" />
          Location <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          type="text"
          name="location"
          id="location"
          value={formData.location}
          onChange={handleChange}
          className={`w-full px-6 py-4 text-lg rounded-2xl border-2 transition-all duration-200 ${
            errors.location
              ? 'border-red-500 focus:border-red-500 bg-red-50'
              : 'border-gray-200 focus:border-blue-500 focus:bg-blue-50'
          } focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-20`}
          placeholder="Enter your location (e.g., Nairobi, Kenya)"
        />
        {errors.location && (
          <p className="mt-3 text-sm text-red-600 flex items-center">
            <FaExclamationCircle className="mr-2" /> {errors.location}
          </p>
        )}
      </div>

      <div className="md:col-span-2">
        <label htmlFor="jobCategory" className="block text-lg font-bold text-gray-800 mb-4 flex items-center">
          <FaBriefcase className="mr-3 text-blue-500 text-xl" />
          Job Category <span className="text-red-500 ml-1">*</span>
        </label>
        <Select
          name="jobCategory"
          id="jobCategory"
          value={
            formData.jobCategory
              ? { value: formData.jobCategory, label: formData.jobCategory }
              : null
          }
          onChange={(selectedOption) => handleSelectChange(selectedOption, { name: 'jobCategory' })}
          options={jobCategories.map(category => ({
            value: category,
            label: category
          }))}
          classNamePrefix="react-select"
          className={`text-lg ${
            errors.jobCategory ? 'border-red-500' : 'border-gray-200'
          } rounded-2xl`}
          placeholder="Select job category"
          isSearchable
          styles={{
            control: (provided, state) => ({
              ...provided,
              border: state.isFocused ? '2px solid #3b82f6' : '2px solid #e5e7eb',
              borderRadius: '16px',
              padding: '12px 16px',
              fontSize: '18px',
              backgroundColor: state.isFocused ? '#eff6ff' : 'white',
              boxShadow: state.isFocused ? '0 0 0 4px rgba(59, 130, 246, 0.1)' : 'none',
              transition: 'all 0.2s'
            }),
            option: (provided, state) => ({
              ...provided,
              backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#eff6ff' : 'white',
              color: state.isSelected ? 'white' : '#374151',
              padding: '12px 16px',
              fontSize: '16px'
            })
          }}
        />
        {errors.jobCategory && (
          <p className="mt-3 text-sm text-red-600 flex items-center">
            <FaExclamationCircle className="mr-2" /> {errors.jobCategory}
          </p>
        )}
      </div>

      <div className="md:col-span-2">
        <label htmlFor="phone" className="block text-lg font-bold text-gray-800 mb-4 flex items-center">
          <FaPhone className="mr-3 text-blue-500 text-xl" />
          Phone Number <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="flex gap-4">
          <div className="w-1/3">
            <Select
              name="countryCode"
              value={countryOptions.find(option => option.value === formData.countryCode)}
              onChange={(selectedOption) => handleSelectChange(selectedOption, { name: 'countryCode' })}
              options={countryOptions}
              classNamePrefix="react-select"
              className="rounded-2xl"
              placeholder="Code"
              styles={{
                control: (provided, state) => ({
                  ...provided,
                  border: state.isFocused ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                  borderRadius: '16px',
                  padding: '12px 16px',
                  fontSize: '16px',
                  backgroundColor: state.isFocused ? '#eff6ff' : 'white',
                  boxShadow: state.isFocused ? '0 0 0 4px rgba(59, 130, 246, 0.1)' : 'none',
                  transition: 'all 0.2s'
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#eff6ff' : 'white',
                  color: state.isSelected ? 'white' : '#374151',
                  padding: '12px 16px',
                  fontSize: '14px'
                })
              }}
            />
          </div>
          <div className="flex-1">
            <input
              type="tel"
              name="phone"
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full px-6 py-4 text-lg rounded-2xl border-2 transition-all duration-200 ${
                errors.phone
                  ? 'border-red-500 focus:border-red-500 bg-red-50'
                  : 'border-gray-200 focus:border-blue-500 focus:bg-blue-50'
              } focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-20`}
              placeholder="Phone number (e.g., 25411000002)"
            />
          </div>
        </div>
        {errors.phone && (
          <p className="mt-3 text-sm text-red-600 flex items-center">
            <FaExclamationCircle className="mr-2" /> {errors.phone}
          </p>
        )}
      </div>

      <div className="md:col-span-2">
        <label htmlFor="requirements" className="block text-lg font-bold text-gray-800 mb-4 flex items-center">
          <FaFileAlt className="mr-3 text-blue-500 text-xl" />
          Detailed Requirements <span className="text-red-500 ml-1">*</span>
        </label>
        <textarea
          name="requirements"
          id="requirements"
          rows="6"
          value={formData.requirements}
          onChange={handleChange}
          className={`w-full px-6 py-4 text-lg rounded-2xl border-2 transition-all duration-200 resize-none ${
            errors.requirements
              ? 'border-red-500 focus:border-red-500 bg-red-50'
              : 'border-gray-200 focus:border-blue-500 focus:bg-blue-50'
          } focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-20`}
          placeholder="Describe your requirements in detail..."
        />
        {errors.requirements && (
          <p className="mt-3 text-sm text-red-600 flex items-center">
            <FaExclamationCircle className="mr-2" /> {errors.requirements}
          </p>
        )}
      </div>

      <div className="md:col-span-2">
        <label htmlFor="subjects" className="block text-lg font-bold text-gray-800 mb-4 flex items-center">
          <FaGraduationCap className="mr-3 text-blue-500 text-xl" />
          Subjects Needed <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          type="text"
          name="subjects"
          id="subjects"
          value={formData.subjects}
          onChange={handleChange}
          className={`w-full px-6 py-4 text-lg rounded-2xl border-2 transition-all duration-200 ${
            errors.subjects
              ? 'border-red-500 focus:border-red-500 bg-red-50'
              : 'border-gray-200 focus:border-blue-500 focus:bg-blue-50'
          } focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-20`}
          placeholder="e.g. Mathematics, Physics, English"
        />
        {errors.subjects && (
          <p className="mt-3 text-sm text-red-600 flex items-center">
            <FaExclamationCircle className="mr-2" /> {errors.subjects}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="level" className="block text-lg font-bold text-gray-800 mb-4 flex items-center">
          <FaGraduationCap className="mr-3 text-blue-500 text-xl" />
          Education Level <span className="text-red-500 ml-1">*</span>
        </label>
        <select
          name="level"
          id="level"
          value={formData.level}
          onChange={handleChange}
          className={`w-full px-6 py-4 text-lg rounded-2xl border-2 transition-all duration-200 ${
            errors.level
              ? 'border-red-500 focus:border-red-500 bg-red-50'
              : 'border-gray-200 focus:border-blue-500 focus:bg-blue-50'
          } focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-20`}
        >
          <option value="">Select level</option>
          <option value="High School">High School</option>
          <option value="University/College">University/College</option>
          <option value="Middle School/Junior High">Middle School/Junior High</option>
          <option value="Early Childhood">Early Childhood</option>
          <option value="Vocational/Technical Schools">Vocational/Technical Schools</option>
        </select>
        {errors.level && (
          <p className="mt-3 text-sm text-red-600 flex items-center">
            <FaExclamationCircle className="mr-2" /> {errors.level}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="iWant" className="block text-lg font-bold text-gray-800 mb-4 flex items-center">
          <FaHandshake className="mr-3 text-blue-500 text-xl" />
          Help Me With <span className="text-red-500 ml-1">*</span>
        </label>
        <select
          name="iWant"
          id="iWant"
          value={formData.iWant}
          onChange={handleChange}
          className={`w-full px-6 py-4 text-lg rounded-2xl border-2 transition-all duration-200 ${
            errors.iWant
              ? 'border-red-500 focus:border-red-500 bg-red-50'
              : 'border-gray-200 focus:border-blue-500 focus:bg-blue-50'
          } focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-20`}
        >
          <option value="Help with Homework">Help with Homework</option>
          <option value="Professional Guidance">Professional Guidance</option>
          <option value="Project">Project</option>
          <option value="Interview Preparation">Interview Preparation</option>
          <option value="Exam Preparation">Exam Preparation</option>
        </select>
        {errors.iWant && (
          <p className="mt-3 text-sm text-red-600 flex items-center">
            <FaExclamationCircle className="mr-2" /> {errors.iWant}
          </p>
        )}
      </div>

      <div className="md:col-span-2">
        <label className="block text-lg font-bold text-gray-800 mb-4 flex items-center">
          <FaEye className="mr-3 text-blue-500 text-xl" />
          Meeting Options <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['Online', 'At my place', 'Travel to tutor'].map((option) => (
            <div key={option} className="flex items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 border-2 border-transparent hover:border-blue-200">
              <input
                type="checkbox"
                name="meetingOption"
                id={`meeting-${option.toLowerCase().replace(' ', '-')}`}
                value={option}
                checked={formData.meetingOption.includes(option)}
                onChange={handleChange}
                className="h-6 w-6 text-blue-600 focus:ring-blue-500 border-gray-300 rounded-lg"
              />
              <label
                htmlFor={`meeting-${option.toLowerCase().replace(' ', '-')}`}
                className="ml-4 text-lg font-medium text-gray-700 cursor-pointer"
              >
                {option}
              </label>
            </div>
          ))}
        </div>
        {errors.meetingOption && (
          <p className="mt-3 text-sm text-red-600 flex items-center">
            <FaExclamationCircle className="mr-2" /> {errors.meetingOption}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="budget" className="block text-lg font-bold text-gray-800 mb-4 flex items-center">
          <FaMoneyBillWave className="mr-3 text-blue-500 text-xl" />
          Budget ($) <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="relative rounded-2xl shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <span className="text-gray-500 text-lg font-semibold">$</span>
          </div>
          <input
            type="number"
            name="budget"
            id="budget"
            value={formData.budget}
            onChange={handleChange}
            className={`block w-full pl-12 pr-6 py-4 text-lg rounded-2xl border-2 transition-all duration-200 ${
              errors.budget
                ? 'border-red-500 focus:border-red-500 bg-red-50'
                : 'border-gray-200 focus:border-blue-500 focus:bg-blue-50'
            } focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-20`}
            placeholder="0.00"
            step="0.01"
            min="0"
          />
        </div>
        {errors.budget && (
          <p className="mt-3 text-sm text-red-600 flex items-center">
            <FaExclamationCircle className="mr-2" /> {errors.budget}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="rate" className="block text-lg font-bold text-gray-800 mb-4 flex items-center">
          <FaClock className="mr-3 text-blue-500 text-xl" />
          Rate Frequency <span className="text-red-500 ml-1">*</span>
        </label>
        <select
          name="rate"
          id="rate"
          value={formData.rate}
          onChange={handleChange}
          className={`w-full px-6 py-4 text-lg rounded-2xl border-2 transition-all duration-200 ${
            errors.rate
              ? 'border-red-500 focus:border-red-500 bg-red-50'
              : 'border-gray-200 focus:border-blue-500 focus:bg-blue-50'
          } focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-20`}
        >
          <option value="Per Hour">Per Hour</option>
          <option value="Per Week">Per Week</option>
          <option value="Per Month">Per Month</option>
          <option value="Fixed">Fixed</option>
        </select>
        {errors.rate && (
          <p className="mt-3 text-sm text-red-600 flex items-center">
            <FaExclamationCircle className="mr-2" /> {errors.rate}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="tutorCount" className="block text-lg font-bold text-gray-800 mb-4 flex items-center">
          <FaUsers className="mr-3 text-blue-500 text-xl" />
          Number of Tutors <span className="text-red-500 ml-1">*</span>
        </label>
        <select
          name="tutorCount"
          id="tutorCount"
          value={formData.tutorCount}
          onChange={handleChange}
          className={`w-full px-6 py-4 text-lg rounded-2xl border-2 transition-all duration-200 ${
            errors.tutorCount
              ? 'border-red-500 focus:border-red-500 bg-red-50'
              : 'border-gray-200 focus:border-blue-500 focus:bg-blue-50'
          } focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-20`}
        >
          <option value="Only One">Only One</option>
          <option value="Two">Two</option>
          <option value="More than Two">More than Two</option>
        </select>
        {errors.tutorCount && (
          <p className="mt-3 text-sm text-red-600 flex items-center">
            <FaExclamationCircle className="mr-2" /> {errors.tutorCount}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="partTime" className="block text-lg font-bold text-gray-800 mb-4 flex items-center">
          <FaCalendarAlt className="mr-3 text-blue-500 text-xl" />
          Job Nature <span className="text-red-500 ml-1">*</span>
        </label>
        <select
          name="partTime"
          id="partTime"
          value={formData.partTime}
          onChange={handleChange}
          className={`w-full px-6 py-4 text-lg rounded-2xl border-2 transition-all duration-200 ${
            errors.partTime
              ? 'border-red-500 focus:border-red-500 bg-red-50'
              : 'border-gray-200 focus:border-blue-500 focus:bg-blue-50'
          } focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-20`}
        >
          <option value="Part Time">Part Time</option>
          <option value="Full Time">Full Time</option>
        </select>
        {errors.partTime && (
          <p className="mt-3 text-sm text-red-600 flex items-center">
            <FaExclamationCircle className="mr-2" /> {errors.partTime}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="languages" className="block text-lg font-bold text-gray-800 mb-4 flex items-center">
          <FaLanguage className="mr-3 text-blue-500 text-xl" />
          Languages <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          type="text"
          name="languages"
          id="languages"
          value={formData.languages}
          onChange={handleChange}
          className={`w-full px-6 py-4 text-lg rounded-2xl border-2 transition-all duration-200 ${
            errors.languages
              ? 'border-red-500 focus:border-red-500 bg-red-50'
              : 'border-gray-200 focus:border-blue-500 focus:bg-blue-50'
          } focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-20`}
          placeholder="e.g. English, Spanish"
        />
        {errors.languages && (
          <p className="mt-3 text-sm text-red-600 flex items-center">
            <FaExclamationCircle className="mr-2" /> {errors.languages}
          </p>
        )}
      </div>
    </div>
  );
}

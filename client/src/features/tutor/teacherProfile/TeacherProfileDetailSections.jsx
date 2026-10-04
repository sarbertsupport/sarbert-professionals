import { Section } from './TeacherProfileSection';
import { Fragment } from 'react';

export function TeacherProfileDetailSections({
  userProfile,
  educationList,
  experienceList,
  subjects,
  teachingDetails,
  openProfileModal,
  openEducationModal,
  openExperienceModal,
  openTeachingModal
}) {
  return (
    <Fragment>
{/* About Me */}
<Section title="About Me">
  <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300">
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-center">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-800">Personal Introduction</h3>
      </div>
      <button 
        onClick={openProfileModal}
        className="group bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white p-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        aria-label="Edit profile description"
      >
        <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
    </div>
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-100">
      <p className="text-gray-700 leading-relaxed text-lg">
        {userProfile.profileDescription || (
          <span className="text-gray-400 italic">No description provided. Click the edit button to add your personal introduction.</span>
        )}
      </p>
    </div>
  </div>
</Section>

        {/* Education */}
        <Section title="Education">
  <div className="space-y-6">
    {/* Add Education Button - Always visible */}
    <div className="flex justify-end">
      <button
        onClick={() => openEducationModal()}
        className="group bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center"
      >
        <svg className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add Education
      </button>
    </div>

    {/* Education List */}
    {educationList.length > 0 ? (
      <div className="space-y-8">
        {educationList.map((education, index) => (
          <div
            key={education.educationId || index}
            className="group bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:scale-[1.02]"
          >
            <div className="p-8">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Enhanced Institution Icon */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>
                
                {/* Enhanced Education Details */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">
                        {education.degreeName}
                      </h3>
                      <p className="text-lg text-blue-600 font-semibold mb-3">
                        {education.institutionName}
                      </p>
                    </div>
                    <button 
                      onClick={() => openEducationModal(index)}
                      className="group/edit bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white p-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      aria-label="Edit education"
                    >
                      <svg className="w-5 h-5 group-hover/edit:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>

                  {/* Enhanced Degree Badge */}
                  <div className="inline-block bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-bold px-4 py-2 rounded-full mb-6 border border-blue-200">
                    {education.degreeType}
                  </div>

                  {/* Enhanced Details Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      {education.specialization && (
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100">
                          <span className="text-sm font-semibold text-gray-600 block mb-1">Specialization</span>
                          <p className="text-gray-800 font-medium">{education.specialization}</p>
                        </div>
                      )}
                      {education.association && (
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100">
                          <span className="text-sm font-semibold text-gray-600 block mb-1">Study Mode</span>
                          <p className="text-gray-800 font-medium">{education.association}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100">
                        <span className="text-sm font-semibold text-gray-600 block mb-1">Duration</span>
                        <p className="text-gray-800 font-medium">
                          {new Date(education.startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} - {' '}
                          {new Date(education.endDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      {education.score && (
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100">
                          <span className="text-sm font-semibold text-gray-600 block mb-2">GPA Score</span>
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl font-bold text-blue-600">{education.score}</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-3">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500" 
                                style={{ width: `${(education.score / 4) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-500">/ 4.0</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl border-2 border-dashed border-gray-300 p-12 text-center hover:border-blue-300 transition-all duration-300">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="h-10 w-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-3">No Education Added</h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">Add your educational background to showcase your qualifications and expertise to potential students.</p>
      </div>
    )}
  </div>
</Section>

  {/* Experience */}
  <Section title="Professional Experience">
  <div className="space-y-6">
    {/* Add Experience Button - Always visible */}
    <div className="flex justify-end">
      <button
        onClick={() => openExperienceModal()}
        className="group bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center"
      >
        <svg className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add Experience
      </button>
    </div>

    {/* Experience List */}
    {experienceList?.length > 0 ? (
      <div className="space-y-8">
        {experienceList.map((experience, index) => (
          <div
            key={experience.experienceId || index}
            className="group bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:scale-[1.02]"
          >
            <div className="p-8">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Enhanced Company Logo/Icon */}
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>

                {/* Enhanced Experience Details */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">
                        {experience.designation}
                      </h3>
                      
                      <div className="flex items-center mb-3">
                        <a 
                          href={experience.organizationUrl || "#"} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-lg text-green-600 hover:text-green-800 font-semibold inline-flex items-center transition-colors duration-200"
                        >
                          {experience.organizationName}
                          {experience.organizationUrl && (
                            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          )}
                        </a>
                        {experience.association && (
                          <span className="ml-4 text-sm bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-4 py-2 rounded-full font-semibold border border-green-200">
                            {experience.association}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center text-sm text-gray-600 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 inline-flex">
                        <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(experience.startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} -{' '}
                        {experience.currentJob ? (
                          <span className="text-green-600 font-bold">Present</span>
                        ) : (
                          new Date(experience.endDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                        )}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => openExperienceModal(index)}
                      className="group/edit bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white p-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      aria-label="Edit experience"
                    >
                      <svg className="w-5 h-5 group-hover/edit:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>

                  {/* Enhanced Responsibilities */}
                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Key Responsibilities
                    </h4>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-100">
                      <ul className="space-y-3">
                        {experience.jobDescription.split("\n").filter(Boolean).map((point, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="flex-shrink-0 w-2 h-2 mt-2 bg-green-500 rounded-full mr-4"></span>
                            <span className="text-gray-700 leading-relaxed">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Enhanced Skills */}
                  {experience.skills?.length > 0 && (
                    <div>
                      <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Skills Applied
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {experience.skills.map((skill, idx) => (
                          <span 
                            key={idx} 
                            className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold hover:from-green-200 hover:to-emerald-200 transition-all duration-200 border border-green-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl border-2 border-dashed border-gray-300 p-12 text-center hover:border-green-300 transition-all duration-300">
        <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="h-10 w-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-3">No Professional Experience Added</h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">Showcase your work history to highlight your expertise and professional achievements to potential students.</p>
      </div>
    )}
  </div>
</Section>
 {/* NEW SKILLS SECTION */}
 <Section title="Your Professional Skills">
            {subjects.length > 0 ? (
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Professional Subjects</h3>
                </div>
                <div className="flex flex-wrap gap-4">
                  {subjects.map((subject, index) => (
                    <span 
                      key={index}
                      className="bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 px-6 py-3 rounded-full text-sm font-semibold hover:from-yellow-200 hover:to-orange-200 transition-all duration-200 border border-yellow-200 shadow-sm hover:shadow-md"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl border-2 border-dashed border-gray-300 p-12 text-center hover:border-yellow-300 transition-all duration-300">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="h-10 w-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">No Subjects Added</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">Add the subjects you're qualified to teach to showcase your expertise to potential students.</p>
                <button className="group bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center">
                  <svg className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Subjects
                </button>
              </div>
            )}
    </Section>
{/* Teaching Details */}
<Section title="Professional Preferences">
  <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
    <div className="p-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Professional Preferences and Rates</h3>
          <p className="text-gray-600">Customize your professional details to match your style and preferences</p>
        </div>
        <button 
          onClick={openTeachingModal}
          className="group bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          aria-label="Edit professional details"
        >
          <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Enhanced Rate Card */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-lg font-bold text-gray-800">Rate</h4>
          </div>
          <p className="text-3xl font-bold text-gray-800 mb-2">
            ${teachingDetails?.minFee ?? 0} - ${teachingDetails?.maxFee ?? 0}
          </p>
          <p className="text-sm text-gray-600">
            per {teachingDetails?.rate ?? 'hour'}
          </p>
        </div>

        {/* Enhanced Experience Card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 className="text-lg font-bold text-gray-800">Experience</h4>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Experience</span>
              <span className="text-xl font-bold text-blue-600">{teachingDetails?.totalExpYears ?? 0} years</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Online Professional</span>
              <span className="text-xl font-bold text-blue-600">{teachingDetails?.onlineExpYears ?? 0} years</span>
            </div>
          </div>
        </div>

        {/* Enhanced Availability Card */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-lg font-bold text-gray-800">Availability</h4>
          </div>
          <div className="space-y-3">
            {teachingDetails?.onlineAvailability ? (
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-700 font-medium">Online Sessions</span>
              </div>
            ) : null}
            {teachingDetails?.homeAvailability ? (
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-700 font-medium">In-Home Professional Services</span>
              </div>
            ) : null}
            {teachingDetails?.homeworkHelp ? (
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-700 font-medium">Homework Help</span>
              </div>
            ) : null}
            {!teachingDetails?.onlineAvailability && 
             !teachingDetails?.homeAvailability && 
             !teachingDetails?.homeworkHelp && (
              <p className="text-gray-500 text-sm italic">No availability specified</p>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
</Section>
    </Fragment>
  );
}

import {
  FaUserTie,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaIdBadge,
  FaGraduationCap,
  FaBriefcase,
  FaBook
} from 'react-icons/fa';
import { IoMdTime } from 'react-icons/io';
import {
  formatProfileDate,
  FormattedJobDescription,
  SubjectsChips
} from './profileDisplay';

export function ViewTeacherProfileMainPanel({ teacher, imageError, setImageError, activeTab, setActiveTab }) {
  return (
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            {/* Enhanced Profile Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
                                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                                    <div className="relative">
                                        {imageError || !teacher.imagePath ? (
                                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-blue-400 border-4 border-white shadow-lg flex items-center justify-center">
                                                <span className="text-2xl md:text-3xl font-bold text-white">
                                                    {teacher.displayName.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        ) : (
                                            <img
                                                src={teacher.imagePath}
                                                alt={`Profile image of ${teacher.displayName}`}
                                                className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover border-4 border-white shadow-lg"
                                                onError={() => setImageError(true)}
                                                loading="lazy"
                                            />
                                        )}
                                        <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                                            <FaIdBadge className="text-blue-600 text-lg" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{teacher.displayName}</h1>
                                        <p className="text-blue-100 text-lg mb-4">Professional Teacher & Tutor</p>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className="flex items-center bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm backdrop-blur-sm">
                                                <FaUserTie className="mr-2" /> {teacher.gender || 'Not specified'}
                                            </span>
                                            <span className="flex items-center bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm backdrop-blur-sm">
                                                <FaMapMarkerAlt className="mr-2" /> {teacher.location || 'Location not provided'}
                                            </span>
                                            <span className="flex items-center bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm backdrop-blur-sm">
                                                <FaMoneyBillWave className="mr-2" /> ${teacher.minFee || '0'}-${teacher.maxFee || '0'}/hr
                                            </span>
                                            <span className="flex items-center bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm backdrop-blur-sm">
                                                <IoMdTime className="mr-2" /> {teacher.totalExpYears || '0'} years experience
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tab Navigation */}
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                <div className="flex space-x-8">
                                    {[
                                        { id: 'about', label: 'About', icon: FaUserTie },
                                        { id: 'education', label: 'Education', icon: FaGraduationCap },
                                        { id: 'experience', label: 'Experience', icon: FaBriefcase },
                                        { id: 'subjects', label: 'Skills', icon: FaBook }
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center px-4 py-2 rounded-xl font-medium transition-all ${
                                                activeTab === tab.id
                                                    ? 'bg-blue-600 text-white shadow-lg'
                                                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                                            }`}
                                        >
                                            <tab.icon className="mr-2" />
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tab Content */}
                            <div className="p-8">
                                {activeTab === 'about' && (
                                    <div className="space-y-6">
                                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                                            <FaUserTie className="mr-3 text-blue-600" /> About Me
                                        </h2>
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                                {teacher.profileDescription || (
                                                    <span className="text-gray-400 italic">This professional hasn't provided an about section yet.</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'education' && (
                                    <div className="space-y-6">
                                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                                            <FaGraduationCap className="mr-3 text-blue-600" /> Education & Qualifications
                                        </h2>
                                        {teacher.educations && teacher.educations.length > 0 ? (
                                            <div className="space-y-6">
                                                {teacher.educations.map((edu, index) => (
                                                    <div key={index} className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <h3 className="text-xl font-bold text-gray-800 mb-2">
                                                                    {edu.degreeName} <span className="text-blue-600">({edu.degreeType})</span>
                                                                </h3>
                                                                <p className="text-gray-600 text-lg font-medium mb-3">{edu.institutionName}</p>
                                                                <div className="flex flex-wrap gap-2">
                                                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                                                        {formatProfileDate(edu.startDate)} - {formatProfileDate(edu.endDate)}
                                                                    </span>
                                                                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                                                                        {edu.association}
                                                                    </span>
                                                                    {edu.specialization && (
                                                                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                                                                            {edu.specialization}
                                                                        </span>
                                                                    )}
                                                                    {edu.score && (
                                                                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                                                            GPA: {edu.score}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center ml-4">
                                                                <FaGraduationCap className="text-white text-xl" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <FaGraduationCap className="text-gray-400 text-4xl mb-4 mx-auto" />
                                                <p className="text-gray-400 italic text-lg">No education information provided.</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'experience' && (
                                    <div className="space-y-6">
                                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                                            <FaBriefcase className="mr-3 text-blue-600" /> Work Experience
                                        </h2>
                                        {teacher.experiences && teacher.experiences.length > 0 ? (
                                            <div className="space-y-6">
                                                {teacher.experiences.map((exp, index) => (
                                                    <div key={index} className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <h3 className="text-xl font-bold text-gray-800 mb-2">
                                                                    {exp.designation} at <span className="text-blue-600">{exp.organizationName}</span>
                                                                </h3>
                                                                <div className="flex flex-wrap gap-2 mb-3">
                                                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                                                        {formatProfileDate(exp.startDate)} - {formatProfileDate(exp.endDate)}
                                                                    </span>
                                                                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                                                                        {exp.association}
                                                                    </span>
                                                                    {exp.currentJob && (
                                                                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                                                            Current Position
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {exp.jobDescription && (
                                                                    <div className="mt-4">
                                                                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Key Responsibilities:</h4>
                                                                        <FormattedJobDescription description={exp.jobDescription} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center ml-4">
                                                                <FaBriefcase className="text-white text-xl" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <FaBriefcase className="text-gray-400 text-4xl mb-4 mx-auto" />
                                                <p className="text-gray-400 italic text-lg">No work experience provided.</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'subjects' && (
                                    <div className="space-y-6">
                                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                                            <FaBook className="mr-3 text-blue-600" /> Skills & Expertise
                                        </h2>
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                                            <SubjectsChips subjects={teacher.subjects} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
  );
}

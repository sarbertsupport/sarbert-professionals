import {
  FaVenusMars,
  FaMoneyBillWave,
  FaHome,
  FaLaptop,
  FaPhone,
  FaMapMarkerAlt,
  FaIdBadge,
  FaClock,
  FaStar,
  FaEnvelope
} from 'react-icons/fa';
import { FiMessageSquare } from 'react-icons/fi';
import { AvailabilityBadge } from './profileDisplay';

export function ViewTeacherProfileSidebar({ teacher, imageError, setImageError, openContactModal }) {
  return (
                    <div className="lg:col-span-1 space-y-6">
                        {/* Profile Card */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <div className="text-center">
                                <div className="relative inline-block mb-4">
                                    {imageError || !teacher.imagePath ? (
                                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 border-4 border-white shadow-lg flex items-center justify-center">
                                            <span className="text-2xl font-bold text-white">
                                                {teacher.displayName.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    ) : (
                                        <img
                                            src={teacher.imagePath}
                                            alt={`Profile image of ${teacher.displayName}`}
                                            className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg"
                                            onError={() => setImageError(true)}
                                            loading="lazy"
                                        />
                                    )}
                                    <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full p-2 border-2 border-white shadow-lg">
                                        <FaIdBadge className="text-white text-sm" />
                                    </div>
                                </div>
                                
                                <h2 className="text-xl font-bold text-gray-800 mb-2">{teacher.displayName}</h2>
                                <p className="text-gray-600 text-sm mb-4">Professional Teacher</p>
                                
                                <div className="space-y-3">
                                    <div className="flex items-center justify-center text-sm text-gray-600">
                                        <FaVenusMars className="mr-2 text-gray-400" />
                                        {teacher.gender || 'Not specified'}
                                    </div>
                                    <div className="flex items-center justify-center text-sm text-gray-600">
                                        <FaMapMarkerAlt className="mr-2 text-gray-400" />
                                        {teacher.location || 'Location not provided'}
                                    </div>
                                    <div className="flex items-center justify-center text-sm text-gray-600">
                                        <FaMoneyBillWave className="mr-2 text-gray-400" />
                                        ${teacher.minFee || '0'}-${teacher.maxFee || '0'}/hr
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <FaStar className="mr-2 text-yellow-500" />
                                Quick Stats
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                                    <div className="flex items-center">
                                        <FaClock className="mr-2 text-blue-500" />
                                        <span className="text-sm font-medium text-gray-700">Experience</span>
                                    </div>
                                    <span className="text-sm font-bold text-blue-600">{teacher.totalExpYears || '0'} years</span>
                                </div>
                                
                                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                                    <div className="flex items-center">
                                        <FaLaptop className="mr-2 text-green-500" />
                                        <span className="text-sm font-medium text-gray-700">Online</span>
                                    </div>
                                    <AvailabilityBadge isAvailable={teacher.onlineAvailability} />
                                </div>
                                
                                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                                    <div className="flex items-center">
                                        <FaHome className="mr-2 text-purple-500" />
                                        <span className="text-sm font-medium text-gray-700">Home</span>
                                    </div>
                                    <AvailabilityBadge isAvailable={teacher.homeAvailability} />
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <FaPhone className="mr-2 text-blue-500" />
                                Contact Info
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                                    <FaPhone className="mr-2 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-700">
                                        {teacher.phoneNumber || 'Not provided'}
                                    </span>
                                </div>
                                <div className="flex items-center p-3 bg-gray-50 rounded-xl">
                                    <FaEnvelope className="mr-2 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-700">
                                        {teacher.email || 'Not provided'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                            <button 
                                onClick={openContactModal}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg transform hover:scale-105 flex items-center justify-center"
                            >
                                <FiMessageSquare className="mr-2" />
                                Contact Professional
                            </button>
                        </div>
                    </div>
  );
}

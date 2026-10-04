import React from 'react';
import {
  FaStar,
  FaCheckCircle,
  FaCheck,
  FaBook,
  FaHandshake,
  FaInfoCircle,
  FaClock
} from 'react-icons/fa';

export function TutorRequestSidebar() {
  return (
    <div className="lg:col-span-1 space-y-6">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <FaStar className="mr-3 text-yellow-500" />
          Form Progress
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <FaCheckCircle className="text-white text-lg" />
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-800">Basic Info</span>
                <div className="text-xs text-green-600 font-medium">Complete</div>
              </div>
            </div>
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <FaCheck className="text-white text-sm" />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <FaBook className="text-white text-lg" />
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-800">Requirements</span>
                <div className="text-xs text-blue-600 font-medium">In Progress</div>
              </div>
            </div>
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full" />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-gray-400 to-gray-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <FaHandshake className="text-white text-lg" />
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-800">Review & Submit</span>
                <div className="text-xs text-gray-600 font-medium">Pending</div>
              </div>
            </div>
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <FaInfoCircle className="mr-3 text-blue-500" />
          Professional Tips
        </h3>
        <div className="space-y-4">
          {[
            { title: 'Be Specific', text: 'Detailed requirements help tutors understand your needs', gradient: 'from-blue-50 to-indigo-50' },
            { title: 'Set Budget Range', text: 'Realistic budget attracts quality tutors', gradient: 'from-green-50 to-emerald-50' },
            { title: 'Meeting Options', text: 'Flexible options increase response rate', gradient: 'from-purple-50 to-pink-50' },
            { title: 'Subject Details', text: 'Specific subjects help find the right tutor', gradient: 'from-yellow-50 to-orange-50' }
          ].map((tip) => (
            <div key={tip.title} className={`flex items-start space-x-3 p-3 bg-gradient-to-r ${tip.gradient} rounded-xl`}>
              <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0 text-lg" />
              <div>
                <span className="text-sm font-semibold text-gray-800">{tip.title}</span>
                <div className="text-xs text-gray-600 mt-1">{tip.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <FaClock className="mr-3 text-orange-500" />
          Response Time
        </h3>
        <div className="text-center">
          <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            24-48 hours
          </div>
          <p className="text-sm text-gray-600">Average response time from qualified tutors</p>
          <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
            <div className="text-xs text-green-600 font-semibold">✓ Verified Tutors</div>
            <div className="text-xs text-gray-600 mt-1">All tutors are pre-screened</div>
          </div>
        </div>
      </div>

    </div>
  );
}

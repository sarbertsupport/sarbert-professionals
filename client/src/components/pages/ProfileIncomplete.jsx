import React from "react";
import { FiAlertTriangle, FiX, FiEdit2, FiEyeOff } from "react-icons/fi";

const ProfileIncomplete = ({ onComplete, onCancel }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header with warning icon */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-center">
          <div className="inline-flex items-center justify-center bg-white rounded-full p-3 mb-4 shadow-md">
            <FiAlertTriangle className="h-10 w-10 text-amber-500" />
          </div>
          <h1 className="text-3xl font-bold text-white">
            Your Profile Is Incomplete
          </h1>
        </div>

        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-amber-100 p-4 rounded-full">
              <FiEyeOff className="h-8 w-8 text-amber-600" />
            </div>
          </div>

          <div className="space-y-4 text-center">
            <p className="text-lg text-gray-700 leading-relaxed">
              Your profile is currently <span className="font-semibold text-amber-600">not visible</span> to job posters. 
              Completing your profile significantly increases your chances of getting selected for jobs.
            </p>

            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 text-left rounded-lg my-6">
              <ul className="space-y-2 text-amber-800">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Your profile won't appear in search results</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Job posters can't view your details</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Your application success rate may be lower</span>
                </li>
              </ul>
            </div>

            <p className="text-gray-600">
              Complete your profile now to unlock full access to job opportunities.
            </p>
          </div>

          {/* Action buttons */}
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-transparent border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
            >
              <FiX className="mr-2" />
              Cancel & Return
            </button>
            <button
              onClick={onComplete}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-amber-700 transition-colors shadow-md flex items-center justify-center"
            >
              <FiEdit2 className="mr-2" />
              Complete My Profile
            </button>
          </div>

          <p className="text-sm text-gray-500 mt-8 text-center">
            Need help? Contact us at{" "}
            <a href="mailto:support@skillbridge.com" className="text-amber-600 hover:underline">
              support@skillbridge.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileIncomplete;
import {
  FaBriefcase,
  FaPlus,
  FaCheckCircle,
  FaHandshake,
} from 'react-icons/fa';

export function StudentDashboardPageHeader({ totalItems, requirements, onPostJob }) {
  return (
    <>
          {/* Enhanced Header Section */}
          <div className="mb-8 bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                    <FaBriefcase className="text-white text-xl" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800">My Requirements</h1>
                    <p className="text-gray-600 mt-1">
                      {totalItems} {totalItems === 1 ? 'requirement' : 'requirements'} posted
                    </p>
                  </div>
                </div>
              </div>
              <button 
                aria-label="Post New Job"
                className="mt-4 md:mt-0 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center"
                onClick={onPostJob}
              >
                <FaPlus className="mr-3 text-lg" /> Post New Job
              </button>
            </div>

            {/* Enhanced encouragement banner */}
            {requirements.some((job) => job.jobStatus === 'Open' && job.hasActiveConnections) && (
              <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-6 rounded-xl shadow-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                      <FaCheckCircle className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-xl font-bold text-green-800 mb-2">🎉 Success! Time to Close Your Job</h3>
                    <div className="text-green-700 space-y-2">
                      <p className="font-medium">
                        You have open requirements with active connections. If you've found the right professional 
                        and are satisfied with their assistance, please close your job to:
                      </p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Stop receiving unnecessary messages from other professionals</li>
                        <li>Help other students find available professionals faster</li>
                        <li>Keep your dashboard organized and up-to-date</li>
                        <li>Show appreciation to the professional who helped you</li>
                      </ul>
                      <div className="mt-4 p-3 bg-white rounded-lg border border-green-200">
                        <p className="text-sm font-semibold text-green-800">
                          💡 <strong>Tip:</strong> Only close jobs when you're completely satisfied with the assistance received. 
                          You can always post a new job if you need additional help later.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Additional prominent reminder for all open jobs */}
            {requirements.filter(job => job.jobStatus === 'Open').length > 0 && (
              <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 p-6 rounded-xl shadow-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                      <FaHandshake className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-bold text-blue-800 mb-2">📋 Manage Your Open Jobs</h3>
                    <div className="text-blue-700">
                      <p className="mb-3">
                        You have <strong>{requirements.filter(job => job.jobStatus === 'Open').length} open job(s)</strong>. 
                        Remember to review and close jobs that have been successfully completed to:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm">Prevent spam messages</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm">Help other students</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm">Keep dashboard clean</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm">Show appreciation</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
    </>
  );
}

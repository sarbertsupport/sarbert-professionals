import {
  FaUser,
  FaKey,
  FaEdit,
  FaPlus,
  FaBook,
  FaEnvelope,
  FaHandshake,
  FaShieldAlt,
  FaLockOpen,
} from 'react-icons/fa';

export function StudentProfilePageHeader({
  studentProfile,
  onOpenPassword,
  onOpenEdit,
}) {
  return (
    <>
            {/* Enhanced Header */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                    <FaUser className="text-white text-2xl" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
                    <p className="text-gray-600 mt-1">Manage your personal and account information</p>
                  </div>
                </div>
                <div className="flex space-x-3 mt-4 md:mt-0">
                  <button
                    onClick={onOpenPassword}
                    className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    aria-label="Change Password"
                  >
                    <FaKey className="mr-2" />
                    Change Password
                  </button>
                  {studentProfile && (
                    <button
                      onClick={onOpenEdit}
                      className="flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                      aria-label="Edit Profile"
                    >
                      <FaEdit className="mr-2" />
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>
            </div>
    </>
  );
}

export function StudentProfileSidebar({
  navigate,
  profile,
  onOpenPassword,
}) {
  return (
              <div className="lg:col-span-1 space-y-6">
                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FaPlus className="mr-2 text-blue-500" />
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <button 
                      onClick={() => navigate('/student-dashboard')}
                      className="w-full p-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <FaBook className="mr-2" />
                      My Requirements
                    </button>
                    <button 
                      onClick={() => navigate('/client-messages')}
                      className="w-full p-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <FaEnvelope className="mr-2" />
                      Messages
                    </button>
                    <button 
                      onClick={() => navigate('/wallet')}
                      className="w-full p-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <FaHandshake className="mr-2" />
                      Wallet
                    </button>
                  </div>
                </div>

                {/* Account Security */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FaShieldAlt className="mr-2 text-orange-500" />
                    Account Security
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                          <FaLockOpen className="text-white text-sm" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Account Status</span>
                      </div>
                      <span className="text-sm font-bold text-green-600">
                        {profile.locked ? 'Locked' : 'Active'}
                      </span>
                    </div>
                    
                    <button 
                      onClick={onOpenPassword}
                      className="w-full p-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <FaKey className="mr-2" />
                      Change Password
                    </button>
                  </div>
                </div>
              </div>
  );
}

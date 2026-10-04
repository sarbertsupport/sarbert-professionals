import {
  FaEnvelope,
  FaSignOutAlt,
  FaUserCircle,
  FaChevronDown,
  FaBell,
  FaBriefcase,
  FaSearch,
  FaHistory,
  FaShoppingCart,
  FaHeadset
} from 'react-icons/fa';
import { RiCoinsFill } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import logger from '../../../utils/logger';
import { ROUTES } from '../../../constants/routes';

export function MenusDesktopNav({
  dropdownRef,
  isWalletDropdownOpen,
  setWalletDropdownOpen,
  isProfileDropdownOpen,
  setProfileDropdownOpen,
  isNotificationsOpen,
  setNotificationsOpen,
  coinBalance,
  messageCount,
  notificationCount,
  userProfile,
  setShowBuyModal,
  setShowHistoryModal,
  handleLogout
}) {
  return (
    <nav className="hidden md:flex items-center space-x-8">
      <Link
        to="/studentdashboard"
        className="flex items-center px-4 py-2 text-sm font-medium text-white hover:text-blue-100 transition-all duration-200 rounded-lg hover:bg-white/10 group"
      >
        <FaBriefcase className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
        My Job Posts
      </Link>

      <Link
        to="/professionals"
        className="flex items-center px-4 py-2 text-sm font-medium text-white hover:text-blue-100 transition-all duration-200 rounded-lg hover:bg-white/10 group"
      >
        <FaSearch className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
        Find Professionals
      </Link>

      <Link
        to={ROUTES.SUPPORT}
        className="flex items-center px-4 py-2 text-sm font-medium text-white hover:text-blue-100 transition-all duration-200 rounded-lg hover:bg-white/10 group"
      >
        <FaHeadset className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
        Support
      </Link>

      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => {
            setWalletDropdownOpen(!isWalletDropdownOpen);
            setProfileDropdownOpen(false);
          }}
          className="flex items-center text-white hover:text-blue-100 transition-all duration-200 focus:outline-none group"
        >
          <div className="flex items-center bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm px-4 py-2 rounded-full group-hover:from-yellow-500/30 group-hover:to-orange-500/30 transition-all duration-200 border border-yellow-400/30 hover:border-yellow-400/50 shadow-lg hover:shadow-xl">
            <RiCoinsFill className="h-5 w-5 mr-2 text-yellow-400 drop-shadow-sm" />
            <span className="font-semibold text-white">My Coins Wallet</span>
            <FaChevronDown className={`ml-2 h-4 w-4 transition-transform duration-200 ${isWalletDropdownOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>
        {isWalletDropdownOpen && (
          <div className="absolute mt-3 w-80 bg-white/95 backdrop-blur-md shadow-2xl rounded-xl py-3 z-50 border border-gray-200/50 right-0 transform transition-all duration-200">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Available Balance</span>
                <div className="flex items-center bg-gradient-to-r from-yellow-100 to-orange-100 px-3 py-1 rounded-full">
                  <RiCoinsFill className="h-4 w-4 mr-2 text-yellow-600" />
                  <span className="font-bold text-gray-800 text-lg">{coinBalance}</span>
                </div>
              </div>
            </div>

            <div className="p-3 space-y-2">
              <button
                type="button"
                className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 transition-all duration-200 text-left group border border-transparent hover:border-yellow-200"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  logger.debug('Menus: Opening buy coins modal');
                  setShowBuyModal(true);
                  setTimeout(() => setWalletDropdownOpen(false), 100);
                }}
              >
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-3 rounded-full mr-4 group-hover:scale-110 transition-transform shadow-lg">
                    <FaShoppingCart className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Buy More Coins</p>
                    <p className="text-xs text-gray-500">Add to your wallet balance</p>
                  </div>
                </div>
                <FaChevronDown className="text-gray-400 text-xs transform -rotate-90 group-hover:text-gray-600 transition-colors" />
              </button>

              <button
                type="button"
                className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 text-left group border border-transparent hover:border-blue-200"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setShowHistoryModal(true);
                  setTimeout(() => setWalletDropdownOpen(false), 100);
                }}
              >
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-blue-400 to-indigo-400 p-3 rounded-full mr-4 group-hover:scale-110 transition-transform shadow-lg">
                    <FaHistory className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Transaction History</p>
                    <p className="text-xs text-gray-500">View your purchase history</p>
                  </div>
                </div>
                <FaChevronDown className="text-gray-400 text-xs transform -rotate-90 group-hover:text-gray-600 transition-colors" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="relative">
        <button
          type="button"
          className="text-white hover:text-blue-100 transition-all duration-200 relative focus:outline-none group p-2 rounded-lg hover:bg-white/10"
          onClick={() => {
            setNotificationsOpen(!isNotificationsOpen);
            setProfileDropdownOpen(false);
          }}
        >
          <FaBell className="h-6 w-6 group-hover:scale-110 transition-transform" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg animate-pulse">
              {notificationCount}
            </span>
          )}
        </button>
      </div>

      <div className="relative">
        <Link
          to="/client-messages"
          className="text-white hover:text-blue-100 transition-all duration-200 relative flex items-center focus:outline-none group p-2 rounded-lg hover:bg-white/10"
        >
          <FaEnvelope className="h-6 w-6 group-hover:scale-110 transition-transform" />
          {messageCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg">
              {messageCount}
            </span>
          )}
        </Link>
      </div>

      <div className="relative ml-4" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => {
            setProfileDropdownOpen(!isProfileDropdownOpen);
            setWalletDropdownOpen(false);
          }}
          className="flex items-center text-sm rounded-full focus:outline-none group"
        >
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center border-2 border-white/80 hover:border-white transition-all duration-200 shadow-lg hover:shadow-xl group-hover:scale-105">
            {userProfile?.avatar ? (
              <img
                src={userProfile.avatar}
                alt="User avatar"
                className="h-full w-full rounded-full object-cover"
                loading="lazy"
              />
            ) : (
              <FaUserCircle className="h-6 w-6 text-white" />
            )}
          </div>
          <span className="ml-3 text-white font-medium group-hover:text-blue-100 transition-colors">
            {userProfile?.username || 'User'}
          </span>
          <FaChevronDown className={`ml-2 h-4 w-4 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        {isProfileDropdownOpen && (
          <div className="origin-top-right absolute right-0 mt-3 w-56 rounded-xl shadow-2xl bg-white/95 backdrop-blur-md ring-1 ring-black/5 py-2 z-50 border border-gray-200/50 transform transition-all duration-200">
            <div className="px-4 py-3 text-gray-700 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50 rounded-t-xl">
              <div className="font-semibold text-gray-800">
                {userProfile?.username || 'User'}
              </div>
              <div className="text-xs text-gray-500 font-medium">{userProfile?.roleName || 'User'}</div>
            </div>
            <Link
              to={ROUTES.STUDENT_PROFILE}
              className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-600 transition-all duration-200 group"
              onClick={() => setProfileDropdownOpen(false)}
            >
              <FaUserCircle className="h-4 w-4 mr-3 text-blue-500 group-hover:scale-110 transition-transform" />
              My Profile
            </Link>
            <div className="border-t border-gray-100 my-1" />
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-600 text-left transition-all duration-200 group"
            >
              <FaSignOutAlt className="h-4 w-4 mr-3 text-red-500 group-hover:scale-110 transition-transform" />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

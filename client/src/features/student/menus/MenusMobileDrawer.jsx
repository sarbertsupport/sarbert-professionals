import {
  FaUserCircle,
  FaBriefcase,
  FaSearch,
  FaTimes,
  FaHeadset
} from 'react-icons/fa';
import { RiCoinsFill } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import logger from '../../../utils/logger';
import { ROUTES } from '../../../constants/routes';

export function MenusMobileDrawer({
  isMobileMenuOpen,
  setMobileMenuOpen,
  coinBalance,
  userProfile,
  setShowBuyModal,
  setShowHistoryModal,
  handleLogout
}) {
  return (
    <>
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          role="presentation"
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out z-50 md:hidden`}
      >
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <Link
            to="/"
            className="text-xl font-bold text-pink-600 flex items-center"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="bg-pink-600 text-white rounded-lg px-2 py-1 mr-1">S</span>
            <span>SkillsBridge</span>
          </Link>
          <button
            type="button"
            className="text-gray-700 focus:outline-none"
            onClick={() => setMobileMenuOpen(false)}
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto h-full">
          <div className="space-y-4">
            <Link
              to="/studentdashboard"
              className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg flex items-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FaBriefcase className="mr-3" />
              My Job Posts
            </Link>

            <Link
              to="/professionals"
              className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg flex items-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FaSearch className="mr-3" />
              Find Professionals
            </Link>

            <Link
              to={ROUTES.SUPPORT}
              className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-lg flex items-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FaHeadset className="mr-3" />
              Support
            </Link>

            <div className="px-4 py-2 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <RiCoinsFill className="mr-3 text-yellow-500" />
                  <span className="font-medium">Wallet Balance</span>
                </div>
                <span className="font-semibold">{coinBalance} Coins</span>
              </div>
              <div className="flex space-x-2 mt-3">
                <button
                  type="button"
                  className="flex-1 bg-yellow-500 text-white py-1 px-3 rounded text-sm hover:bg-yellow-600 transition-colors"
                  onClick={() => {
                    logger.debug('Menus: Opening buy coins modal (mobile)');
                    setShowBuyModal(true);
                    setMobileMenuOpen(false);
                  }}
                >
                  Buy Coins
                </button>
                <button
                  type="button"
                  className="flex-1 bg-blue-500 text-white py-1 px-3 rounded text-sm hover:bg-blue-600 transition-colors"
                  onClick={() => {
                    setShowHistoryModal(true);
                    setMobileMenuOpen(false);
                  }}
                >
                  History
                </button>
              </div>
            </div>

            <div className="px-4 py-2 bg-gray-50 rounded-lg">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mr-3">
                  <FaUserCircle className="text-white text-sm" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">{userProfile?.username || 'User'}</p>
                  <p className="text-xs text-gray-500">{userProfile?.roleName || 'User'}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Link
                  to={ROUTES.STUDENT_PROFILE}
                  className="flex-1 bg-blue-500 text-white py-1 px-3 rounded text-sm hover:bg-blue-600 transition-colors text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  type="button"
                  className="flex-1 bg-red-500 text-white py-1 px-3 rounded text-sm hover:bg-red-600 transition-colors"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

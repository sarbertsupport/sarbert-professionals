import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  X, 
  ChevronDown, 
  User, 
  Home, 
  Briefcase, 
  Wallet as WalletIcon, 
  ShoppingCart, 
  Settings, 
  LogOut,
  History,
  Bell,
  Mail,
  Key,
  LifeBuoy,
  HelpCircle,
} from 'lucide-react';
import BuyCoinsModal from '../wallet/BuyCoinsModal';
import TransactionHistory from '../wallet/TransactionHistory';
import { Link, useNavigate } from 'react-router-dom';
import ChangePasswordModal from '../student/ChangePasswordModal';
import { useAuthStore } from '../../store/useAuthStore';
import { useWalletStore } from '../../store/useWalletStore';
import { useAuthCheck } from '../../hooks/useAuthCheck';
import { ROUTES } from '../../constants/routes';
import { ROLES } from '../../constants/roles';
import { AuthErrorBanner } from './customHeader/AuthErrorBanner';
import { useCustomHeaderAuthEffects } from './customHeader/useCustomHeaderAuthEffects';
import { useCustomHeaderLogout } from './customHeader/useCustomHeaderLogout';

const CustomHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Zustand stores
  const userProfile = useAuthStore((state) => state.user);
  const isLoggedIn = !!useAuthStore((state) => state.token);
  const authError = useAuthStore((state) => state.authError);
  const setAuthError = useAuthStore((state) => state.setAuthError);
  const coinBalance = useWalletStore((state) => state.coinBalance);

  const clearWallet = useWalletStore((state) => state.clearWallet);

  const messagesPath =
    userProfile?.roleName === ROLES.STUDENT ? ROUTES.CLIENT_MESSAGES : ROUTES.MESSAGES;

  const { checkAuth } = useAuthCheck();

  const { handleUnauthorized, handleLogout } = useCustomHeaderLogout({
    navigate,
    clearWallet,
    setProfileOpen,
    setAuthError,
  });

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setWalletOpen(false);
        setProfileOpen(false);
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useCustomHeaderAuthEffects({
    checkAuth,
    showBuyModal,
    showChangePasswordModal,
    isLoggedIn,
  });

  return (
    <header className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white shadow-2xl sticky top-0 z-50 border-b border-blue-600/20">
      <AuthErrorBanner message={authError} onDismiss={() => setAuthError(null)} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-indigo-200 hover:from-blue-100 hover:to-white transition-all duration-300 transform hover:scale-105">
              SkillBridge
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 ml-10">
            <Link to="/" className="flex items-center px-4 py-2 text-sm font-medium text-white hover:text-blue-100 transition-all duration-200 rounded-lg hover:bg-white/10 group">
              <Home className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
              Home
            </Link>

            <Link
              to={ROUTES.FAQ}
              className="flex items-center px-4 py-2 text-sm font-medium text-white hover:text-blue-100 transition-all duration-200 rounded-lg hover:bg-white/10 group"
            >
              <HelpCircle className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
              FAQ
            </Link>

            {isLoggedIn ? (
              <>
                <Link to="/jobs" className="flex items-center px-4 py-2 text-sm font-medium text-white hover:text-blue-100 transition-all duration-200 rounded-lg hover:bg-white/10 group">
                  <Briefcase className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  Jobs
                </Link>

                <Link to={ROUTES.SUPPORT} className="flex items-center px-4 py-2 text-sm font-medium text-white hover:text-blue-100 transition-all duration-200 rounded-lg hover:bg-white/10 group">
                  <LifeBuoy className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  Support
                </Link>

                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => {
                      setWalletOpen(!walletOpen);
                      setProfileOpen(false);
                    }}
                    className="flex items-center text-white hover:text-blue-100 transition-all duration-200 focus:outline-none group"
                  >
                    <div className="flex items-center bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm px-4 py-2 rounded-full group-hover:from-yellow-500/30 group-hover:to-orange-500/30 transition-all duration-200 border border-yellow-400/30 hover:border-yellow-400/50 shadow-lg hover:shadow-xl">
                      <WalletIcon className="h-5 w-5 mr-2 text-yellow-400 drop-shadow-sm" />
                      <span className="font-semibold text-white">My Coins Wallet</span>
                      <ChevronDown className={`ml-2 h-4 w-4 transition-transform duration-200 ${walletOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                  {walletOpen && (
                    <div className="absolute mt-3 w-80 bg-white/95 backdrop-blur-md shadow-2xl rounded-xl py-3 z-50 border border-gray-200/50 right-0 transform transition-all duration-200 animate-in slide-in-from-top-2">
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600">Available Balance</span>
                          <div className="flex items-center bg-gradient-to-r from-yellow-100 to-orange-100 px-3 py-1 rounded-full">
                            <WalletIcon className="h-4 w-4 mr-2 text-yellow-600" />
                            <span className="font-bold text-gray-800 text-lg">{coinBalance}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3 space-y-2">
                        <button
                          className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 transition-all duration-200 text-left group border border-transparent hover:border-yellow-200"
                          onMouseDown={(e) => {
                            e.stopPropagation(); 
                            setShowBuyModal(true);
                            setTimeout(() => setWalletOpen(false), 100);
                          }}
                        >
                          <div className="flex items-center">
                            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-3 rounded-full mr-4 group-hover:scale-110 transition-transform shadow-lg">
                              <ShoppingCart className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">Buy More Coins</p>
                              <p className="text-xs text-gray-500">Add to your wallet balance</p>
                            </div>
                          </div>
                          <ChevronDown className="text-gray-400 text-xs transform -rotate-90 group-hover:text-gray-600 transition-colors" />
                        </button>
                        
                        <button
                          className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 text-left group border border-transparent hover:border-blue-200"
                          onMouseDown={(e) => {
                            e.stopPropagation(); 
                            setShowHistoryModal(true);
                            setTimeout(() => setWalletOpen(false), 100);
                          }}
                        >
                          <div className="flex items-center">
                            <div className="bg-gradient-to-r from-blue-400 to-indigo-400 p-3 rounded-full mr-4 group-hover:scale-110 transition-transform shadow-lg">
                              <History className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">Transaction History</p>
                              <p className="text-xs text-gray-500">View your purchase history</p>
                            </div>
                          </div>
                          <ChevronDown className="text-gray-400 text-xs transform -rotate-90 group-hover:text-gray-600 transition-colors" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    className="text-white hover:text-blue-100 transition-all duration-200 relative focus:outline-none group p-2 rounded-lg hover:bg-white/10"
                    onClick={() => {
                      setNotificationsOpen(!notificationsOpen);
                      setProfileOpen(false);
                    }}
                  >
                    <Bell className="h-6 w-6 group-hover:scale-110 transition-transform" />
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg animate-pulse">
                      3
                    </span>
                  </button>
                </div>

                <div className="relative">
                  <Link
                    to={messagesPath}
                    className="text-white hover:text-blue-100 transition-all duration-200 relative flex items-center focus:outline-none group p-2 rounded-lg hover:bg-white/10"
                  >
                    <Mail className="h-6 w-6 group-hover:scale-110 transition-transform" />
                    {(userProfile?.unreadMessagesCount || 0) > 0 && (
                      <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg">
                        {userProfile?.unreadMessagesCount || 0}
                      </span>
                    )}
                  </Link>
                </div>

                <div className="relative ml-4" ref={dropdownRef}>
                  <button
                    onClick={() => {
                      setProfileOpen(!profileOpen);
                      setWalletOpen(false);
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
                        <User className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <span className="ml-3 text-white font-medium group-hover:text-blue-100 transition-colors">
                      {userProfile?.username || 'User'}
                    </span>
                    <ChevronDown className={`ml-2 h-4 w-4 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {profileOpen && (
                    <div className="origin-top-right absolute right-0 mt-3 w-56 rounded-xl shadow-2xl bg-white/95 backdrop-blur-md ring-1 ring-black/5 py-2 z-50 border border-gray-200/50 transform transition-all duration-200 animate-in slide-in-from-top-2">
                      <div className="px-4 py-3 text-gray-700 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50 rounded-t-xl">
                        <div className="font-semibold text-gray-800">
                          {userProfile?.username || 'User'}
                        </div>
                        <div className="text-xs text-gray-500 font-medium">{userProfile?.roleName || 'User'}</div>
                      </div>
                      <Link 
                        to={userProfile?.roleName === 'ROLE_STUDENT' ? ROUTES.STUDENT_PROFILE : ROUTES.TEACHER_PROFILE}
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-600 transition-all duration-200 group"
                        onClick={() => setProfileOpen(false)}
                      >
                        <User className="h-4 w-4 mr-3 text-blue-500 group-hover:scale-110 transition-transform" />
                        My Profile
                      </Link>
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          setShowChangePasswordModal(true);
                        }}
                        className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-600 text-left transition-all duration-200 group"
                      >
                        <Key className="h-4 w-4 mr-3 text-blue-500 group-hover:scale-110 transition-transform" />
                        Change Password
                      </button>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-600 text-left transition-all duration-200 group"
                      >
                        <LogOut className="h-4 w-4 mr-3 text-red-500 group-hover:scale-110 transition-transform" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex space-x-4">
                <Link 
                  to="/login" 
                  className="px-6 py-2 text-sm font-medium text-white hover:text-blue-100 transition-all duration-200 rounded-lg hover:bg-white/10"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="px-6 py-2 text-sm font-medium bg-gradient-to-r from-white to-blue-50 text-blue-700 rounded-lg hover:from-blue-50 hover:to-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="inline-flex items-center justify-center p-3 rounded-lg text-white hover:text-blue-100 hover:bg-white/10 focus:outline-none transition-all duration-200"
            >
              {menuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-gradient-to-b from-blue-700 to-indigo-800 px-4 pb-6 shadow-2xl">
          <div className="pt-3 pb-4 space-y-2">
            <Link
              to="/"
              className="flex items-center px-4 py-3 rounded-xl text-base font-medium text-white hover:bg-white/10 transition-all duration-200 group"
              onClick={() => setMenuOpen(false)}
            >
              <Home className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
              Home
            </Link>

            <Link
              to={ROUTES.FAQ}
              className="flex items-center px-4 py-3 rounded-xl text-base font-medium text-white hover:bg-white/10 transition-all duration-200 group"
              onClick={() => setMenuOpen(false)}
            >
              <HelpCircle className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
              FAQ
            </Link>

            {isLoggedIn ? (
              <>
                <Link
                  to="/jobs"
                  className="flex items-center px-4 py-3 rounded-xl text-base font-medium text-white hover:bg-white/10 transition-all duration-200 group"
                  onClick={() => setMenuOpen(false)}
                >
                  <Briefcase className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                  Jobs
                </Link>

                <Link
                  to={ROUTES.SUPPORT}
                  className="flex items-center px-4 py-3 rounded-xl text-base font-medium text-white hover:bg-white/10 transition-all duration-200 group"
                  onClick={() => setMenuOpen(false)}
                >
                  <LifeBuoy className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                  Support
                </Link>

                <div className="px-4 py-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-xl border border-yellow-400/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <WalletIcon className="h-5 w-5 mr-3 text-yellow-400" />
                      <span className="font-semibold">Wallet Balance</span>
                    </div>
                    <span className="font-bold text-lg">{coinBalance} Coins</span>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-2 px-4 rounded-lg text-sm hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
                      onClick={() => {
                        setShowBuyModal(true);
                        setMenuOpen(false);
                      }}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Buy Coins
                    </button>
                    <button
                      className="flex-1 bg-gradient-to-r from-blue-500/30 to-indigo-500/30 text-white py-2 px-4 rounded-lg text-sm hover:from-blue-500/40 hover:to-indigo-500/40 transition-all duration-200 flex items-center justify-center backdrop-blur-sm border border-blue-400/30"
                      onClick={() => {
                        setShowHistoryModal(true);
                        setMenuOpen(false);
                      }}
                    >
                      <History className="h-4 w-4 mr-2" />
                      History
                    </button>
                  </div>
                </div>

                <Link
                  to="/notifications"
                  className="flex items-center px-4 py-3 rounded-xl text-base font-medium text-white hover:bg-white/10 transition-all duration-200 group"
                  onClick={() => setMenuOpen(false)}
                >
                  <Bell className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                  Notifications
                  <span className="ml-auto bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg">
                    3
                  </span>
                </Link>

                <Link
                  to={messagesPath}
                  className="flex items-center px-4 py-3 rounded-xl text-base font-medium text-white hover:bg-white/10 transition-all duration-200 group"
                  onClick={() => setMenuOpen(false)}
                >
                  <Mail className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                  Messages
                  <span className="ml-auto bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg">
                    {userProfile?.unreadMessagesCount || 0}
                  </span>
                </Link>

                <div className="px-4 py-3 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 backdrop-blur-sm rounded-xl border border-blue-400/30">
                  <div className="flex items-center px-3 py-2 rounded-xl text-base font-medium text-white">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center border-2 border-white/80 mr-3 shadow-lg">
                      {userProfile?.avatar ? (
                        <img 
                          src={userProfile.avatar} 
                          alt="Profile" 
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-6 w-6 text-white" />
                      )}
                    </div>
                    {userProfile?.username || 'User'}
                  </div>
                  <div className="ml-12 mt-3 space-y-2">
                    <Link
                      to={userProfile?.roleName === 'ROLE_STUDENT' ? ROUTES.STUDENT_PROFILE : ROUTES.TEACHER_PROFILE}
                      className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-all duration-200 group"
                      onClick={() => setMenuOpen(false)}
                    >
                      <User className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform" />
                      My Profile
                    </Link>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        setShowChangePasswordModal(true);
                      }}
                      className="w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-all duration-200 text-left group"
                    >
                      <Key className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform" />
                      Change Password
                    </button>
                    <Link
                      to="/settings"
                      className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-all duration-200 group"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform" />
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-red-500/20 transition-all duration-200 text-left group"
                    >
                      <LogOut className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-3 pt-3">
                <Link
                  to="/login"
                  className="block w-full text-center px-6 py-3 rounded-xl text-base font-medium text-white bg-gradient-to-r from-blue-800 to-indigo-800 hover:from-blue-900 hover:to-indigo-900 transition-all duration-200 shadow-lg hover:shadow-xl"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block w-full text-center px-6 py-3 rounded-xl text-base font-medium text-blue-800 bg-gradient-to-r from-white to-blue-50 hover:from-blue-50 hover:to-white transition-all duration-200 shadow-lg hover:shadow-xl"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {isLoggedIn && (
        <>
          {showBuyModal && (
            <BuyCoinsModal
              isOpen={showBuyModal}
              onClose={() => setShowBuyModal(false)}
              onSuccess={() => {
                checkAuth();
              }}
            />
          )}

          {showHistoryModal && (
            <TransactionHistory
              userId={userProfile?.userId}
              onClose={() => setShowHistoryModal(false)}
              onUnauthorized={handleUnauthorized}
            />
          )}

          {showChangePasswordModal && (
            <ChangePasswordModal
              onClose={() => setShowChangePasswordModal(false)}
              onSave={() => {}}
              onUnauthorized={handleUnauthorized}
            />
          )}
        </>
      )}
    </header>
  );
};

export default CustomHeader;
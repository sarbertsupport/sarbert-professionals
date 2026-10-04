import React, { useState, useEffect, useRef } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import logger from '../../utils/logger';
import { Link, useNavigate } from 'react-router-dom';

import { getCoinBalance } from '../../components/services/digitalCoins';
import BuyCoinsModal from '../wallet/BuyCoinsModal';
import TransactionHistory from '../wallet/TransactionHistory';
import { fetchUserProfile } from '../../components/services/authProfile';
import { logoutUser } from '../../components/services/authLogout';
import { useAuthStore } from '../../store/useAuthStore';
import { MenusDesktopNav } from './menus/MenusDesktopNav';
import { MenusMobileDrawer } from './menus/MenusMobileDrawer';

const Menus = () => {
  const [isWalletDropdownOpen, setWalletDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [coinBalance, setCoinBalance] = useState(0);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const isLoggedIn = useAuthStore((state) => !!state.token);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  const messageCount = userProfile?.unreadMessagesCount || 0;
  const notificationCount = 3;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setWalletDropdownOpen(false);
        setProfileDropdownOpen(false);
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = useAuthStore.getState().token || localStorage.getItem('authToken');
        if (token) {
          const profile = await fetchUserProfile(token);
          setUserProfile(profile);

          try {
            logger.debug('Menus: Fetching coin balance for user:', profile.userId);
            const balanceData = await getCoinBalance(profile.userId, token);
            logger.debug('Menus: Coin balance data received:', balanceData);
            setCoinBalance(balanceData?.coinBalance || 0);
            logger.debug('Menus: Coin balance set to:', balanceData?.coinBalance || 0);
          } catch (balanceErr) {
            logger.error('Failed to fetch coin balance:', balanceErr);
            logger.error('Balance error details:', {
              message: balanceErr.message,
              response: balanceErr.response?.data,
              status: balanceErr.response?.status
            });
            setCoinBalance(0);
          }
        }
      } catch (error) {
        logger.error('Error fetching user data:', error);
      }
    };

    if (isLoggedIn) {
      fetchData();
    } else {
      setUserProfile(null);
      setCoinBalance(0);
    }
  }, [isLoggedIn]);

  const handleLogout = () => {
    useAuthStore.getState().logout();
    logoutUser();
    navigate('/login');
  };

  if (!isInitialized) {
    return null;
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <header className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white shadow-2xl sticky top-0 z-50 border-b border-blue-600/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <button
              type="button"
              className="md:hidden mr-4 text-white hover:text-blue-100 transition-colors focus:outline-none"
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>

            <Link to="/" className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-indigo-200 hover:from-blue-100 hover:to-white transition-all duration-300 transform hover:scale-105">
              SkillBridge
            </Link>
          </div>

          <MenusDesktopNav
            dropdownRef={dropdownRef}
            isWalletDropdownOpen={isWalletDropdownOpen}
            setWalletDropdownOpen={setWalletDropdownOpen}
            isProfileDropdownOpen={isProfileDropdownOpen}
            setProfileDropdownOpen={setProfileDropdownOpen}
            isNotificationsOpen={isNotificationsOpen}
            setNotificationsOpen={setNotificationsOpen}
            coinBalance={coinBalance}
            messageCount={messageCount}
            notificationCount={notificationCount}
            userProfile={userProfile}
            setShowBuyModal={setShowBuyModal}
            setShowHistoryModal={setShowHistoryModal}
            handleLogout={handleLogout}
          />
        </div>
      </div>

      <MenusMobileDrawer
        isMobileMenuOpen={isMobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        coinBalance={coinBalance}
        userProfile={userProfile}
        setShowBuyModal={setShowBuyModal}
        setShowHistoryModal={setShowHistoryModal}
        handleLogout={handleLogout}
      />

      {showBuyModal && (
        <BuyCoinsModal
          isOpen={showBuyModal}
          onClose={() => setShowBuyModal(false)}
          onSuccess={() => {
            logger.debug('Coin purchase successful');
          }}
        />
      )}

      {showHistoryModal && (
        <TransactionHistory
          userId={userProfile?.userId}
          onClose={() => setShowHistoryModal(false)}
        />
      )}
    </header>
  );
};

export default Menus;

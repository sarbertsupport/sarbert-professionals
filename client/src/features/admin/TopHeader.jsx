import { useState, useEffect } from 'react';
import { logoutUser } from '../../components/services/authLogout';
import { useAuthStore } from '../../store/useAuthStore';
import { fetchUserProfile } from '../../components/services/authProfile';
import { 
  Search, 
  Bell, 
  Settings, 
  LogOut, 
  User, 
  ChevronDown,
  Menu
} from 'lucide-react';
import logger from '../../utils/logger';
import { fetchAdminSupportSummary } from '../../components/services/supportService';

const TopHeader = ({ activeTab }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'System Administrator'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [supportAttentionCount, setSupportAttentionCount] = useState(0);
  
  // Subscribe to auth store changes
  const { user, logout, token, isInitialized } = useAuthStore();

  useEffect(() => {
    const loadUserInfo = async () => {
      if (user) {
        // Handle different possible user data structures
        const userName = user.username || user.name || user.firstName || 'Admin User';
        const userEmail = user.email || 'admin@example.com';
        const userRole = user.roleName || user.role || 'System Administrator';

        setUserInfo({
          name: userName,
          email: userEmail,
          role: userRole
        });
        setIsLoading(false);
        return;
      }
      
      // If no user in store but we have a token, try to fetch user profile
      const authToken = token || localStorage.getItem('authToken');
      if (authToken && isInitialized) {
        try {
          const response = await fetchUserProfile(authToken);

          // Extract user data from the API response structure
          const profile = response?.body?.data || response;

          const userName = profile.username || profile.name || profile.firstName || 'Admin User';
          const userEmail = profile.email || 'admin@example.com';
          const userRole = profile.roleName || profile.role || 'System Administrator';

          setUserInfo({
            name: userName,
            email: userEmail,
            role: userRole
          });
          
          // Update the auth store with the fetched user data
          useAuthStore.getState().setUser(profile);
        } catch (error) {
          logger.error('TopHeader: fetch user profile failed', {
            message: error.message,
            status: error.response?.status
          });
        }
      }

      // Fallback to localStorage if available
      try {
        const storedUserInfo = localStorage.getItem('userInfo');
        if (storedUserInfo) {
          const parsed = JSON.parse(storedUserInfo);
          setUserInfo({
            name: parsed.name || parsed.firstName || 'Admin User',
            email: parsed.email || 'admin@example.com',
            role: parsed.role || 'System Administrator'
          });
        }
      } catch (error) {
        logger.error('Error parsing user info from localStorage:', error);
      }
      
      setIsLoading(false);
    };

    // Only load user info if auth is initialized
    if (isInitialized) {
      loadUserInfo();
    }
  }, [user, token, isInitialized]); // Added isInitialized as dependency

  useEffect(() => {
    let cancelled = false;
    const pollSupport = async () => {
      const authToken = token || localStorage.getItem('authToken');
      if (!authToken || !isInitialized) return;
      try {
        const s = await fetchAdminSupportSummary();
        if (!cancelled && s) {
          setSupportAttentionCount(Number(s.unreadByAdminTickets ?? 0));
        }
      } catch {
        /* non-fatal */
      }
    };
    pollSupport();
    const id = setInterval(pollSupport, 45000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [token, isInitialized]);

  const handleLogout = async () => {
    try {
      // Use Zustand store logout to properly update state
      logout();

      // Also clear localStorage for consistency
      const result = logoutUser();
      
      if (result.success) {
        // Redirect to login page
        window.location.href = '/login';
      } else {
        logger.error('TopHeader: Logout failed:', result.message);
        // Force redirect even if logout service fails
        window.location.href = '/login';
      }
    } catch (error) {
      logger.error('TopHeader: Error during logout:', error);
      // Force redirect even if there's an error
      window.location.href = '/login';
    }
  };

  const getPageTitle = (tab) => {
    const titles = {
      dashboard: 'Dashboard Overview',
      teachers: 'Teachers Management',
      students: 'Students Management',
      users: 'Users Management',
      transactions: 'Transactions',
      support: 'Support Desk',
      pricing: 'Pricing Management',
      discounts: 'Discount Management',
      settings: 'System Settings'
    };
    return titles[tab] || 'Admin Panel';
  };

  return (
    <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
      <div className="flex items-center justify-between h-20 px-8">
        {/* Left side */}
        <div className="flex items-center space-x-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{getPageTitle(activeTab)}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {activeTab === 'dashboard' ? `Welcome back, ${userInfo.name}! Here's what's happening today.` : 'Manage and monitor your platform'}
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <div className={`relative transition-all duration-200 ${isSearchFocused ? 'w-80' : 'w-64'}`}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className={`h-5 w-5 transition-colors ${isSearchFocused ? 'text-indigo-500' : 'text-gray-400'}`} />
              </div>
              <input
                type="text"
                className={`block w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm placeholder-gray-500`}
                placeholder="Search anything..."
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
            </div>
          </div>

          {/* Support queue attention (unread customer updates) */}
          <button
            type="button"
            title="Tickets needing admin attention"
            className="relative p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('admin-navigate-tab', { detail: { tab: 'support' } }));
            }}
          >
            <Bell className="h-5 w-5" />
            {supportAttentionCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                {supportAttentionCount > 99 ? '99+' : supportAttentionCount}
              </span>
            )}
          </button>

          {/* Settings */}
          <button className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200">
            <Settings className="h-5 w-5" />
          </button>

          {/* User dropdown */}
          <div className="relative">
            <button 
              className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center ring-2 ring-indigo-500/20 group-hover:ring-indigo-500/40 transition-all duration-200">
                  <span className="text-white font-semibold text-sm">
                    {userInfo.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">{userInfo.name}</p>
                <p className="text-xs text-gray-500">{userInfo.role}</p>
              </div>
              <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Dropdown menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {userInfo.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{userInfo.name}</p>
                      <p className="text-xs text-gray-500">{userInfo.email}</p>
                    </div>
                  </div>
                </div>
                <div className="py-2">
                  <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                    <User className="mr-3 h-4 w-4" />
                    Profile Settings
                  </button>
                  <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                    <Settings className="mr-3 h-4 w-4" />
                    Preferences
                  </button>
                </div>
                <div className="border-t border-gray-100 py-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopHeader;
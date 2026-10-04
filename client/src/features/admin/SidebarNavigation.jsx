import { 
  PieChart, 
  User, 
  Users, 
  Building2, 
  DollarSign, 
  CreditCard, 
  Percent, 
  Settings,
  Menu,
  X,
  UserCheck,
  Building,
  LogOut,
  Bell,
  Search,
  LifeBuoy
} from 'lucide-react';
import logger from '../../utils/logger';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { fetchUserProfile } from '../../components/services/authProfile';
import { preloadAdminTab } from './adminTabPreload';

const SidebarNavigation = ({ activeTab, setActiveTab, isCollapsed, onToggleCollapse }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: 'Admin User',
    email: 'admin@example.com'
  });
  const { user, token } = useAuthStore();

  useEffect(() => {
    const loadUserInfo = async () => {
      logger.debug('SidebarNavigation: Loading user info...');
      logger.debug('SidebarNavigation: Current user from store:', user);
      
      if (user) {
        const userName = user.username || user.name || user.firstName || 'Admin User';
        const userEmail = user.email || 'admin@example.com';
        
        logger.debug('SidebarNavigation: Extracted user info from store:', { userName, userEmail });
        
        setUserInfo({
          name: userName,
          email: userEmail
        });
        return;
      }
      
      // If no user in store but we have a token, try to fetch user profile
      const authToken = token || localStorage.getItem('authToken');
      if (authToken) {
        try {
          logger.debug('SidebarNavigation: fetching user profile');
          const response = await fetchUserProfile(authToken);
          logger.debug('SidebarNavigation: Fetched profile response:', response);
          
          // Extract user data from the API response structure
          const profile = response?.body?.data || response;
          logger.debug('SidebarNavigation: Extracted profile data:', profile);
          
          const userName = profile.username || profile.name || profile.firstName || 'Admin User';
          const userEmail = profile.email || 'admin@example.com';
          
          logger.debug('SidebarNavigation: Extracted user info from API:', { userName, userEmail });
          
          setUserInfo({
            name: userName,
            email: userEmail
          });
          
          // Update the auth store with the fetched user data
          useAuthStore.getState().setUser(profile);
        } catch (error) {
          logger.error('SidebarNavigation: Failed to fetch user profile:', error);
        }
      }
      
      // Fallback to localStorage if available
      try {
        const storedUserInfo = localStorage.getItem('userInfo');
        if (storedUserInfo) {
          const parsed = JSON.parse(storedUserInfo);
          logger.debug('SidebarNavigation: User info from localStorage:', parsed);
          setUserInfo({
            name: parsed.name || parsed.firstName || 'Admin User',
            email: parsed.email || 'admin@example.com'
          });
        }
      } catch (error) {
        logger.error('Error parsing user info from localStorage:', error);
      }
    };

    loadUserInfo();
  }, [user, token]);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: PieChart },
    { id: 'professionals', label: 'Professionals', icon: User },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'users', label: 'Users', icon: UserCheck },
    { id: 'business-addresses', label: 'Business Addresses', icon: Building2 },
    { id: 'transactions', label: 'Transactions', icon: DollarSign },
    { id: 'support', label: 'Support', icon: LifeBuoy },
    { id: 'pricing', label: 'Pricing', icon: CreditCard },
    { id: 'discounts', label: 'Discounts', icon: Percent },
    { id: 'user-management', label: 'Settings', icon: Settings }
  ];

  const handleLogout = () => {
    // Add logout logic here
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md bg-white shadow-md border border-gray-200"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-slate-900 to-slate-800 shadow-2xl
        transform transition-transform duration-300 ease-in-out
        ${isCollapsed ? '-translate-x-full' : 'translate-x-0'}
        lg:translate-x-0 lg:static lg:inset-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <PieChart className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
          </div>
        </div>

        {/* User Info Section */}
        <div className="px-6 py-4 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {userInfo.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {userInfo.name}
              </p>
              <p className="text-xs text-slate-300 truncate">
                {userInfo.email}
              </p>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xs text-slate-400">Welcome back!</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                type="button"
                onMouseEnter={() => preloadAdminTab(item.id)}
                onFocus={() => preloadAdminTab(item.id)}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`
                  w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }
                `}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg transition-all duration-200"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default SidebarNavigation;
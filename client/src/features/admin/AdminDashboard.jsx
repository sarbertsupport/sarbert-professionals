import { useState, useEffect, startTransition } from 'react';
import { fetchDashboardTotals } from '../../components/services/dashboardTotals';
import SidebarNavigation from './SidebarNavigation';
import TopHeader from './TopHeader';
import AdminDashboardContent from './AdminDashboardContent';
import logger from '../../utils/logger';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalProfessionals: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    dailyRevenue: 0,
    studentGrowth: 0,
    professionalGrowth: 0,
    yearlyGrowth: 0,
    monthlyGrowth: 0,
    dailyGrowth: 0,
    cardTotalRevenue: 0,
    mpesaTotalRevenue: 0,
    cardLifetimeTransactions: 0,
    mpesaLifetimeTransactions: 0,
    dailyCardRevenue: 0,
    dailyMpesaRevenue: 0,
    dailyCardTransactions: 0,
    dailyMpesaTransactions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadDashboardData();
    }
  }, [activeTab]);

  useEffect(() => {
    const onNavigate = (e) => {
      const tab = e?.detail?.tab;
      if (typeof tab === 'string') {
        startTransition(() => setActiveTab(tab));
      }
    };
    window.addEventListener('admin-navigate-tab', onNavigate);
    return () => window.removeEventListener('admin-navigate-tab', onNavigate);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetchDashboardTotals();
      if (response) {
        setStats(response);
      }
    } catch (error) {
      logger.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    startTransition(() => setActiveTab(tab));
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarNavigation
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
      />

      <div className="flex-1 lg:ml-0">
        <TopHeader activeTab={activeTab} />

        <main className="p-6">
          {loading && activeTab === 'dashboard' ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                <p className="text-gray-600">Loading...</p>
              </div>
            </div>
          ) : (
            <AdminDashboardContent activeTab={activeTab} stats={stats} />
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;

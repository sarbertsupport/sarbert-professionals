import { lazy, Suspense } from 'react';
import DashboardStats from './DashboardStats';
import AdminTabFallback from './AdminTabFallback';

const RevenueOverview = lazy(() => import('./RevenueOverview'));
const PaymentMethodTrendChart = lazy(() => import('./PaymentMethodTrendChart'));
const ProfessionalsTab = lazy(() => import('./TeachersTab'));
const ClientsTab = lazy(() => import('./StudentsTab'));
const UsersTab = lazy(() => import('./UsersTab'));
const BusinessAddressTab = lazy(() => import('./BusinessAddressTab'));
const TransactionsTab = lazy(() => import('./TransactionsTab'));
const PricingTab = lazy(() => import('./PricingTab'));
const BulkDiscountTab = lazy(() => import('./BulkDiscountTab'));
const SettingsTab = lazy(() => import('./SettingsTab'));
const SupportTab = lazy(() => import('./SupportTab'));

function TabSuspense({ children }) {
  return <Suspense fallback={<AdminTabFallback />}>{children}</Suspense>;
}

/**
 * Tab body only — keeps AdminDashboard small and defer-loads heavy sections.
 */
export default function AdminDashboardContent({ activeTab, stats }) {
  switch (activeTab) {
    case 'dashboard':
      return (
        <div className="space-y-6">
          <DashboardStats stats={stats} />
          <TabSuspense>
            <RevenueOverview />
          </TabSuspense>
          <TabSuspense>
            <PaymentMethodTrendChart />
          </TabSuspense>
        </div>
      );
    case 'professionals':
      return (
        <TabSuspense>
          <ProfessionalsTab />
        </TabSuspense>
      );
    case 'clients':
      return (
        <TabSuspense>
          <ClientsTab />
        </TabSuspense>
      );
    case 'users':
      return (
        <TabSuspense>
          <UsersTab />
        </TabSuspense>
      );
    case 'business-addresses':
      return (
        <TabSuspense>
          <BusinessAddressTab />
        </TabSuspense>
      );
    case 'transactions':
      return (
        <TabSuspense>
          <TransactionsTab />
        </TabSuspense>
      );
    case 'pricing':
      return (
        <TabSuspense>
          <PricingTab />
        </TabSuspense>
      );
    case 'discounts':
      return (
        <TabSuspense>
          <BulkDiscountTab />
        </TabSuspense>
      );
    case 'support':
      return (
        <TabSuspense>
          <SupportTab />
        </TabSuspense>
      );
    case 'revenue-overview':
      return (
        <div className="space-y-6">
          <TabSuspense>
            <RevenueOverview />
          </TabSuspense>
          <TabSuspense>
            <PaymentMethodTrendChart />
          </TabSuspense>
        </div>
      );
    case 'user-management':
      return (
        <TabSuspense>
          <SettingsTab />
        </TabSuspense>
      );
    default:
      return (
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="py-8 text-center">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Select a Section</h3>
            <p className="text-gray-600">Choose a section from the sidebar to get started.</p>
          </div>
        </div>
      );
  }
}

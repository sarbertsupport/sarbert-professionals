/** Preload admin tab chunks on sidebar hover for faster tab switches. */

const loaders = {
  dashboard: () => import('./RevenueOverview'),
  professionals: () => import('./TeachersTab'),
  clients: () => import('./StudentsTab'),
  users: () => import('./UsersTab'),
  'business-addresses': () => import('./BusinessAddressTab'),
  transactions: () => import('./TransactionsTab'),
  support: () => import('./SupportTab'),
  pricing: () => import('./PricingTab'),
  discounts: () => import('./BulkDiscountTab'),
  'user-management': () => import('./SettingsTab'),
};

export function preloadAdminTab(tabId) {
  const load = loaders[tabId];
  if (load) {
    void load();
  }
}

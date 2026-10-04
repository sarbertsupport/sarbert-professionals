import { useState, useEffect } from 'react';
import { X, CreditCard, Smartphone, CircleAlert } from 'lucide-react';
import TransactionFilters from './TransactionFilters';
import TransactionsTable from './TransactionsTable';
import TransactionDetailModal from './TransactionDetailModal';
import {
  fetchTransactions,
  fetchTransactionDetails,
  fetchDashboardTotals,
} from '../../components/services/dashboardTotals';
import logger from '../../utils/logger';

const TransactionsTab = () => {
  const [transactionFilters, setTransactionFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
    user: '',
    transactionType: '',
    transactionId: ''
  });

  const [transactionsData, setTransactionsData] = useState({
    transactions: [],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0
    },
    loading: false,
    error: null
  });

  const [modalState, setModalState] = useState({
    isOpen: false,
    loading: false,
    error: null,
    transaction: null
  });

  const [railSummary, setRailSummary] = useState({
    loading: true,
    dailyCardRevenue: 0,
    dailyMpesaRevenue: 0,
    dailyCardTransactions: 0,
    dailyMpesaTransactions: 0,
    dailyFailedTransactions: 0,
    failedTransactionsLifetime: 0,
  });

  useEffect(() => {
    loadTransactions(1, 10);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const d = await fetchDashboardTotals();
        if (cancelled) return;
        setRailSummary({
          loading: false,
          dailyCardRevenue: d.dailyCardRevenue ?? 0,
          dailyMpesaRevenue: d.dailyMpesaRevenue ?? 0,
          dailyCardTransactions: d.dailyCardTransactions ?? 0,
          dailyMpesaTransactions: d.dailyMpesaTransactions ?? 0,
          dailyFailedTransactions: d.dailyFailedTransactions ?? 0,
          failedTransactionsLifetime: d.failedTransactionsLifetime ?? 0,
        });
      } catch {
        if (!cancelled) {
          setRailSummary((prev) => ({ ...prev, loading: false }));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Calculate if any filters are active
  const hasActiveFilters = Object.values(transactionFilters).some(value => value !== '');

  const handleFilterChange = (field, value) => {
    setTransactionFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilter = (field) => {
    const newFilters = {
      ...transactionFilters,
      [field]: ''
    };
    
    setTransactionFilters(newFilters);
    
    // Reload transactions with the updated filters
    loadTransactions(1, 10, newFilters);
  };

  const clearAllFilters = () => {
    const emptyFilters = {
      startDate: '',
      endDate: '',
      status: '',
      user: '',
      transactionType: '',
      transactionId: ''
    };
    
    setTransactionFilters(emptyFilters);
    
    // Reload transactions with empty filters (shows all transactions)
    loadTransactions(1, 10, emptyFilters);
  };

  const loadTransactions = async (page, size, customFilters = null) => {
    try {
      setTransactionsData(prev => ({
        ...prev,
        loading: true,
        error: null
      }));

      // Use custom filters if provided, otherwise use current state
      const filters = customFilters || {
        ...transactionFilters,
        startDate: transactionFilters.startDate || '',
        endDate: transactionFilters.endDate || ''
      };

      logger.debug('Loading transactions with filters:', filters); // Debug log

      // Use fetchTransactions instead of fetchDashboardTotals
      const response = await fetchTransactions(page, size, filters);
      
      logger.debug('API Response:', response); // Debug log
      
      if (response.success) {
        setTransactionsData({
          transactions: response.transactions || [],
          pagination: response.pagination,
          loading: false,
          error: null
        });
      } else {
        setTransactionsData(prev => ({
          ...prev,
          loading: false,
          error: response.error || 'Failed to fetch transactions'
        }));
      }
    } catch (error) {
      logger.error("Error loading transactions:", error);
      setTransactionsData(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  };

  const handleViewTransaction = async (id) => {
    setModalState({
      isOpen: true,
      loading: true,
      error: null,
      transaction: null
    });

    try {
      const response = await fetchTransactionDetails(id);
      
      if (response.success) {
        setModalState({
          isOpen: true,
          loading: false,
          error: null,
          transaction: response.transaction
        });
      } else {
        setModalState({
          isOpen: true,
          loading: false,
          error: response.error || 'Failed to fetch transaction details',
          transaction: null
        });
      }
    } catch (error) {
      logger.error("Error loading transaction details:", error);
      setModalState({
        isOpen: true,
        loading: false,
        error: error.message,
        transaction: null
      });
    }
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      loading: false,
      error: null,
      transaction: null
    });
  };

  const refreshTransactionInModal = async (id) => {
    try {
      const response = await fetchTransactionDetails(id);
      if (response.success) {
        setModalState((prev) => ({
          ...prev,
          transaction: response.transaction,
        }));
      }
    } catch (error) {
      logger.error('Error refreshing transaction in modal:', error);
    }
  };

  const handlePageChange = (newPage) => {
    loadTransactions(newPage, 10);
  };

  // Function to apply filters and reload transactions
  const applyFilters = () => {
    logger.debug('Applying filters:', transactionFilters); // Debug log
    loadTransactions(1, 10);
  };

  const fmtMoney = (n) =>
    `$${Number(n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      {/* Today’s purchase rails (completed) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <div className="rounded-lg border border-indigo-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-indigo-700">
            <CreditCard className="h-4 w-4 shrink-0" />
            <span className="text-xs font-semibold uppercase tracking-wide">Daily card revenue</span>
          </div>
          <p className="mt-2 text-xl font-bold text-gray-900">
            {railSummary.loading ? '…' : fmtMoney(railSummary.dailyCardRevenue)}
          </p>
          <p className="text-xs text-gray-500">Completed Paystack purchases today</p>
        </div>
        <div className="rounded-lg border border-indigo-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-indigo-700">
            <CreditCard className="h-4 w-4 shrink-0" />
            <span className="text-xs font-semibold uppercase tracking-wide">Daily card transactions</span>
          </div>
          <p className="mt-2 text-xl font-bold text-gray-900">
            {railSummary.loading ? '…' : railSummary.dailyCardTransactions}
          </p>
          <p className="text-xs text-gray-500">Count for today</p>
        </div>
        <div className="rounded-lg border border-emerald-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-700">
            <Smartphone className="h-4 w-4 shrink-0" />
            <span className="text-xs font-semibold uppercase tracking-wide">Daily M-Pesa revenue</span>
          </div>
          <p className="mt-2 text-xl font-bold text-gray-900">
            {railSummary.loading ? '…' : fmtMoney(railSummary.dailyMpesaRevenue)}
          </p>
          <p className="text-xs text-gray-500">Completed STK purchases today</p>
        </div>
        <div className="rounded-lg border border-emerald-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-700">
            <Smartphone className="h-4 w-4 shrink-0" />
            <span className="text-xs font-semibold uppercase tracking-wide">Daily M-Pesa transactions</span>
          </div>
          <p className="mt-2 text-xl font-bold text-gray-900">
            {railSummary.loading ? '…' : railSummary.dailyMpesaTransactions}
          </p>
          <p className="text-xs text-gray-500">Count for today</p>
        </div>
        <div className="rounded-lg border border-rose-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-rose-700">
            <CircleAlert className="h-4 w-4 shrink-0" />
            <span className="text-xs font-semibold uppercase tracking-wide">Failed purchases today</span>
          </div>
          <p className="mt-2 text-xl font-bold text-gray-900">
            {railSummary.loading ? '…' : railSummary.dailyFailedTransactions}
          </p>
          <p className="text-xs text-gray-500">
            {railSummary.loading
              ? '…'
              : `${Number(railSummary.failedTransactionsLifetime).toLocaleString()} failed all-time`}
          </p>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={clearAllFilters}
            className="flex items-center space-x-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
          >
            <X className="h-4 w-4" />
            <span>Clear All Filters</span>
          </button>
        </div>
      )}

      <TransactionFilters
        filters={transactionFilters}
        onFilterChange={handleFilterChange}
        onClearFilter={clearFilter}
        onClearAll={clearAllFilters}
        onApplyFilters={applyFilters}
      />

      <TransactionsTable
        transactions={transactionsData.transactions}
        pagination={transactionsData.pagination}
        loading={transactionsData.loading}
        error={transactionsData.error}
        onViewTransaction={handleViewTransaction}
        onPageChange={handlePageChange}
      />

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        transaction={modalState.transaction}
        loading={modalState.loading}
        error={modalState.error}
        onRefreshTransaction={refreshTransactionInModal}
      />
    </div>
  );
};

export default TransactionsTab;
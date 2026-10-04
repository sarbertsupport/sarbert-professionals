import { Search, X, Filter, Calendar, User, Hash } from 'lucide-react';

const TransactionFilters = ({
  filters,
  onFilterChange,
  onClearFilter,
  onClearAll,
  onApplyFilters
}) => {
  const filterLabels = {
    startDate: 'Start Date',
    endDate: 'End Date',
    status: 'Status',
    user: 'User',
    transactionType: 'Type',
    transactionId: 'Transaction ID'
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      {/* Compact Header - Remove Clear All button from here */}
      <div className="flex items-center mb-4">
        <Filter className="w-4 h-4 text-blue-600 mr-2" />
        <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
      </div>

      {/* Compact Filter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Date Range */}
        <div className="relative">
          <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => onFilterChange('startDate', e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="relative">
          <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => onFilterChange('endDate', e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Status */}
        <div className="relative">
          <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
          >
            <option value="">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>

        {/* Transaction Type */}
        <div className="relative">
          <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
          <select
            value={filters.transactionType}
            onChange={(e) => onFilterChange('transactionType', e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
          >
            <option value="">All Types</option>
            <option value="DEBIT">Debit</option>
            <option value="CREDIT">Credit</option>
          </select>
        </div>

        {/* User Email */}
        <div className="relative">
          <label className="block text-xs font-medium text-gray-700 mb-1">User Email</label>
          <div className="relative">
            <User className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
            <input
              type="text"
              value={filters.user}
              onChange={(e) => onFilterChange('user', e.target.value)}
              placeholder="Email..."
              className="w-full pl-7 pr-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Transaction ID */}
        <div className="relative">
          <label className="block text-xs font-medium text-gray-700 mb-1">Transaction ID</label>
          <div className="relative">
            <Hash className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
            <input
              type="text"
              value={filters.transactionId}
              onChange={(e) => onFilterChange('transactionId', e.target.value)}
              placeholder="UUID, DB id, or M-Pesa CheckoutRequestID…"
              className="w-full pl-7 pr-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Apply Button */}
      <div className="flex justify-end mt-3 pt-3 border-t border-gray-200">
        <button
          onClick={onApplyFilters}
          className="px-4 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors flex items-center"
        >
          <Search className="w-3 h-3 mr-1" />
          Apply
        </button>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-xs font-medium text-gray-700">Active:</span>
            {Object.entries(filters).map(([key, value]) => {
              if (!value) return null;
              return (
                <span
                  key={key}
                  className="inline-flex items-center space-x-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                >
                  <span>{filterLabels[key]}: {value}</span>
                  <button
                    onClick={() => onClearFilter(key)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-2 h-2" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionFilters;
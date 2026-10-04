import React from 'react';

export const BulkDiscountFilters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange
}) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="discount-search" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            id="discount-search"
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Min coins, %, or creator..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div className="sm:w-48">
          <label htmlFor="discount-status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="discount-status"
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
    </div>
  );
};

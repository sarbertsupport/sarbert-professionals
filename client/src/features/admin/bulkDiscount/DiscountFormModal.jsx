import React from 'react';

export const DiscountFormModal = ({
  open,
  variant,
  title,
  formData,
  formErrors,
  isProcessing,
  onClose,
  onSubmit,
  onInputChange,
  onActiveChange
}) => {
  if (!open) return null;

  const submitLabel =
    variant === 'add' ? 'Add Discount' : 'Update Discount';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" />
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              {title}
            </h3>
            <form onSubmit={onSubmit}>
              <div className="mb-4">
                <label htmlFor="minCoins" className="block text-sm font-medium text-gray-700">
                  Minimum Coins
                </label>
                <input
                  type="number"
                  name="minCoins"
                  id="minCoins"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                    formErrors.minCoins ? 'border-red-500' : 'border'
                  }`}
                  value={formData.minCoins}
                  onChange={onInputChange}
                  min="1"
                />
                {formErrors.minCoins && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.minCoins}</p>
                )}
              </div>
              <div className="mb-4">
                <label htmlFor="discountPercentage" className="block text-sm font-medium text-gray-700">
                  Discount Percentage
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="number"
                    name="discountPercentage"
                    id="discountPercentage"
                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                      formErrors.discountPercentage ? 'border-red-500' : 'border'
                    }`}
                    value={formData.discountPercentage}
                    onChange={onInputChange}
                    step="0.01"
                    min="0.01"
                    max="100"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">%</span>
                  </div>
                </div>
                {formErrors.discountPercentage && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.discountPercentage}</p>
                )}
              </div>
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  name="active"
                  id="active"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  checked={formData.active}
                  onChange={onActiveChange}
                />
                <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                  Active
                </label>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : submitLabel}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={onClose}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

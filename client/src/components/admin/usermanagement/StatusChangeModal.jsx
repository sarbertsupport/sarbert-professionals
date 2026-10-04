import { X, User } from 'lucide-react';
import { CheckCircle } from 'lucide-react';

const StatusChangeModal = ({
  selectedUser,
  modalSuccessMessage,
  setIsStatusModalOpen,
  confirmStatusChange
}) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 transition-opacity" 
          aria-hidden="true"
          onClick={() => setIsStatusModalOpen(false)}
        >
          <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
          <div className="px-6 py-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedUser.activeStatus ? 'Deactivate User' : 'Activate User'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {modalSuccessMessage ? (
                    <span className="text-green-600 dark:text-green-400">{modalSuccessMessage}</span>
                  ) : (
                    `Are you sure you want to ${selectedUser.activeStatus ? 'deactivate' : 'activate'} this user?`
                  )}
                </p>
              </div>
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {!modalSuccessMessage && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-medium">
                    {selectedUser.username?.charAt(0) || 'U'}
                  </div>
                  <div className="ml-4">
                    <div className="font-medium text-gray-900 dark:text-white">{selectedUser.username || 'Unknown User'}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{selectedUser.email || 'N/A'}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 flex justify-end space-x-3">
            {!modalSuccessMessage && (
              <>
                <button
                  type="button"
                  onClick={() => setIsStatusModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmStatusChange}
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    selectedUser.activeStatus
                      ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                      : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2`}
                >
                  {selectedUser.activeStatus ? 'Deactivate' : 'Activate'}
                </button>
              </>
            )}
            {modalSuccessMessage && (
              <button
                type="button"
                onClick={() => setIsStatusModalOpen(false)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusChangeModal;
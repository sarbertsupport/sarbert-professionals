import { X, User, Shield } from 'lucide-react';
import { CheckCircle } from 'lucide-react';

const RoleAssignmentModal = ({
  selectedUser,
  roleAssignment,
  setRoleAssignment,
  formErrors,
  modalSuccessMessage,
  setIsRoleAssignmentModalOpen,
  handleRoleAssignment,
  roles
}) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 transition-opacity" 
          aria-hidden="true"
          onClick={() => setIsRoleAssignmentModalOpen(false)}
        >
          <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
          <div className="px-6 py-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Assign Role</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {modalSuccessMessage ? (
                    <span className="text-green-600 dark:text-green-400">{modalSuccessMessage}</span>
                  ) : (
                    `Assign a new role to ${selectedUser.username || 'this user'}`
                  )}
                </p>
              </div>
              <button
                onClick={() => setIsRoleAssignmentModalOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {!modalSuccessMessage && (
              <div className="mt-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">User</label>
                  <div className="flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-sm">
                      <User className="w-4 h-4 mr-2" />
                    </span>
                    <span className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                      {selectedUser.username} ({selectedUser.email})
                    </span>
                  </div>
                </div>

                <div>
                  <label htmlFor="roleId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Select Role
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Shield className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    </div>
                    <select
                      id="roleId"
                      className={`pl-10 pr-4 py-2 w-full rounded-md border ${
                        formErrors.roleId ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 
                        'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500'
                      } shadow-sm dark:bg-gray-700 dark:text-white appearance-none`}
                      value={roleAssignment.roleId}
                      onChange={(e) => setRoleAssignment({...roleAssignment, roleId: e.target.value})}
                    >
                      <option value="">Select a role</option>
                      {roles.map(role => (
                        <option key={role.roleId} value={role.roleId}>
                          {role.roleName.replace('ROLE_', '')}
                        </option>
                      ))}
                    </select>
                  </div>
                  {formErrors.roleId && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.roleId}</p>
                  )}
                </div>
              </div>
            )}
            {modalSuccessMessage && (
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 mr-2" />
                  <p className="text-green-800 dark:text-green-200 font-medium">{modalSuccessMessage}</p>
                </div>
              </div>
            )}
          </div>

          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 flex justify-end space-x-3">
            {!modalSuccessMessage && (
              <>
                <button
                  type="button"
                  onClick={() => setIsRoleAssignmentModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRoleAssignment}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Assign Role
                </button>
              </>
            )}
            {modalSuccessMessage && (
              <button
                type="button"
                onClick={() => setIsRoleAssignmentModalOpen(false)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
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

export default RoleAssignmentModal;
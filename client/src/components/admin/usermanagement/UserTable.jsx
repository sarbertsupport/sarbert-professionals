import { 
    Eye, ToggleLeft, ToggleRight, ChevronLeft, ChevronRight, 
    ChevronsLeft, ChevronsRight, Trash2, Key ,Search
  } from 'lucide-react';
  import { Mail, User, Calendar, CheckCircle, XCircle } from 'lucide-react';
  import Pagination from './Pagination';
  
  const UserTable = ({
    loading,
    error,
    users,
    currentPage,
    usersPerPage,
    totalCount,
    totalPages,
    handleViewDetails,
    handleToggleStatus,
    handleDeleteUser,
    setCurrentPage,
    setRoleAssignment,
    setIsRoleAssignmentModalOpen
  }) => {
    const getTypeColor = (type) => {
      return type === 'Professional' 
        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    };
  
    const getStatusColor = (status) => {
      switch (status) {
        case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case 'inactive': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      }
    };
  
    const getStatusIcon = (status) => {
      switch (status) {
        case 'active': return <CheckCircle className="w-5 h-5 text-green-500" />;
        case 'inactive': return <XCircle className="w-5 h-5 text-red-500" />;
        default: return null;
      }
    };
  
    const formatDate = (dateString) => {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('en-US', options);
    };
  
    // Loading state
    if (loading) {
      return (
        <div className="p-8 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      );
    }
  
    // Error state
    if (error) {
      return (
        <div className="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg m-4">
          {error}
        </div>
      );
    }
  
    return (
      <>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-medium">
                          {user.username?.charAt(0) || 'U'}
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900 dark:text-white">{user.username || 'Unknown'}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                        {user.email || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(user.type)}`}>
                        {user.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(user.status)}
                        <span className={`ml-2 px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(user.status)}`}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                        {formatDate(user.joined)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button 
                        onClick={() => handleViewDetails(user.id)}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 p-2 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                        title="View details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(user.id, user.activeStatus)}
                        className={`p-2 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          user.status === 'active' 
                            ? 'text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300' 
                            : 'text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300'
                        }`}
                        title={user.status === 'active' ? 'Deactivate user' : 'Activate user'}
                      >
                        {user.status === 'active' ? (
                          <ToggleRight className="w-5 h-5" />
                        ) : (
                          <ToggleLeft className="w-5 h-5" />
                        )}
                      </button>
                      <button 
                        onClick={() => {
                          setRoleAssignment(prev => ({...prev, userId: user.id}));
                          setIsRoleAssignmentModalOpen(true);
                        }}
                        className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 p-2 rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
                        title="Assign role"
                      >
                        <Key className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                        title="Delete user"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                      <Search className="w-12 h-12 mb-4 text-gray-300 dark:text-gray-600" />
                      <h3 className="text-lg font-medium">No users found</h3>
                      <p className="mt-1">Try adjusting your search or filter criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
  
        {/* Pagination */}
        {totalCount > 0 && (
          <Pagination 
            currentPage={currentPage}
            usersPerPage={usersPerPage}
            totalCount={totalCount}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        )}
      </>
    );
  };
  
  export default UserTable;
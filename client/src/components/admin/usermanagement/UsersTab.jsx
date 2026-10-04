import { useState, useEffect } from 'react';
import { 
  UserPlus, Plus, Search 
} from 'lucide-react';
import logger from '../../../utils/logger';
import { fetchAllUsers, getUserById, fetchFilteredUsers, allUsersPaginated,
    createUser, enableUser, disableUser, deleteUser, assignRoleToUser,
    fetchAllRoles, getRoleById, createRole, deleteRole} from '../../services/users';
import UserTable from './UserTable';
import UserDetailsModal from './UserDetailsModal';
import CreateUserModal from './CreateUserModal';
import StatusChangeModal from './StatusChangeModal';
import DeleteUserModal from './DeleteUserModal';
import RoleAssignmentModal from './RoleAssignmentModal';
import CreateRoleModal from './CreateRoleModal';
import { transformApiData } from './utils';

const UsersTab = () => {
  // State management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isRoleAssignmentModalOpen, setIsRoleAssignmentModalOpen] = useState(false);
  const [isRoleCreateModalOpen, setIsRoleCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [roles, setRoles] = useState([]);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    roleId: ''
  });
  const [newRole, setNewRole] = useState({
    roleName: ''
  });
  const [roleAssignment, setRoleAssignment] = useState({
    userId: '',
    roleId: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [modalSuccessMessage, setModalSuccessMessage] = useState('');

  // Fetch users with filters
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = {
        roleName: typeFilter === 'all' ? null : (typeFilter === 'Professional' ? 'ROLE_TUTOR' : 'ROLE_STUDENT'),
        activeStatus: statusFilter === 'all' ? null : (statusFilter === 'active'),
        searchTerm: searchTerm || null,
        page: currentPage,
        size: usersPerPage
      };

      const response = await allUsersPaginated(
        filters.page,
        filters.size,
        {
          roleName: filters.roleName,
          activeStatus: filters.activeStatus,
          searchTerm: filters.searchTerm
        }
      );

      if (response.success) {
        setUsers(transformApiData(response.data));
        setTotalCount(response.pagination.totalCount);
        setTotalPages(response.pagination.totalPages);
      }
    } catch (err) {
      setError('Failed to load users. Please try again later.');
      logger.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all roles
  const fetchRoles = async () => {
    try {
      const response = await fetchAllRoles();
      if (response && response.body && response.body.data) {
        setRoles(response.body.data);
      }
    } catch (err) {
      logger.error('Error fetching roles:', err);
      setError('Failed to load roles. Please try again later.');
    }
  }

  // Fetch users when filters or page changes
  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [searchTerm, statusFilter, typeFilter, currentPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, typeFilter]);
  
  // Fetch detailed user data when modal opens
  const handleViewDetails = async (userId) => {
    try {
      const response = await getUserById(userId);
      if (response.body?.data) {
        setSelectedUser(transformApiData([response.body.data])[0]);
      } else {
        setSelectedUser(users.find(u => u.id === userId));
      }
      setIsModalOpen(true);
    } catch (err) {
      logger.error('Error fetching user details:', err);
      setSelectedUser(users.find(u => u.id === userId));
      setIsModalOpen(true);
    }
  };

  // Handle user status toggle
  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      setSelectedUser(users.find(u => u.id === userId));
      setIsStatusModalOpen(true);
      setModalSuccessMessage('');
    } catch (err) {
      logger.error('Error preparing status change:', err);
      setError('Failed to prepare status change. Please try again.');
    }
  };

  // Confirm status change
  const confirmStatusChange = async () => {
    try {
      if (!selectedUser) return;
      
      let response;
      if (selectedUser.activeStatus) {
        response = await disableUser(selectedUser.id);
      } else {
        response = await enableUser(selectedUser.id);
      }

      if (response && response.success) {
        setModalSuccessMessage(`User has been successfully ${selectedUser.activeStatus ? 'deactivated' : 'activated'}`);
        setTimeout(() => {
          setIsStatusModalOpen(false);
          setSuccessMessage(`User ${selectedUser.activeStatus ? 'disabled' : 'enabled'} successfully`);
          fetchUsers();
          setSelectedUser(null);
        }, 1500);
      }
    } catch (err) {
      logger.error('Error changing user status:', err);
      setError(`Failed to ${selectedUser.activeStatus ? 'disable' : 'enable'} user. Please try again.`);
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    try {
      setSelectedUser(users.find(u => u.id === userId));
      setIsDeleteModalOpen(true);
      setModalSuccessMessage('');
    } catch (err) {
      logger.error('Error preparing user deletion:', err);
      setError('Failed to prepare user deletion. Please try again.');
    }
  };

  // Confirm user deletion
  const confirmUserDeletion = async () => {
    try {
      if (!selectedUser) return;
      
      const response = await deleteUser(selectedUser.id);
      
      if (response && response.success) {
        setModalSuccessMessage('User has been successfully deleted');
        setTimeout(() => {
          setIsDeleteModalOpen(false);
          setSuccessMessage('User deleted successfully');
          fetchUsers();
          setSelectedUser(null);
        }, 1500);
      }
    } catch (err) {
      logger.error('Error deleting user:', err);
      setError('Failed to delete user. Please try again.');
    }
  };

  // Handle create new user
  const handleCreateUser = async () => {
    try {
      // Validate form
      const errors = {};
      if (!newUser.username) errors.username = 'Username is required';
      if (!newUser.email) errors.email = 'Email is required';
      if (!newUser.password) errors.password = 'Password is required';
      if (newUser.password !== newUser.confirmPassword) errors.confirmPassword = 'Passwords do not match';
      if (!newUser.roleId) errors.roleId = 'Role is required';
      
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      const response = await createUser({
        username: newUser.username,
        email: newUser.email,
        password: newUser.password,
        confirmPassword: newUser.confirmPassword,
        roleId: parseInt(newUser.roleId)
      });

      if (response && response.success) {
        setModalSuccessMessage('User has been successfully created');
        setTimeout(() => {
          setIsCreateModalOpen(false);
          setSuccessMessage('User created successfully');
          setNewUser({
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            roleId: ''
          });
          fetchUsers();
          setModalSuccessMessage('');
        }, 1500);
      }
    } catch (err) {
      logger.error('Error creating user:', err);
      setError('Failed to create user. Please try again.');
    }
  };

  // Handle role assignment
  const handleRoleAssignment = async () => {
    try {
      // Validate form
      const errors = {};
      if (!roleAssignment.userId) errors.userId = 'User is required';
      if (!roleAssignment.roleId) errors.roleId = 'Role is required';
      
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      const response = await assignRoleToUser({
        userId: parseInt(roleAssignment.userId),
        roleId: parseInt(roleAssignment.roleId)
      });

      if (response && response.success) {
        setModalSuccessMessage('Role has been successfully assigned');
        setTimeout(() => {
          setIsRoleAssignmentModalOpen(false);
          setSuccessMessage('Role assigned successfully');
          setRoleAssignment({
            userId: '',
            roleId: ''
          });
          fetchUsers();
          setModalSuccessMessage('');
        }, 1500);
      }
    } catch (err) {
      logger.error('Error assigning role:', err);
      setError('Failed to assign role. Please try again.');
    }
  };

  // Handle create new role
  const handleCreateRole = async () => {
    try {
      // Validate form
      const errors = {};
      if (!newRole.roleName) errors.roleName = 'Role name is required';
      
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      const response = await createRole({
        roleName: newRole.roleName
      });

      if (response && response.success) {
        setModalSuccessMessage('Role has been successfully created');
        setTimeout(() => {
          setIsRoleCreateModalOpen(false);
          setSuccessMessage('Role created successfully');
          setNewRole({
            roleName: ''
          });
          fetchRoles();
          setModalSuccessMessage('');
        }, 1500);
      }
    } catch (err) {
      logger.error('Error creating role:', err);
      setError('Failed to create role. Please try again.');
    }
  };

  // Options for filters
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'Student', label: 'Students' },
    { value: 'Professional', label: 'Professionals' }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-colors duration-300">
      {/* Header with controls */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">User Management</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage all system users</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative flex-grow sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-600 dark:focus:border-indigo-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-600 dark:focus:border-indigo-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          
          <select
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-600 dark:focus:border-indigo-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            {typeOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 transition-colors duration-300"
          >
            <UserPlus className="w-5 h-5" />
            <span className="hidden sm:inline">Add User</span>
          </button>

          <button
            onClick={() => setIsRoleCreateModalOpen(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors duration-300"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Role</span>
          </button>
        </div>
      </div>

      {/* Success and error messages */}
      {successMessage && (
        <div className="p-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-lg m-4">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg m-4">
          {error}
        </div>
      )}

      {/* User Table */}
      <UserTable 
        loading={loading}
        error={error}
        users={users}
        currentPage={currentPage}
        usersPerPage={usersPerPage}
        totalCount={totalCount}
        totalPages={totalPages}
        handleViewDetails={handleViewDetails}
        handleToggleStatus={handleToggleStatus}
        handleDeleteUser={handleDeleteUser}
        setCurrentPage={setCurrentPage}
        setRoleAssignment={setRoleAssignment}
        setIsRoleAssignmentModalOpen={setIsRoleAssignmentModalOpen}
      />

      {/* Modals */}
      {isModalOpen && selectedUser && (
        <UserDetailsModal
          selectedUser={selectedUser}
          setIsModalOpen={setIsModalOpen}
          handleToggleStatus={handleToggleStatus}
        />
      )}

      {isCreateModalOpen && (
        <CreateUserModal
          newUser={newUser}
          setNewUser={setNewUser}
          formErrors={formErrors}
          modalSuccessMessage={modalSuccessMessage}
          setIsCreateModalOpen={setIsCreateModalOpen}
          handleCreateUser={handleCreateUser}
          roles={roles}
        />
      )}

      {isStatusModalOpen && selectedUser && (
        <StatusChangeModal
          selectedUser={selectedUser}
          modalSuccessMessage={modalSuccessMessage}
          setIsStatusModalOpen={setIsStatusModalOpen}
          confirmStatusChange={confirmStatusChange}
        />
      )}

      {isDeleteModalOpen && selectedUser && (
        <DeleteUserModal
          selectedUser={selectedUser}
          modalSuccessMessage={modalSuccessMessage}
          setIsDeleteModalOpen={setIsDeleteModalOpen}
          confirmUserDeletion={confirmUserDeletion}
        />
      )}

      {isRoleAssignmentModalOpen && selectedUser && (
        <RoleAssignmentModal
          selectedUser={selectedUser}
          roleAssignment={roleAssignment}
          setRoleAssignment={setRoleAssignment}
          formErrors={formErrors}
          modalSuccessMessage={modalSuccessMessage}
          setIsRoleAssignmentModalOpen={setIsRoleAssignmentModalOpen}
          handleRoleAssignment={handleRoleAssignment}
          roles={roles}
        />
      )}

      {isRoleCreateModalOpen && (
        <CreateRoleModal
          newRole={newRole}
          setNewRole={setNewRole}
          formErrors={formErrors}
          modalSuccessMessage={modalSuccessMessage}
          setIsRoleCreateModalOpen={setIsRoleCreateModalOpen}
          handleCreateRole={handleCreateRole}
        />
      )}
    </div>
  );
};

export default UsersTab;
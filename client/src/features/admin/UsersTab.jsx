import { useState, useEffect, useMemo } from 'react';
import { Plus, UserPlus, CheckCircle, XCircle } from 'lucide-react';
import {
  getUserById,
  allUsersPaginated,
  createUser,
  enableUser,
  disableUser,
  assignRoleToUser,
  fetchAllRoles,
  createRole
} from '../../components/services/users';
import { transformApiData } from '../../components/admin/usermanagement/utils';
import CreateUserModal from '../../components/admin/usermanagement/CreateUserModal';
import CreateRoleModal from '../../components/admin/usermanagement/CreateRoleModal';
import RoleAssignmentModal from '../../components/admin/usermanagement/RoleAssignmentModal';
import StatusChangeModal from '../../components/admin/usermanagement/StatusChangeModal';
import logger from '../../utils/logger';
import { UserDetailModal } from './usersTab/UserDetailModal';
import { UsersTableSection } from './usersTab/UsersTableSection';
import {
  USERS_TAB_NEW_USER_INITIAL,
  USERS_TAB_NEW_ROLE_INITIAL,
  USERS_TAB_ROLE_ASSIGNMENT_INITIAL,
} from './usersTab/usersTabInitialState';

const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetailLoading, setUserDetailLoading] = useState(false);
  const [userDetailError, setUserDetailError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [roles, setRoles] = useState([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRoleCreateModalOpen, setIsRoleCreateModalOpen] = useState(false);
  const [isRoleAssignmentModalOpen, setIsRoleAssignmentModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newUser, setNewUser] = useState(USERS_TAB_NEW_USER_INITIAL);
  const [newRole, setNewRole] = useState(USERS_TAB_NEW_ROLE_INITIAL);
  const [roleAssignment, setRoleAssignment] = useState(USERS_TAB_ROLE_ASSIGNMENT_INITIAL);
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [modalSuccessMessage, setModalSuccessMessage] = useState('');

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

  const fetchRoles = async () => {
    try {
      const response = await fetchAllRoles();
      if (response && response.body && response.body.data) {
        setRoles(response.body.data);
      }
    } catch (err) {
      logger.error('Error fetching roles:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [searchTerm, statusFilter, typeFilter, currentPage]);

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    return users.filter(user =>
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.roleName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(filteredUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const closeUserDetailModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setUserDetailError(null);
  };

  const handleViewDetails = async (userId) => {
    setIsModalOpen(true);
    setSelectedUser(null);
    setUserDetailError(null);
    setUserDetailLoading(true);
    try {
      const response = await getUserById(userId);
      const payload = response?.body?.data;
      if (payload) {
        setSelectedUser(transformApiData([payload])[0]);
      } else {
        const msg =
          response?.headers?.customerMessage || response?.headers?.responseMessage || 'User not found';
        setUserDetailError(msg);
      }
    } catch (err) {
      logger.error('Error fetching user details:', err);
      const api = err.response?.data;
      setUserDetailError(
        api?.headers?.customerMessage || api?.body?.message || err.message || 'Failed to load user details'
      );
    } finally {
      setUserDetailLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    logger.debug('handleToggleStatus called with userId:', userId);
    try {
      const user = users.find(u => u.id === userId);
      logger.debug('Found user:', user);
      setSelectedUser(user);
      setIsStatusModalOpen(true);
      setModalSuccessMessage('');
      setError('');
    } catch (err) {
      logger.error('Error preparing status change:', err);
      setError('Failed to prepare status change. Please try again.');
    }
  };

  const handleRoleAssignment = async (userId) => {
    logger.debug('handleRoleAssignment called with userId:', userId);
    try {
      const user = users.find(u => u.id === userId);
      logger.debug('Found user for role assignment:', user);
      setSelectedUser(user);
      setRoleAssignment({
        userId: userId,
        roleId: ''
      });
      setIsRoleAssignmentModalOpen(true);
      setModalSuccessMessage('');
      setFormErrors({});
    } catch (err) {
      logger.error('Error preparing role assignment:', err);
      setError('Failed to prepare role assignment. Please try again.');
    }
  };

  const confirmStatusChange = async () => {
    try {
      setLoading(true);
      setModalSuccessMessage('');
      setError('');

      let response;
      if (selectedUser?.enabled) {
        response = await disableUser(selectedUser.id);
      } else {
        response = await enableUser(selectedUser.id);
      }

      if (response?.headers?.responseCode === 200) {
        setModalSuccessMessage(response.headers.customerMessage || 'User status updated successfully');

        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === selectedUser.id
              ? { ...user, enabled: !user.enabled }
              : user
          )
        );

        setTimeout(() => {
          setIsStatusModalOpen(false);
          setSelectedUser(null);
        }, 1500);
      } else {
        setError(response?.headers?.customerMessage || 'Failed to update user status');
      }
    } catch (err) {
      logger.error('Error updating user status:', err);
      setError('Failed to update user status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const confirmRoleAssignment = async () => {
    try {
      if (!roleAssignment.userId || !roleAssignment.roleId) {
        setFormErrors({ roleId: 'Please select a role' });
        return;
      }

      setLoading(true);
      setModalSuccessMessage('');
      setError('');

      const response = await assignRoleToUser(roleAssignment.userId, roleAssignment.roleId);

      if (response?.headers?.responseCode === 200) {
        setModalSuccessMessage(response.headers.customerMessage || 'Role assigned successfully');

        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === roleAssignment.userId
              ? { ...user, roleId: parseInt(roleAssignment.roleId, 10) }
              : user
          )
        );

        setTimeout(() => {
          setIsRoleAssignmentModalOpen(false);
          setRoleAssignment({ ...USERS_TAB_ROLE_ASSIGNMENT_INITIAL });
          setSelectedUser(null);
        }, 1500);
      } else {
        setError(response?.headers?.customerMessage || 'Failed to assign role');
      }
    } catch (err) {
      logger.error('Error assigning role:', err);
      setError('Failed to assign role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCreateUser = async () => {
    try {
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
        roleId: parseInt(newUser.roleId, 10)
      });

      if (response && response.success) {
        setModalSuccessMessage('User has been successfully created');
        setTimeout(() => {
          setIsCreateModalOpen(false);
          setSuccessMessage('User created successfully');
          setNewUser({ ...USERS_TAB_NEW_USER_INITIAL });
          setFormErrors({});
          fetchUsers();
          setModalSuccessMessage('');
        }, 1500);
      }
    } catch (err) {
      logger.error('Error creating user:', err);
      setError('Failed to create user. Please try again.');
    }
  };

  const handleCreateRole = async () => {
    try {
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
          setNewRole({ ...USERS_TAB_NEW_ROLE_INITIAL });
          setFormErrors({});
          fetchRoles();
          setModalSuccessMessage('');
        }, 1500);
      }
    } catch (err) {
      logger.error('Error creating role:', err);
      setError('Failed to create role. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center text-red-500">
        Error loading users: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsRoleCreateModalOpen(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            ADD ROLE
          </button>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            CREATE NEW
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-green-100 text-green-700 rounded-lg border border-green-200">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            {successMessage}
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
          <div className="flex items-center">
            <XCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        </div>
      )}

      {successMessage && (
        <div className="hidden">
          {setTimeout(() => setSuccessMessage(''), 5000)}
        </div>
      )}

      {error && (
        <div className="hidden">
          {setTimeout(() => setError(''), 5000)}
        </div>
      )}

      <UsersTableSection
        filteredUsers={filteredUsers}
        selectedUsers={selectedUsers}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        typeFilter={typeFilter}
        onSearchChange={handleSearch}
        onStatusFilterChange={(e) => {
          setStatusFilter(e.target.value);
          setCurrentPage(1);
        }}
        onTypeFilterChange={(e) => {
          setTypeFilter(e.target.value);
          setCurrentPage(1);
        }}
        onSelectAll={handleSelectAll}
        onSelectUser={handleSelectUser}
        onViewDetails={handleViewDetails}
        onRoleAssignment={handleRoleAssignment}
        onToggleStatus={handleToggleStatus}
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        usersPerPage={usersPerPage}
        onPageChange={handlePageChange}
      />

      {isModalOpen && (
        <UserDetailModal
          open={isModalOpen}
          selectedUser={selectedUser}
          loading={userDetailLoading}
          error={userDetailError}
          onClose={closeUserDetailModal}
          onRoleAssignment={handleRoleAssignment}
          onToggleStatus={handleToggleStatus}
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

      {isRoleAssignmentModalOpen && selectedUser && (
        <RoleAssignmentModal
          selectedUser={selectedUser}
          roleAssignment={roleAssignment}
          setRoleAssignment={setRoleAssignment}
          formErrors={formErrors}
          modalSuccessMessage={modalSuccessMessage}
          setIsRoleAssignmentModalOpen={setIsRoleAssignmentModalOpen}
          handleRoleAssignment={confirmRoleAssignment}
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
    </div>
  );
};

export default UsersTab;

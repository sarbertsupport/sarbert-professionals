export const transformApiData = (apiUsers) => {
    return apiUsers.map((user) => ({
      id: user.userId,
      username: user.username,
      email: user.email,
      type:
        user.roleName === 'ROLE_TUTOR'
          ? 'Professional'
          : user.roleName === 'ROLE_ADMIN'
            ? 'Admin'
            : 'Student',
      status: user.activeStatus ? 'active' : 'inactive',
      currentStep: user.currentStep,
      loginAttempts: user.loginAttempts ?? user.login_attempts,
      locked: user.locked,
      roleName: user.roleName,
      activeStatus: user.activeStatus,
      lastLoginAt: user.lastLoginAttempt ?? user.last_login_attempt,
      createdAt: user.createdAt ?? user.created_at,
      joined: new Date(
        user.tokenExpiration ? user.tokenExpiration[0] : Date.now()
      )
        .toISOString()
        .split('T')[0],
    }));
  };
  
  export const getTypeColor = (type) => {
    return type === 'Professional' 
      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  };
  
  export const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };
  
  export const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
export const formatUserDate = (val) => {
  if (val == null || val === '') return 'N/A';
  if (Array.isArray(val) && val.length >= 3) {
    const [y, M, d] = val;
    return new Date(y, M - 1, d).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
  const d = typeof val === 'string' || typeof val === 'number' ? new Date(val) : null;
  if (d && !Number.isNaN(d.getTime())) {
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
  return 'N/A';
};

export const formatUserDateTime = (val) => {
  if (val == null || val === '') return 'N/A';
  if (Array.isArray(val) && val.length >= 3) {
    const [y, M, d, h = 0, m = 0] = val;
    return new Date(y, M - 1, d, h, m).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  const d = typeof val === 'string' || typeof val === 'number' ? new Date(val) : null;
  if (d && !Number.isNaN(d.getTime())) {
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  return 'N/A';
};

export const getUserTypeColor = (type) => {
  return type === 'Professional'
    ? 'bg-purple-100 text-purple-800'
    : 'bg-blue-100 text-blue-800';
};

export const getUserStatusColor = (status) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'inactive': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const USER_STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' }
];

export const USER_TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'Student', label: 'Clients' },
  { value: 'Professional', label: 'Professionals' }
];

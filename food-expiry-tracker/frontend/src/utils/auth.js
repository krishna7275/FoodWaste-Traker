// Authentication utility functions

export const setAuthData = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const getAuthData = () => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  return { token, user };
};

export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

export const getUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Format date helpers
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const getDaysUntilExpiry = (expiryDate) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const getStatusColor = (status) => {
  const colors = {
    fresh: 'text-success-600 bg-success-50',
    expiring_soon: 'text-warning-600 bg-warning-50',
    expired: 'text-danger-600 bg-danger-50',
    consumed: 'text-neutral-600 bg-neutral-100',
  };
  return colors[status] || colors.fresh;
};

export const getStatusLabel = (status) => {
  const labels = {
    fresh: 'Fresh',
    expiring_soon: 'Expiring Soon',
    expired: 'Expired',
    consumed: 'Consumed',
  };
  return labels[status] || status;
};

// Format currency to Indian Rupee
export const formatCurrency = (amount) => {
  const value = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
};
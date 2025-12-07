import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Items API
export const itemsAPI = {
  create: (data) => api.post('/items', data),
  getAll: (params) => api.get('/items', { params }),
  getExpiring: (days = 7) => api.get('/items/expiring', { params: { days } }),
  getStats: () => api.get('/items/stats'),
  getById: (id) => api.get(`/items/${id}`),
  update: (id, data) => api.put(`/items/${id}`, data),
  consume: (id) => api.patch(`/items/${id}/consume`),
  delete: (id) => api.delete(`/items/${id}`),
};

// Barcode API
export const barcodeAPI = {
  lookup: (code) => api.get(`/barcode/${code}`),
};

// OCR API
export const ocrAPI = {
  parse: (ocrText) => api.post('/ocr/parse', { ocrText }),
};

// Recipes API
export const recipesAPI = {
  // TEMP: Use test endpoint (no auth required) for debugging
  generate: (ingredients) => api.post('/recipes/test', { ingredients }),
};

// Analytics API
export const analyticsAPI = {
  getOverview: () => api.get('/analytics/overview'),
  getInsights: () => api.get('/analytics/insights'),
};

// Achievements API
export const achievementsAPI = {
  getAll: () => api.get('/achievements'),
  check: () => api.post('/achievements/check'),
  getStats: () => api.get('/achievements/stats'),
};

// Notifications API
export const notificationsAPI = {
  getPreferences: () => api.get('/notifications/preferences'),
  updatePreferences: (data) => api.put('/notifications/preferences', data),
  testEmail: () => api.post('/notifications/test/email'),
  testWhatsApp: () => api.post('/notifications/test/whatsapp'),
};

// Leaderboard API
export const leaderboardAPI = {
  getLeaderboard: (type = 'points', limit = 50) => api.get('/leaderboard', { params: { type, limit } }),
  getCommunityStats: () => api.get('/leaderboard/community-stats'),
  getUserRank: () => api.get('/leaderboard/user-rank'),
};

// Challenges API
export const challengesAPI = {
  getAll: () => api.get('/challenges'),
  getActive: () => api.get('/challenges/active'),
};

// Meal Planning API
export const mealPlanningAPI = {
  suggest: (days = 7) => api.post(`/meal-planning/suggest?days=${days}`),
};

export default api;
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
  generate: (ingredients) => api.post('/recipes', { ingredients }),
};

export default api;
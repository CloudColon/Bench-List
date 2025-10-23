import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/api/auth/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Authentication APIs
export const authAPI = {
  register: (data) => api.post('/api/auth/register/', data),
  login: (data) => api.post('/api/auth/login/', data),
  refreshToken: (refreshToken) => api.post('/api/auth/token/refresh/', { refresh: refreshToken }),
  getCurrentUser: () => api.get('/api/auth/users/me/'),
  changePassword: (data) => api.post('/api/auth/users/change_password/', data),
};

// Company APIs
export const companyAPI = {
  getAll: (params) => api.get('/api/companies/', { params }),
  getById: (id) => api.get(`/api/companies/${id}/`),
  create: (data) => api.post('/api/companies/', data),
  update: (id, data) => api.put(`/api/companies/${id}/`, data),
  partialUpdate: (id, data) => api.patch(`/api/companies/${id}/`, data),
  delete: (id) => api.delete(`/api/companies/${id}/`),
};

// Employee APIs
export const employeeAPI = {
  getAll: (params) => api.get('/api/employees/', { params }),
  getById: (id) => api.get(`/api/employees/${id}/`),
  getAvailable: () => api.get('/api/employees/available/'),
  create: (data) => api.post('/api/employees/', data),
  update: (id, data) => api.put(`/api/employees/${id}/`, data),
  partialUpdate: (id, data) => api.patch(`/api/employees/${id}/`, data),
  delete: (id) => api.delete(`/api/employees/${id}/`),
  uploadResume: (id, file) => {
    const formData = new FormData();
    formData.append('resume', file);
    return api.patch(`/api/employees/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Bench Request APIs
export const requestAPI = {
  getAll: (params) => api.get('/api/requests/', { params }),
  getById: (id) => api.get(`/api/requests/${id}/`),
  getPending: () => api.get('/api/requests/pending/'),
  create: (data) => api.post('/api/requests/', data),
  respond: (id, data) => api.post(`/api/requests/${id}/respond/`, data),
  delete: (id) => api.delete(`/api/requests/${id}/`),
};

// Helper functions
export const setAuthTokens = (access, refresh) => {
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
};

export const clearAuthTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

export const getAccessToken = () => {
  return localStorage.getItem('access_token');
};

export const getRefreshToken = () => {
  return localStorage.getItem('refresh_token');
};

export default api;

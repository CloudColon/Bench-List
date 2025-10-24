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
  registerCompanyUser: (data) => api.post('/api/auth/register/company-user/', data),
  registerAdmin: (data) => api.post('/api/auth/register/admin/', data),
  login: (data) => api.post('/api/auth/login/', data),
  refreshToken: (refreshToken) => api.post('/api/auth/token/refresh/', { refresh: refreshToken }),
  getCurrentUser: () => api.get('/api/auth/users/me/'),
  changePassword: (data) => api.post('/api/auth/users/change_password/', data),
};

// Admin Request APIs
export const adminRequestAPI = {
  getAll: (params) => api.get('/api/auth/admin-requests/', { params }),
  getById: (id) => api.get(`/api/auth/admin-requests/${id}/`),
  getPending: () => api.get('/api/auth/admin-requests/pending/'),
  respond: (id, data) => api.post(`/api/auth/admin-requests/${id}/respond/`, data),
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

// Resource Listing APIs
export const resourceListingAPI = {
  getAll: (params) => api.get('/api/resource-listings/', { params }),
  getById: (id) => api.get(`/api/resource-listings/${id}/`),
  getMyListings: () => api.get('/api/resource-listings/my_listings/'),
  create: (data) => api.post('/api/resource-listings/', data),
  update: (id, data) => api.put(`/api/resource-listings/${id}/`, data),
  partialUpdate: (id, data) => api.patch(`/api/resource-listings/${id}/`, data),
  updateStatus: (id, status) => api.patch(`/api/resource-listings/${id}/update_status/`, { status }),
  delete: (id) => api.delete(`/api/resource-listings/${id}/`),
};

// Resource Request APIs
export const resourceRequestAPI = {
  getAll: (params) => api.get('/api/resource-requests/', { params }),
  getById: (id) => api.get(`/api/resource-requests/${id}/`),
  getPending: () => api.get('/api/resource-requests/pending/'),
  getSent: () => api.get('/api/resource-requests/sent/'),
  getReceived: () => api.get('/api/resource-requests/received/'),
  create: (data) => api.post('/api/resource-requests/', data),
  respond: (id, data) => api.post(`/api/resource-requests/${id}/respond/`, data),
  delete: (id) => api.delete(`/api/resource-requests/${id}/`),
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

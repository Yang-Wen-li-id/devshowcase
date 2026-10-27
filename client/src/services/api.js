import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token if present in localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('devshowcase_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch unauthorized errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        localStorage.removeItem('devshowcase_token');
        localStorage.removeItem('devshowcase_user');
      }
    }
    return Promise.reject(error);
  }
);

// Project API Endpoints
export const projectsAPI = {
  getAll: (params = {}) => apiClient.get('/projects', { params }),
  getBySlug: (slug) => apiClient.get(`/projects/${slug}`),
  create: (projectData) => apiClient.post('/projects', projectData),
  update: (id, projectData) => apiClient.put(`/projects/${id}`, projectData),
  delete: (id) => apiClient.delete(`/projects/${id}`),
  getTags: () => apiClient.get('/projects/tags'),
};

// Auth API Endpoints
export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  getMe: () => apiClient.get('/auth/me'),
  logout: () => apiClient.post('/auth/logout'),
};

// Analytics & Telemetry API Endpoints
export const analyticsAPI = {
  getOverview: () => apiClient.get('/analytics/overview'),
  getTrend: (days = 14) => apiClient.get('/analytics/trend', { params: { days } }),
  getLogs: (params = {}) => apiClient.get('/analytics/logs', { params }),
};

// Health Check API
export const healthAPI = {
  check: () => apiClient.get('/health'),
};

export default apiClient;

// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// ---------------------------------------------------------------------
// Axios instance – all calls go through this
// ---------------------------------------------------------------------
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---------------------------------------------------------------------
// Add JWT token to every request
// ---------------------------------------------------------------------
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------------------------------------------------------------
// Global error handling – auto-logout on 401
// ---------------------------------------------------------------------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// ---------------------------------------------------------------------
// Auth API
// ---------------------------------------------------------------------
export const authAPI = {
  login: (empNumber, password) =>
    api.post('/auth/signin', { empNumber, password }),

  register: (userData) =>
    api.post('/auth/signup', userData),
};

// ---------------------------------------------------------------------
// User API (admin)
// ---------------------------------------------------------------------
export const userAPI = {
  getAllUsers: () => api.get('/admin/users'),
  createUser: (userData) => api.post('/admin/users', userData),
  updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
};

// ---------------------------------------------------------------------
// Machine API
// ---------------------------------------------------------------------
export const machineAPI = {
  getAll: () => api.get('/admin/machines'),
  getAllMachines: () => api.get('/technician/machines'),
  getMachinesByType: (type) => api.get(`/technician/machines/type/${type}`),
  getMachinesByLocation: (location) =>
    api.get(`/technician/machines/location/${location}`),

  create: (machineData) => api.post('/admin/machines', machineData),
  update: (id, machineData) => api.put(`/admin/machines/${id}`, machineData),
  delete: (id) => api.delete(`/admin/machines/${id}`),
};

// ---------------------------------------------------------------------
// Checklist API
// ---------------------------------------------------------------------
export const checklistAPI = {
  // Technician side
  create: (checklistData) => api.post('/technician/checklist', checklistData),
  submitChecklist: (checklistData) =>
    api.post('/technician/checklist', checklistData),

  getMyChecklists: () => api.get('/technician/checklist'),

  // Engineer side – fetch all / filtered
  getAll: () => api.get('/engineer/checklist'),
  getAllChecklists: () => api.get('/engineer/checklist'),

  getByType: (type) => api.get(`/engineer/checklist/type/${type}`),
  getByLocationAndSubsection: (locationType, locationId, subsection) =>
    api.get(
      `/technician/checklist/location/${locationType}/${locationId}/${subsection}`
    ),
  getByStatus: (status) => api.get(`/engineer/checklist/status/${status}`),
  getByDateRange: (startDate, endDate) =>
    api.get(
      `/engineer/checklist/date-range?startDate=${startDate}&endDate=${endDate}`
    ),

  // Update a checklist (technician edit)
  update: (id, checklistData) =>
    api.put(`/technician/checklist/${id}`, checklistData),

  // -----------------------------------------------------------------
  // Unified review endpoint – used for Approve, Reject, Re-Approve, Re-Reject
  // Payload shape:
  //   { action: "APPROVE" | "REJECT", remarks?: string, formData?: object }
  // -----------------------------------------------------------------
  reviewEntry: (id, payload) =>
    api.put(`/engineer/checklist/${id}/review`, payload),

  // -----------------------------------------------------------------
  // Helper for multipart uploads (photos, docs, etc.) – optional
  // -----------------------------------------------------------------
  uploadFile: (id, file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/engineer/checklist/${id}/upload`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default api;
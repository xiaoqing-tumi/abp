import axios from 'axios';

const API_BASE_URL = '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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

export const authAPI = {
  login: (personCode) => api.post('/auth/login', { personCode }),
  getUsers: () => api.get('/auth/users'),
};

export const workHourAPI = {
  getWorkHours: (params) => api.get('/work-hours', { params }),
  getWorkHour: (id) => api.get(`/work-hours/${id}`),
  createWorkHour: (data) => api.post('/work-hours', data),
  updateWorkHour: (id, data) => api.put(`/work-hours/${id}`, data),
  deleteWorkHour: (id) => api.delete(`/work-hours/${id}`),
  submitWorkHour: (id) => api.post(`/work-hours/${id}/submit`),
  getPendingApprovals: () => api.get('/work-hours/pending-approvals'),
  approveWorkHour: (id) => api.post(`/work-hours/${id}/approve`),
  rejectWorkHour: (id) => api.post(`/work-hours/${id}/reject`),
};

export const basicDataAPI = {
  getCurrentUser: () => api.get('/persons/mine'),
  getPersons: () => api.get('/persons'),
  getMyProjects: () => api.get('/projects/my'),
  getAllProjects: () => api.get('/projects/all'),
  getMyAttendance: (params) => api.get('/attendance/my', { params }),
  getDeptAttendance: (params) => api.get('/attendance/dept', { params }),
  getPendingOaProcesses: () => api.get('/oa-processes/pending'),
  simulateOaProcess: (data) => api.post('/oa-processes/simulate', data),
};

export const statisticsAPI = {
  getPersonalStatistics: (params) => api.get('/statistics/personal', { params }),
  getDepartmentStatistics: (params) => api.get('/statistics/department', { params }),
  getProjectStatistics: (code, params) => api.get(`/statistics/project/${code}`, { params }),
};

export default api;
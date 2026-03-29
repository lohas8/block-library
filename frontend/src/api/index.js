import axios from 'axios';
import { store } from '../store';
import { setUser } from '../store';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:7001',
});

// 请求拦截器
api.interceptors.request.use(
  config => {
    const token = store.getState().user.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// 响应拦截器
api.interceptors.response.use(
  response => {
    if (response.data.code === 401) {
      store.dispatch(setUser({ token: null, user: null }));
      window.location.href = '/login';
    }
    return response.data;
  },
  error => Promise.reject(error)
);

// 图书 API
export const bookApi = {
  list: (params) => api.get('/api/books', { params }),
  detail: (id) => api.get(`/api/books/${id}`),
  create: (data) => api.post('/api/books', data),
  update: (id, data) => api.put(`/api/books/${id}`, data),
  delete: (id) => api.delete(`/api/books/${id}`),
  categories: () => api.get('/api/books/categories'),
  import: (books) => api.post('/api/books/import', { books }),
  export: () => api.get('/api/books/export'),
};

// 用户 API
export const userApi = {
  register: (data) => api.post('/api/users/register', data),
  login: (data) => api.post('/api/users/login', data),
  detail: (id) => api.get(`/api/users/${id}`),
  update: (id, data) => api.put(`/api/users/${id}`, data),
  list: (params) => api.get('/api/users', { params }),
  updatePoints: (id, data) => api.post(`/api/users/${id}/points`, data),
  borrowHistory: (id, params) => api.get(`/api/users/${id}/borrow-history`, { params }),
};

// 借阅 API
export const borrowApi = {
  borrow: (data) => api.post('/api/borrow', data),
  return: (id) => api.post(`/api/borrow/return/${id}`),
  list: (params) => api.get('/api/borrow', { params }),
  reserve: (data) => api.post('/api/reserve', data),
  cancelReserve: (id) => api.post(`/api/reserve/cancel/${id}`),
  reservationList: (params) => api.get('/api/reserve', { params }),
  statistics: () => api.get('/api/statistics'),
};

// 积分 API
export const pointsApi = {
  itemList: (params) => api.get('/api/points/items', { params }),
  createItem: (data) => api.post('/api/points/items', data),
  updateItem: (id, data) => api.put(`/api/points/items/${id}`, data),
  deleteItem: (id) => api.delete(`/api/points/items/${id}`),
  exchange: (data) => api.post('/api/points/exchange', data),
};

// 通知 API
export const notificationApi = {
  list: (params) => api.get('/api/notifications', { params }),
  markRead: (id) => api.post(`/api/notifications/${id}/read`),
  markAllRead: (userId) => api.post('/api/notifications/read-all', { userId }),
  delete: (id) => api.delete(`/api/notifications/${id}`),
};

export default api;

import axios from 'axios';
import { store } from '../store';
import { setUser } from '../store';

const apiInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:7001',
});

// 请求拦截器
apiInstance.interceptors.request.use(
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
apiInstance.interceptors.response.use(
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
  list: (params) => apiInstance.get('/api/books', { params }),
  detail: (id) => apiInstance.get(`/api/books/${id}`),
  create: (data) => apiInstance.post('/api/books', data),
  update: (id, data) => apiInstance.put(`/api/books/${id}`, data),
  delete: (id) => apiInstance.delete(`/api/books/${id}`),
  categories: () => apiInstance.get('/api/books/categories'),
  import: (books) => apiInstance.post('/api/books/import', { books }),
  export: () => apiInstance.get('/api/books/export'),
};

// 用户 API
export const userApi = {
  register: (data) => apiInstance.post('/api/users/register', data),
  login: (data) => apiInstance.post('/api/users/login', data),
  detail: (id) => apiInstance.get(`/api/users/${id}`),
  update: (id, data) => apiInstance.put(`/api/users/${id}`, data),
  list: (params) => apiInstance.get('/api/users', { params }),
  updatePoints: (id, data) => apiInstance.post(`/api/users/${id}/points`, data),
  borrowHistory: (id, params) => apiInstance.get(`/api/users/${id}/borrow-history`, { params }),
  getInvites: (userId) => apiInstance.get(`/api/users/${userId}/invites`),
  getInvitedBy: (userId) => apiInstance.get(`/api/users/${userId}/invited-by`),
  getAppliedRules: (userId) => apiInstance.get(`/api/users/${userId}/applied-rules`),
};

// 借阅 API
export const borrowApi = {
  borrow: (data) => apiInstance.post('/api/borrow', data),
  return: (id) => apiInstance.post(`/api/borrow/return/${id}`),
  list: (params) => apiInstance.get('/api/borrow', { params }),
  reserve: (data) => apiInstance.post('/api/reserve', data),
  cancelReserve: (id) => apiInstance.post(`/api/reserve/cancel/${id}`),
  reservationList: (params) => apiInstance.get('/api/reserve', { params }),
  statistics: () => apiInstance.get('/api/statistics'),
};

// 积分 API
export const pointsApi = {
  itemList: (params) => apiInstance.get('/api/points/items', { params }),
  createItem: (data) => apiInstance.post('/api/points/items', data),
  updateItem: (id, data) => apiInstance.put(`/api/points/items/${id}`, data),
  deleteItem: (id) => apiInstance.delete(`/api/points/items/${id}`),
  exchange: (data) => apiInstance.post('/api/points/exchange', data),
};

// 通知 API
export const notificationApi = {
  list: (params) => apiInstance.get('/api/notifications', { params }),
  markRead: (id) => apiInstance.post(`/api/notifications/${id}/read`),
  markAllRead: (userId) => apiInstance.post('/api/notifications/read-all', { userId }),
  delete: (id) => apiInstance.delete(`/api/notifications/${id}`),
};

// 工具共享 API
export const toolApi = {
  list: (params) => apiInstance.get('/api/tools', { params }),
  detail: (id) => apiInstance.get(`/api/tools/${id}`),
  create: (data) => apiInstance.post('/api/tools', data),
  update: (id, data) => apiInstance.put(`/api/tools/${id}`, data),
  delete: (id) => apiInstance.delete(`/api/tools/${id}`),
  categories: () => apiInstance.get('/api/tools/categories'),
  rent: (data) => apiInstance.post('/api/tools/rent', data),
  return: (id) => apiInstance.post(`/api/tools/return/${id}`),
  statistics: () => apiInstance.get('/api/tools/statistics'),
};

// 小区管理 API
export const communityApi = {
  list: (params) => apiInstance.get('/api/communities', { params }),
  detail: (id) => apiInstance.get(`/api/communities/${id}`),
  create: (data) => apiInstance.post('/api/communities', data),
  update: (id, data) => apiInstance.put(`/api/communities/${id}`, data),
  delete: (id) => apiInstance.delete(`/api/communities/${id}`),
};

// 规则管理 API
export const ruleApi = {
  list: (params) => apiInstance.get('/api/rules', { params }),
  detail: (id) => apiInstance.get(`/api/rules/${id}`),
  create: (data) => apiInstance.post('/api/rules', data),
  update: (id, data) => apiInstance.put(`/api/rules/${id}`, data),
  delete: (id) => apiInstance.delete(`/api/rules/${id}`),
  apply: (ruleId, data) => apiInstance.post(`/api/rules/${ruleId}/apply`, data),
  approve: (id) => apiInstance.post(`/api/rules/approvals/${id}/approve`),
  reject: (id) => apiInstance.post(`/api/rules/approvals/${id}/reject`),
  listApprovals: (params) => apiInstance.get('/api/rules/approvals', { params }),
};

// 议事模块 API
export const topicApi = {
  list: (params) => apiInstance.get('/api/topics', { params }),
  detail: (id) => apiInstance.get(`/api/topics/${id}`),
  create: (data) => apiInstance.post('/api/topics', data),
  updateStatus: (id, data) => apiInstance.put(`/api/topics/${id}/status`, data),
  setFocus: (id, data) => apiInstance.put(`/api/topics/${id}/focus`, data),
  follow: (id, data) => apiInstance.post(`/api/topics/${id}/follow`, data),
};

export const commentApi = {
  list: (params) => apiInstance.get('/api/comments', { params }),
  create: (topicId, data) => apiInstance.post(`/api/topics/${topicId}/comments`, data),
  delete: (topicId, commentId) => apiInstance.delete(`/api/topics/${topicId}/comments/${commentId}`),
};

export default apiInstance;
export const api = apiInstance;

import { configureStore, createSlice } from '@reduxjs/toolkit';

// 用户 slice
const userSlice = createSlice({
  name: 'user',
  initialState: {
    token: localStorage.getItem('token') || null,
    info: JSON.parse(localStorage.getItem('userInfo') || 'null'),
  },
  reducers: {
    setUser: (state, action) => {
      // Support both { token, user } and flat API response { token, _id, username, ... }
      const payload = action.payload;
      if (payload.user !== undefined) {
        state.token = payload.token;
        state.info = payload.user;
      } else {
        // Flat format: extract token and user data from same object
        state.token = payload.token;
        const { token: _t, ...userData } = payload;
        state.info = userData;
      }
      if (state.token) {
        localStorage.setItem('token', state.token);
        localStorage.setItem('userInfo', JSON.stringify(state.info));
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
      }
    },
    updatePoints: (state, action) => {
      if (state.info) {
        state.info.points = action.payload;
      }
    },
    logout: (state) => {
      state.token = null;
      state.info = null;
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
    },
  },
});

// 图书 slice
const bookSlice = createSlice({
  name: 'books',
  initialState: {
    list: [],
    total: 0,
    currentBook: null,
    categories: [],
  },
  reducers: {
    setBooks: (state, action) => {
      state.list = action.payload.list;
      state.total = action.payload.total;
    },
    setCurrentBook: (state, action) => {
      state.currentBook = action.payload;
    },
    setCategories: (state, action) => {
      state.categories = action.payload;
    },
    addBook: (state, action) => {
      state.list.unshift(action.payload);
      state.total += 1;
    },
    updateBook: (state, action) => {
      const index = state.list.findIndex(b => b._id === action.payload._id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
    },
    deleteBook: (state, action) => {
      state.list = state.list.filter(b => b._id !== action.payload);
      state.total -= 1;
    },
  },
});

// 借阅记录 slice
const borrowSlice = createSlice({
  name: 'borrow',
  initialState: {
    list: [],
    total: 0,
    reservations: [],
    statistics: null,
  },
  reducers: {
    setBorrowList: (state, action) => {
      state.list = action.payload.list;
      state.total = action.payload.total;
    },
    setReservations: (state, action) => {
      state.reservations = action.payload;
    },
    setStatistics: (state, action) => {
      state.statistics = action.payload;
    },
  },
});

// 通知 slice
const notificationSlice = createSlice({
  name: 'notification',
  initialState: {
    list: [],
    unreadCount: 0,
  },
  reducers: {
    setNotifications: (state, action) => {
      state.list = action.payload.list;
      state.unreadCount = action.payload.unreadCount;
    },
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
  },
});

// 工具共享 slice
const toolSlice = createSlice({
  name: 'tools',
  initialState: {
    list: [],
    total: 0,
    currentTool: null,
    categories: [],
    statistics: null,
  },
  reducers: {
    setTools: (state, action) => {
      state.list = action.payload.list;
      state.total = action.payload.total;
    },
    setCurrentTool: (state, action) => {
      state.currentTool = action.payload;
    },
    setToolCategories: (state, action) => {
      state.categories = action.payload;
    },
    setToolStatistics: (state, action) => {
      state.statistics = action.payload;
    },
    addTool: (state, action) => {
      state.list.unshift(action.payload);
      state.total += 1;
    },
    updateTool: (state, action) => {
      const idx = state.list.findIndex(t => t._id === action.payload._id);
      if (idx !== -1) state.list[idx] = action.payload;
    },
    deleteTool: (state, action) => {
      state.list = state.list.filter(t => t._id !== action.payload);
      state.total -= 1;
    },
  },
});

// 配置 slice
const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    theme: localStorage.getItem('theme') || 'light',
    features: JSON.parse(localStorage.getItem('features') || '{"borrow":true,"bookManage":true,"userManage":true,"pointsMall":true,"toolShare":true}'),
    permissions: JSON.parse(localStorage.getItem('permissions') || '{"adminRoles":["super_admin","admin"],"managerRoles":["admin","owner","property"],"userRoles":["owner","property","user"]}'),
  },
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
      document.documentElement.setAttribute('data-theme', action.payload);
    },
    toggleFeature: (state, action) => {
      const { key, value } = action.payload;
      state.features[key] = value;
      localStorage.setItem('features', JSON.stringify(state.features));
    },
    setPermissions: (state, action) => {
      state.permissions = action.payload;
      localStorage.setItem('permissions', JSON.stringify(state.permissions));
    },
  },
});

export const { setUser, updatePoints, logout } = userSlice.actions;
export const { setBooks, setCurrentBook, setCategories, addBook, updateBook, deleteBook } = bookSlice.actions;
export const { setBorrowList, setReservations, setStatistics } = borrowSlice.actions;
export const { setNotifications, setUnreadCount } = notificationSlice.actions;
export const { setTools, setCurrentTool, setToolCategories, setToolStatistics, addTool, updateTool, deleteTool } = toolSlice.actions;
export const { setTheme, toggleFeature, setPermissions } = settingsSlice.actions;

// 重新导出配置
export { ROLE_CONFIG, FEATURE_CONFIG, checkPermission, applyTheme } from './settings';

export const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    books: bookSlice.reducer,
    borrow: borrowSlice.reducer,
    notification: notificationSlice.reducer,
    tools: toolSlice.reducer,
    settings: settingsSlice.reducer,
  },
});
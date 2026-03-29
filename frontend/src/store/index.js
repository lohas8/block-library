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
      state.token = action.payload.token;
      state.info = action.payload.user;
      if (action.payload.token) {
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('userInfo', JSON.stringify(action.payload.user));
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

export const { setUser, updatePoints } = userSlice.actions;
export const { setBooks, setCurrentBook, setCategories, addBook, updateBook, deleteBook } = bookSlice.actions;
export const { setBorrowList, setReservations, setStatistics } = borrowSlice.actions;
export const { setNotifications, setUnreadCount } = notificationSlice.actions;

export const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    books: bookSlice.reducer,
    borrow: borrowSlice.reducer,
    notification: notificationSlice.reducer,
  },
});

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { store } from './store';
import AppLayout from './components/AppLayout';
import Dashboard from './pages/Dashboard';
import BookList from './pages/BookList';
import BorrowManage from './pages/BorrowManage';
import UserManage from './pages/UserManage';
import PointsMall from './pages/PointsMall';
import Notifications from './pages/Notifications';
import Login from './pages/Login';

// 路由守卫
const PrivateRoute = ({ children }) => {
  const { token } = useSelector(state => state.user);
  return token ? children : <Navigate to="/login" />;
};

// 管理权限
const AdminRoute = ({ children }) => {
  const { info } = useSelector(state => state.user);
  if (!info || info.role !== 'admin') {
    return <Navigate to="/" />;
  }
  return children;
};

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <PrivateRoute>
              <AppLayout>
                <Routes>
                  <Route index element={<Dashboard />} />
                  <Route path="books" element={<BookList />} />
                  <Route path="borrow" element={<BorrowManage />} />
                  <Route path="users" element={
                    <AdminRoute>
                      <UserManage />
                    </AdminRoute>
                  } />
                  <Route path="points" element={<PointsMall />} />
                  <Route path="notifications" element={<Notifications />} />
                </Routes>
              </AppLayout>
            </PrivateRoute>
          } />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;

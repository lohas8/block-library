import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { store } from './store';
import AppLayout from './components/AppLayout';
import AppLayoutMobile from './common/components/AppLayoutMobile';
import AppLayoutMobileYishi from './common/components/AppLayoutMobileYishi';
import Dashboard from './pages/Dashboard';
import BookList from './pages/BookList';
import BorrowManage from './pages/BorrowManage';
import UserManage from './pages/UserManage';
import PointsMall from './pages/PointsMall';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Tools from './pages/Tools';
import Profile from './pages/Profile';
import CommunityManage from './pages/CommunityManage';
import RuleManage from './pages/RuleManage';
import ApplyRule from './pages/ApplyRule';
import TopicsList from './pages/TopicsList';
import TopicDetail from './pages/TopicDetail';
import CreateTopic from './pages/TopicCreate';
import Login from './pages/Login';
import MobileHome from './mobile/pages/MobileHome';
import MobileTopicsList from './mobile/pages/MobileTopicsList';
import MobileTopicDetail from './mobile/pages/MobileTopicDetail';
import MobileTopicCreate from './mobile/pages/MobileTopicCreate';
import MobileVoteDetail from './mobile/pages/MobileVoteDetail';
import MobileBookList from './mobile/pages/MobileBookList';
import MobileMyBorrows from './mobile/pages/MobileMyBorrows';
import MobileProfile from './mobile/pages/MobileProfile';
import MobileScanBorrow from './mobile/pages/MobileScanBorrow';
import MobileToolShare from './mobile/pages/MobileToolShare';
import MobileRuleApply from './mobile/pages/MobileRuleApply';

// 路由守卫
const PrivateRoute = ({ children }) => {
  const { token } = useSelector(state => state.user);
  return token ? children : <Navigate to="/login" />;
};

// 管理权限
const AdminRoute = ({ children }) => {
  const { info } = useSelector(state => state.user);
  if (!info || (info.role !== 'admin' && info.role !== 'super_admin')) {
    return <Navigate to="/" />;
  }
  return children;
};

// 手机端路由守卫（跳转手机端登录页）
const MobilePrivateRoute = ({ children }) => {
  const { token } = useSelector(state => state.user);
  return token ? children : <Navigate to="/mobile/login" />;
};

// 超级管理员专属路由
const SuperAdminRoute = ({ children }) => {
  const { info } = useSelector(state => state.user);
  if (!info || info.role !== 'super_admin') {
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
              <AppLayout />
            </PrivateRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="books" element={<BookList />} />
            <Route path="borrow" element={<BorrowManage />} />
            <Route path="users" element={
              <AdminRoute>
                <UserManage />
              </AdminRoute>
            } />
            <Route path="points" element={<PointsMall />} />
            <Route path="tools" element={<Tools />} />
            <Route path="profile" element={<Profile />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<Settings />} />
            <Route path="communities" element={
              <SuperAdminRoute>
                <CommunityManage />
              </SuperAdminRoute>
            } />
            <Route path="rules" element={
              <AdminRoute>
                <RuleManage />
              </AdminRoute>
            } />
            <Route path="apply-rule" element={<ApplyRule />} />
            <Route path="topics" element={<TopicsList />} />
            <Route path="topics/create" element={<CreateTopic />} />
            <Route path="topics/:id" element={<TopicDetail />} />
          </Route>
          {/* Mobile Routes - 议事风格 */}
          <Route path="/mobile" element={
            <MobilePrivateRoute>
              <AppLayoutMobileYishi />
            </MobilePrivateRoute>
          }>
            <Route index element={<MobileHome />} />
            <Route path="topics" element={<MobileTopicsList />} />
            <Route path="topics/create" element={<MobileTopicCreate />} />
            <Route path="topics/:id" element={<MobileTopicDetail />} />
            <Route path="votes/:id" element={<MobileVoteDetail />} />
            <Route path="garden" element={<MobileProfile />} />
            <Route path="ai" element={<MobileProfile />} />
            <Route path="square" element={<MobileProfile />} />
            <Route path="profile" element={<MobileProfile />} />
            <Route path="books" element={<MobileBookList />} />
            <Route path="my-borrows" element={<MobileMyBorrows />} />
            <Route path="scan" element={<MobileScanBorrow />} />
            <Route path="tools" element={<MobileToolShare />} />
            <Route path="apply-rule" element={<MobileRuleApply />} />
          </Route>
          {/* 手机端登录页（独立路由，无需鉴权） */}
          <Route path="/mobile/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
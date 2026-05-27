/**
 * Mobile App Router
 * 混合路由：原有TabBar（图书/借阅/工具/我的）+ 议事模块（Topics）
 */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { store } from '../common/store';
import AppLayoutMobile from '../common/components/AppLayoutMobile';
import AppLayoutMobileYishi from '../common/components/AppLayoutMobileYishi';
import MobileHome from './pages/MobileHome';
import MobileBookList from './pages/MobileBookList';
import MobileMyBorrows from './pages/MobileMyBorrows';
import MobileProfile from './pages/MobileProfile';
import MobileScanBorrow from './pages/MobileScanBorrow';
import MobileToolShare from './pages/MobileToolShare';
import MobileRuleApply from './pages/MobileRuleApply';
import MobileTopicsList from './pages/MobileTopicsList';
import MobileTopicDetail from './pages/MobileTopicDetail';
import MobileTopicCreate from './pages/MobileTopicCreate';
import Login from '../pages/Login';

const PrivateRoute = ({ children }) => {
  const { token } = useSelector(state => state.user);
  return token ? children : <Navigate to="/mobile/login" />;
};

// 议事模块专用布局（5项底部导航）
const YishiRoutes = () => (
  <AppLayoutMobileYishi>
    <Routes>
      <Route index element={<MobileHome />} />
      <Route path="topics" element={<MobileTopicsList />} />
      <Route path="topics/:id" element={<MobileTopicDetail />} />
      <Route path="topics/create" element={<MobileTopicCreate />} />
      <Route path="garden" element={<MobileProfile />} />
      <Route path="ai" element={<MobileProfile />} />
      <Route path="square" element={<MobileProfile />} />
    </Routes>
  </AppLayoutMobileYishi>
);

function AppMobile() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/mobile/login" element={<Login />} />
          <Route path="/mobile" element={
            <PrivateRoute>
              <YishiRoutes />
            </PrivateRoute>
          } />
          {/* 原有 TabBar 路由（议事/图书/借阅/工具/我的） */}
          <Route path="/mobile-books" element={
            <PrivateRoute><AppLayoutMobile /></PrivateRoute>
          }>
            <Route path="books" element={<MobileBookList />} />
            <Route path="my-borrows" element={<MobileMyBorrows />} />
            <Route path="tools" element={<MobileToolShare />} />
            <Route path="profile" element={<MobileProfile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default AppMobile;

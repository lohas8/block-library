/**
 * Mobile App Router
 * 手机端路由配置
 */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { store } from '../common/store';
import AppLayoutMobile from '../common/components/AppLayoutMobile';
import MobileHome from './pages/MobileHome';
import MobileBookList from './pages/MobileBookList';
import MobileMyBorrows from './pages/MobileMyBorrows';
import MobileProfile from './pages/MobileProfile';
import MobileScanBorrow from './pages/MobileScanBorrow';
import MobileToolShare from './pages/MobileToolShare';
import MobileRuleApply from './pages/MobileRuleApply';
import Login from '../pages/Login';

// 路由守卫
const PrivateRoute = ({ children }) => {
  const { token } = useSelector(state => state.user);
  return token ? children : <Navigate to="/mobile/login" />;
};

function AppMobile() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/mobile/login" element={<Login />} />
          <Route path="/mobile" element={
            <PrivateRoute>
              <AppLayoutMobile />
            </PrivateRoute>
          }>
            <Route index element={<MobileHome />} />
            <Route path="books" element={<MobileBookList />} />
            <Route path="my-borrows" element={<MobileMyBorrows />} />
            <Route path="scan" element={<MobileScanBorrow />} />
            <Route path="tools" element={<MobileToolShare />} />
            <Route path="apply-rule" element={<MobileRuleApply />} />
            <Route path="profile" element={<MobileProfile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default AppMobile;
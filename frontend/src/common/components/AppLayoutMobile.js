/**
 * AppLayoutMobile - 手机端布局组件
 * 使用 antd-mobile v5
 */
import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { TabBar } from 'antd-mobile';
import './AppLayoutMobile.css';

const AppLayoutMobile = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { key: '/mobile', title: '首页', icon: '🏠' },
    { key: '/mobile/books', title: '图书', icon: '📚' },
    { key: '/mobile/my-borrows', title: '借阅', icon: '📖' },
    { key: '/mobile/tools', title: '工具', icon: '🛠️' },
    { key: '/mobile/profile', title: '我的', icon: '👤' },
  ];

  return (
    <div className="mobile-layout">
      <div className="mobile-content">
        <Outlet />
      </div>
      <TabBar
        className="mobile-tabbar"
        activeKey={location.pathname}
        onChange={(key) => navigate(key)}
      >
        {tabs.map(tab => (
          <TabBar.Item
            key={tab.key}
            icon={<span className="tab-icon">{tab.icon}</span>}
            title={tab.title}
          />
        ))}
      </TabBar>
    </div>
  );
};

export default AppLayoutMobile;
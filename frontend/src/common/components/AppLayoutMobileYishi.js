/**
 * AppLayoutMobileYishi - 议事风格底部导航
 * 5项：议事/家园/AI/广场/我的
 * AI 项圆形突出
 */
import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import './AppLayoutMobileYishi.css';

const tabs = [
  { key: '/mobile', title: '议事', icon: '💬' },
  { key: '/mobile/garden', title: '家园', icon: '🏡' },
  { key: '/mobile/ai', title: 'AI', icon: '🤖', isAi: true },
  { key: '/mobile/square', title: '广场', icon: '🏘️' },
  { key: '/mobile/profile', title: '我的', icon: '👤' },
];

const AppLayoutMobileYishi = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="mobile-layout-yishi">
      <div className="mobile-content">
        <Outlet />
      </div>
      <div className="bottom-nav">
        {tabs.map(tab => {
          const isActive = location.pathname === tab.key ||
            (tab.key !== '/mobile' && location.pathname.startsWith(tab.key));
          return (
            <div
              key={tab.key}
              className={`nav-item ${isActive ? 'active' : ''} ${tab.isAi ? 'ai' : ''}`}
              onClick={() => navigate(tab.key)}
            >
              <div className={`nav-icon ${tab.isAi ? 'ai-nav-icon' : ''}`}>
                <span>{tab.icon}</span>
              </div>
              <span className="nav-title">{tab.title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AppLayoutMobileYishi;

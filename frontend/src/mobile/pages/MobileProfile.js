/**
 * MobileProfile - 个人中心页面
 * 完全重写，按照新设计规格
 * 
 * 布局结构:
 * 1. 顶部用户信息卡片 (头像 + 昵称 + 认证标签 + 钱包地址 + 积分/贡献值)
 * 2. 功能菜单 Grid (4列)
 * 3. 社区动态时间线
 * 4. 底部导航栏 (Tab Bar)
 */

import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Toast } from 'antd-mobile';
import './MobileProfile.css';

// Mock 数据
const mockData = {
  user: {
    id: 'u123',
    nickname: '张明远',
    avatar: '🧑',
    is_verified: true,
    role: 'owner',
    wallet_address: '0x1a2b3c4d5e6f7890123456789abcdef1234567890abcdef1234567890abcdef1234',
  },
  stats: {
    points: 612,
    contribution: 20,
  },
  menus: [
    { id: 'votes', title: '我的投票', icon: '🗳️', badge: 0 },
    { id: 'proposals', title: '我的提案', icon: '📋', badge: 2 },
    { id: 'comments', title: '我的评论', icon: '💬', badge: null },
    { id: 'help', title: '帮助中心', icon: '❓' },
    { id: 'settings', title: '设置', icon: '⚙️' },
  ],
  community_events: [
    { id: 'evt001', title: '第1期社区治理会议', date: '2023-11-11', status: 'ended' },
    { id: 'evt002', title: '第2期社区治理会议', date: '2023-11-18', status: 'ended' },
  ],
};

// 路由映射
const routeMap = {
  votes: '/mobile/votes',
  proposals: '/mobile/proposals',
  comments: '/mobile/comments',
  help: '/mobile/help',
  settings: '/mobile/settings',
};

const tabBarItems = [
  { key: 'home', title: '首页', icon: '🏠', path: '/mobile/home' },
  { key: 'todos', title: '待办', icon: '📋', path: '/mobile/todos' },
  { key: 'community', title: '家园', icon: '🏡', path: '/mobile/community' },
  { key: 'profile', title: '我的', icon: '👤', path: '/mobile/profile', active: true },
];

const MobileProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [refreshing, setRefreshing] = useState(false);
  const [events, setEvents] = useState(mockData.community_events);
  const [hasMoreEvents, setHasMoreEvents] = useState(true);

  // 复制钱包地址
  const handleCopyAddress = useCallback(() => {
    const address = mockData.user.wallet_address;
    navigator.clipboard.writeText(address).then(() => {
      Toast.show({
        content: '地址已复制',
        position: 'bottom',
        duration: 2000,
      });
    }).catch(() => {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = address;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      Toast.show({
        content: '地址已复制',
        position: 'bottom',
        duration: 2000,
      });
    });
  }, []);

  // 点击头像
  const handleAvatarClick = useCallback(() => {
    // 预留：跳转个人资料编辑页
    // navigate('/mobile/profile/edit');
    Toast.show({
      content: '个人资料编辑页（建设中）',
      position: 'bottom',
      duration: 1500,
    });
  }, []);

  // 点击菜单项
  const handleMenuClick = useCallback((menuId) => {
    const path = routeMap[menuId];
    if (path) {
      navigate(path);
    }
  }, [navigate]);

  // 点击社区动态
  const handleEventClick = useCallback((eventId) => {
    navigate(`/mobile/event/${eventId}`);
  }, [navigate]);

  // 点击更多
  const handleMoreClick = useCallback(() => {
    Toast.show({
      content: '加载更多动态...',
      position: 'bottom',
      duration: 1000,
    });
    // 预留：加载更多或跳转动态列表页
    // navigate('/mobile/events');
  }, []);

  // 点击 TabBar
  const handleTabClick = useCallback((path) => {
    if (path !== location.pathname) {
      navigate(path);
    }
  }, [navigate, location.pathname]);

  // 下拉刷新
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // 模拟刷新请求
    await new Promise(resolve => setTimeout(resolve, 1000));
    setEvents([...mockData.community_events]);
    setHasMoreEvents(true);
    setRefreshing(false);
    Toast.show({
      content: '刷新成功',
      position: 'bottom',
      duration: 1000,
    });
  }, []);

  // 加载更多动态
  const handleLoadMore = useCallback(() => {
    if (!hasMoreEvents) return;
    // 预留：分页加载更多
    setHasMoreEvents(false);
  }, [hasMoreEvents]);

  // 格式化钱包地址显示
  const formatAddress = (address) => {
    if (!address) return '';
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="mobile-profile">
      {/* 1. 顶部用户信息卡片 */}
      <div className="profile-user-card">
        <div className="profile-user-top">
          <div className="profile-avatar" onClick={handleAvatarClick}>
            <div className="profile-avatar-icon">{mockData.user.avatar}</div>
            {mockData.user.is_verified && (
              <span className="profile-verified-badge">✓</span>
            )}
          </div>
          <div className="profile-user-info">
            <div className="profile-nickname">{mockData.user.nickname}</div>
            {mockData.user.is_verified && (
              <span className="profile-verified-tag">
                已认证 {mockData.user.role === 'owner' ? '业主' : mockData.user.role}
              </span>
            )}
            <div className="profile-wallet">
              <span className="profile-wallet-address">
                {formatAddress(mockData.user.wallet_address)}
              </span>
              <span className="profile-copy-icon" onClick={handleCopyAddress} role="button" aria-label="复制地址">📋</span>
            </div>
          </div>
        </div>
        <div className="profile-stats">
          <div className="profile-stat-item">
            <div className="profile-stat-label">积分余额</div>
            <div className="profile-stat-value points">{mockData.stats.points}</div>
          </div>
          <div className="profile-stat-item">
            <div className="profile-stat-label">贡献值</div>
            <div className="profile-stat-value contribution">{mockData.stats.contribution}</div>
          </div>
        </div>
      </div>

      {/* 2. 功能菜单 Grid */}
      <div className="profile-menu-card">
        <div className="profile-menu-grid">
          {mockData.menus.map(menu => (
            <div
              key={menu.id}
              className="profile-menu-item"
              onClick={() => handleMenuClick(menu.id)}
            >
              {menu.badge > 0 && (
                <span className="profile-menu-badge">{menu.badge}</span>
              )}
              <span className="profile-menu-icon">{menu.icon}</span>
              <span className="profile-menu-title">{menu.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. 社区动态模块 */}
      <div className="profile-events-card">
        <div className="profile-events-header">
          <span className="profile-events-title">社区动态</span>
          <span className="profile-events-more" onClick={handleMoreClick}>
            更多 ›
          </span>
        </div>
        <div className="profile-events-timeline">
          {events.map(event => (
            <div
              key={event.id}
              className="profile-event-item"
              onClick={() => handleEventClick(event.id)}
            >
              <div className="profile-event-dot" />
              <div className="profile-event-content">
                <div className="profile-event-title">{event.title}</div>
                <div className="profile-event-meta">
                  <span className="profile-event-date">{event.date}</span>
                  <span className="profile-event-status">
                    {event.status === 'ended' ? '已结束' : event.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. 底部导航栏 */}
      <div className="profile-tabbar">
        <div className="profile-tabbar-list">
          {tabBarItems.map(item => (
            <div
              key={item.key}
              className={`profile-tabbar-item ${item.active ? 'active' : ''}`}
              onClick={() => handleTabClick(item.path)}
            >
              <span className="profile-tabbar-icon">{item.icon}</span>
              <span className="profile-tabbar-text">{item.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileProfile;

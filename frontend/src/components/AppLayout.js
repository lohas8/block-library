import React, { useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Badge } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { setUser, logout } from '../store';
import './AppLayout.css';

const { Header, Sider, Content } = Layout;

const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { info } = useSelector(state => state.user);

  const menuItems = [
    { key: '/', icon: '📊', label: '仪表盘' },
    { key: '/books', icon: '📚', label: '图书管理' },
    { key: '/borrow', icon: '📖', label: '借阅管理' },
    { key: '/users', icon: '👥', label: '用户管理' },
    { key: '/points', icon: '🎁', label: '积分商城' },
    { key: '/notifications', icon: '🔔', label: '通知' },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const selectedKey = menuItems.find(item => location.pathname === item.key)?.key || '/';

  const userMenu = {
    items: [
      { key: 'logout', label: '退出登录' }
    ]
  };

  const handleUserMenuClick = ({ key }) => {
    if (key === 'logout') {
      dispatch(logout());
      navigate('/login');
    }
  };

  return (
    <Layout className="app-layout">
      <Sider width={200} className="app-sider">
        <div className="logo">📚 小区图书管理</div>
        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={[selectedKey]}
          onClick={handleMenuClick}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header className="app-header">
          <div className="header-left">
            <span className="page-title">{menuItems.find(i => i.key === selectedKey)?.label || '仪表盘'}</span>
          </div>
          <div className="header-right">
            <Dropdown menu={userMenu} onClick={handleUserMenuClick} placement="bottomRight">
              <div className="user-info">
                <Avatar style={{ backgroundColor: '#1890ff' }}>{info?.name?.[0] || '管'}</Avatar>
                <span className="username">{info?.name || '管理员'}</span>
                {info?.points !== undefined && (
                  <span className="points">{info.points} 积分</span>
                )}
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className="app-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
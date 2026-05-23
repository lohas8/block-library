import React, { useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Badge } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { setUser, logout, setTheme, toggleFeature } from '../store';
import './AppLayout.css';

const { Header, Sider, Content } = Layout;

const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { info } = useSelector(state => state.user);
  const { theme, features } = useSelector(state => state.settings);

  const menuItems = [
    { key: '/', icon: '📊', label: '仪表盘' },
    ...(features.bookManage ? [{ key: '/books', icon: '📚', label: '图书管理' }] : []),
    ...(features.borrow ? [{ key: '/borrow', icon: '📖', label: '借阅管理' }] : []),
    ...(features.toolShare ? [{ key: '/tools', icon: '🛠️', label: '工具共享' }] : []),
    ...(features.userManage ? [{ key: '/users', icon: '👥', label: '用户管理' }] : []),
    ...(features.pointsMall ? [{ key: '/points', icon: '🎁', label: '积分商城' }] : []),
    ...(info?.role === 'super_admin' ? [{ key: '/communities', icon: '🏠', label: '小区管理' }] : []),
    { key: '/notifications', icon: '🔔', label: '通知' },
    { key: '/settings', icon: '⚙️', label: '配置' },
  ];

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const selectedKey = menuItems.find(item => location.pathname === item.key)?.key || '/';

  const userMenu = {
    items: [
      { key: 'profile', label: '👤 个人中心' },
      { key: 'settings', label: '⚙️ 系统配置' },
      { type: 'divider' },
      { key: 'logout', label: '退出登录' }
    ]
  };

  const handleUserMenuClick = ({ key }) => {
    if (key === 'logout') {
      dispatch(logout());
      navigate('/login');
    } else if (key === 'settings') {
      navigate('/settings');
    } else if (key === 'profile') {
      navigate('/profile');
    }
  };

  return (
    <Layout className={`app-layout theme-${theme}`}>
      <Sider width={200} className={`app-sider ${theme === 'dark' ? 'dark-sider' : ''}`}>
        <div className="logo">📚 小区图书</div>
        <Menu
          mode="inline"
          theme={theme === 'dark' ? 'light' : 'dark'}
          selectedKeys={[selectedKey]}
          onClick={handleMenuClick}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header className={`app-header ${theme === 'dark' ? 'dark-header' : ''}`}>
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
        <Content className={`app-content ${theme === 'dark' ? 'dark-content' : ''}`}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
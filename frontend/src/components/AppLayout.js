import React from 'react';
import { Layout, Menu, Badge, Avatar, Dropdown, Space } from 'antd';
import { 
  DashboardOutlined, 
  BookOutlined, 
  ImportOutlined, 
  UserOutlined, 
  GiftOutlined,
  BellOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../store';

const { Header, Sider, Content } = Layout;

const AppLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { info } = useSelector(state => state.user);
  const { unreadCount } = useSelector(state => state.notification);

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: '/books',
      icon: <BookOutlined />,
      label: '图书管理',
    },
    {
      key: '/borrow',
      icon: <ImportOutlined />,
      label: '借阅管理',
    },
    ...(info?.role === 'admin' ? [{
      key: '/users',
      icon: <UserOutlined />,
      label: '用户管理',
    }] : []),
    {
      key: '/points',
      icon: <GiftOutlined />,
      label: '积分商城',
    },
    {
      key: '/notifications',
      icon: <Badge count={unreadCount} size="small"><BellOutlined /></Badge>,
      label: '通知',
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      label: `积分: ${info?.points || 0}`,
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleUserMenuClick = ({ key }) => {
    if (key === 'logout') {
      dispatch(setUser({ token: null, user: null }));
      navigate('/login');
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="dark" breakpoint="lg" collapsedWidth="0">
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18 }}>
          📚 图书管理
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} />
              <span>{info?.name || info?.username}</span>
            </Space>
          </Dropdown>
        </Header>
        <Content style={{ margin: 24, padding: 24, background: '#fff', minHeight: 280 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;

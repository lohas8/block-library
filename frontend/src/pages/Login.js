import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Tabs, Radio } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { userApi } from '../../api';
import { useDispatch } from 'react-redux';
import { setUser } from '../../store';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const res = await userApi.login(values);
      dispatch(setUser(res.data));
      message.success('登录成功');
      navigate('/');
    } catch (error) {
      message.error(error.response?.data?.msg || '登录失败');
    }
    setLoading(false);
  };

  const handleRegister = async (values) => {
    setLoading(true);
    try {
      await userApi.register(values);
      message.success('注册成功，请登录');
      setActiveTab('login');
    } catch (error) {
      message.error(error.response?.data?.msg || '注册失败');
    }
    setLoading(false);
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: '#f0f2f5' 
    }}>
      <Card style={{ width: 400 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>📚 小区图书管理系统</h2>
        
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          centered
        >
          <Tabs.TabPane tab="登录" key="login">
            <Form onFinish={handleLogin} layout="vertical">
              <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
                <Input prefix={<UserOutlined />} placeholder="用户名" />
              </Form.Item>
              <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
                <Input.Password prefix={<LockOutlined />} placeholder="密码" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" block loading={loading}>
                  登录
                </Button>
              </Form.Item>
            </Form>
          </Tabs.TabPane>

          <Tabs.TabPane tab="注册" key="register">
            <Form onFinish={handleRegister} layout="vertical">
              <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
                <Input prefix={<UserOutlined />} placeholder="用户名" />
              </Form.Item>
              <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
                <Input.Password prefix={<LockOutlined />} placeholder="密码" />
              </Form.Item>
              <Form.Item name="name" rules={[{ required: true, message: '请输入姓名' }]}>
                <Input placeholder="姓名" />
              </Form.Item>
              <Form.Item name="phone" label="手机号">
                <Input placeholder="手机号" />
              </Form.Item>
              <Form.Item name="email" label="邮箱">
                <Input placeholder="邮箱" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" block loading={loading}>
                  注册
                </Button>
              </Form.Item>
            </Form>
          </Tabs.TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Login;

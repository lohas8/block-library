import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Avatar, Divider, Tag } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, IdcardOutlined } from '@ant-design/icons';
import { userApi } from '../api';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../store';
import './Profile.css';

const Profile = () => {
  const dispatch = useDispatch();
  const { info } = useSelector(state => state.user);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (info) {
      form.setFieldsValue({
        name: info.name,
        phone: info.phone,
        email: info.email,
      });
    }
  }, [info, form]);

  const handleUpdate = async (values) => {
    setLoading(true);
    try {
      await userApi.update(info._id, values);
      dispatch(setUser({ token: info.token, ...info, ...values }));
      message.success('个人信息已更新');
      setEditing(false);
    } catch (error) {
      message.error('更新失败');
    }
    setLoading(false);
  };

  const roleLabels = {
    admin: { label: '管理员', color: '#fa8c16' },
    super_admin: { label: '超级管理员', color: '#ff4d4f' },
    user: { label: '普通用户', color: '#52c41a' },
    owner: { label: '业主', color: '#1890ff' },
    property: { label: '物业', color: '#722ed1' },
  };

  const roleInfo = roleLabels[info?.role] || roleLabels.user;

  return (
    <div className="profile-page">
      <h1>👤 个人中心</h1>
      <Card>
        <div className="profile-header">
          <Avatar size={80} style={{ backgroundColor: '#1890ff', fontSize: 36 }}>
            {info?.name?.[0] || '用'}
          </Avatar>
          <div className="profile-header-info">
            <h2>{info?.name || '用户'}</h2>
            <Tag color={roleInfo.color}>{roleInfo.label}</Tag>
            <span className="profile-points">💰 {info?.points || 0} 积分</span>
          </div>
        </div>

        <Divider />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
          className="profile-form"
        >
          <Form.Item name="name" label="姓名">
            <Input prefix={<UserOutlined />} disabled={!editing} />
          </Form.Item>

          <Form.Item name="phone" label="手机号">
            <Input prefix={<PhoneOutlined />} disabled={!editing} />
          </Form.Item>

          <Form.Item name="email" label="邮箱">
            <Input prefix={<MailOutlined />} disabled={!editing} />
          </Form.Item>

          <Form.Item>
            <div className="profile-info-row">
              <span className="profile-info-label"><IdcardOutlined /> 用户名</span>
              <span className="profile-info-value">{info?.username}</span>
            </div>
          </Form.Item>

          <Divider />

          {editing ? (
            <div className="profile-actions">
              <Button type="primary" htmlType="submit" loading={loading}>保存</Button>
              <Button onClick={() => { setEditing(false); form.resetFields(); }}>取消</Button>
            </div>
          ) : (
            <Button type="primary" onClick={() => setEditing(true)}>编辑信息</Button>
          )}
        </Form>
      </Card>
    </div>
  );
};

export default Profile;
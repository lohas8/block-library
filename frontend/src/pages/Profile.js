import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Avatar, Divider, Tag, List, Modal } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, IdcardOutlined, LinkOutlined, TeamOutlined } from '@ant-design/icons';
import { userApi } from '../api';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../store';
import './Profile.css';

const Profile = () => {
  const dispatch = useDispatch();
  const { info } = useSelector(state => state.user);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [invites, setInvites] = useState([]);
  const [invitedBy, setInvitedBy] = useState(null);
  const [loadingInvites, setLoadingInvites] = useState(false);
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

  useEffect(() => {
    if (inviteModalVisible || true) {
      loadInviteData();
    }
  }, [inviteModalVisible, info]);

  const loadInviteData = async () => {
    if (!info?._id) return;
    setLoadingInvites(true);
    try {
      const [invitesRes, byRes] = await Promise.all([
        userApi.getInvites(info._id),
        userApi.getInvitedBy(info._id),
      ]);
      setInvites(invitesRes.list || []);
      setInvitedBy(byRes);
    } catch (error) {
      console.error('获取邀请数据失败', error);
    }
    setLoadingInvites(false);
  };

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

  const inviteLink = `https://community.library/invite/${info?._id || 'USER_ID'}`;
  const inviteCode = info?._id ? btoa(info._id).replace(/=/g, '') : '';

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

      {/* 邀请功能 */}
      <Card style={{ marginTop: 24 }}>
        <div className="profile-section-title">
          <TeamOutlined /> 邀请功能
        </div>

        <Button
          type="primary"
          icon={<LinkOutlined />}
          onClick={() => setInviteModalVisible(true)}
          style={{ marginTop: 12 }}
        >
          邀请链接
        </Button>

        {/* 邀请信息直接展示在页面 */}
        <div style={{ marginTop: 16 }}>
          {invitedBy ? (
            <div style={{ marginBottom: 12 }}>
              <span style={{ color: '#888', fontSize: 12 }}>🎁 邀请人：</span>
              <Avatar size="small" style={{ marginLeft: 6, marginRight: 4 }}>{invitedBy.name?.[0]}</Avatar>
              <span>{invitedBy.name}</span>
              <Tag color="blue" style={{ marginLeft: 6 }}>{roleLabels[invitedBy.role]?.label || invitedBy.role}</Tag>
            </div>
          ) : (
            <div style={{ color: '#888', fontSize: 12, marginBottom: 12 }}>🎁 暂无邀请人（自己是第一个加入的）</div>
          )}

          <div style={{ marginTop: 8 }}>
            <span style={{ color: '#888', fontSize: 12 }}>👥 我邀请的人（{invites.length}人）</span>
            {loadingInvites ? (
              <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>加载中...</div>
            ) : invites.length > 0 ? (
              <List
                size="small"
                dataSource={invites}
                style={{ marginTop: 6 }}
                renderItem={item => (
                  <List.Item style={{ padding: '4px 0' }}>
                    <Avatar size="small" style={{ marginRight: 8 }}>{item.name?.[0]}</Avatar>
                    <span style={{ flex: 1 }}>{item.name}</span>
                    <Tag color="green">已邀请</Tag>
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>暂无邀请记录</div>
            )}
          </div>
        </div>
      </Card>

      {/* 邀请弹窗 - 仅邀请链接 */}
      <Modal
        title="邀请链接"
        open={inviteModalVisible}
        onCancel={() => setInviteModalVisible(false)}
        footer={null}
        width={500}
      >
        <div className="invite-section">
          <p style={{ color: '#888', fontSize: 12, marginBottom: 8 }}>分享给邻居，邀请加入小区图书共享计划</p>
          <div className="invite-link-box">
            <Input value={inviteLink} readOnly suffix={
              <Button size="small" type="text" onClick={() => {
                navigator.clipboard.writeText(inviteLink).then(() => message.success('已复制！'));
              }}>复制</Button>
            } />
          </div>
          <p style={{ color: '#888', fontSize: 12, marginTop: 8 }}>邀请码：<b>{inviteCode}</b>（分享给邻居，让他们输入此码注册）</p>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;
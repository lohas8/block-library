import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Tag, Select } from 'antd';
import { PlusOutlined, UserOutlined } from '@ant-design/icons';
import { userApi } from '../../api';
import { useSelector } from 'react-redux';

const { Option } = Select;

const UserManage = () => {
  const { info: currentUser } = useSelector(state => state.user);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState({ page: 1, pageSize: 10 });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      loadUsers();
    }
  }, [params, currentUser]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await userApi.list(params);
      setUsers(res.data.list);
      setTotal(res.data.total);
    } catch (error) {
      message.error('获取用户列表失败');
    }
    setLoading(false);
  };

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingUser(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editingUser) {
        await userApi.update(editingUser._id, values);
        message.success('更新成功');
      } else {
        await userApi.register(values);
        message.success('注册成功');
      }
      setModalVisible(false);
      loadUsers();
    } catch (error) {
      message.error(error.response?.data?.msg || '操作失败');
    }
  };

  const handleUpdatePoints = async (id, action) => {
    const points = prompt('请输入积分数量');
    if (!points || isNaN(points)) return;
    
    try {
      await userApi.updatePoints(id, { points: parseInt(points), action });
      message.success('积分更新成功');
      loadUsers();
    } catch (error) {
      message.error(error.response?.data?.msg || '操作失败');
    }
  };

  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '手机',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '积分',
      dataIndex: 'points',
      key: 'points',
      render: (points) => <Tag color="gold">{points}</Tag>,
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>
          {role === 'admin' ? '管理员' : '用户'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" onClick={() => handleUpdatePoints(record._id, 'add')}>
            加积分
          </Button>
          <Button type="link" onClick={() => handleUpdatePoints(record._id, 'subtract')}>
            减积分
          </Button>
        </Space>
      ),
    },
  ];

  if (currentUser?.role !== 'admin') {
    return <div>无权限访问</div>;
  }

  return (
    <div>
      <h1>👥 用户管理</h1>
      
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加用户
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="_id"
        loading={loading}
        pagination={{
          current: params.page,
          pageSize: params.pageSize,
          total,
          onChange: (page) => setParams({ ...params, page }),
        }}
      />

      <Modal
        title={editingUser ? '编辑用户' : '添加用户'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={form.submit}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
            <Input disabled={!!editingUser} />
          </Form.Item>
          {!editingUser && (
            <Form.Item name="password" label="密码" rules={[{ required: true }]}>
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="手机">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input />
          </Form.Item>
          <Form.Item name="role" label="角色" initialValue="user">
            <Select>
              <Option value="user">用户</Option>
              <Option value="admin">管理员</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManage;

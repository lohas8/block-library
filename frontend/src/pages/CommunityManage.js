import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, message, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, HomeOutlined } from '@ant-design/icons';
import { communityApi } from '../api';
import './CommunityManage.css';

const CommunityManage = () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadCommunities();
  }, []);

  const loadCommunities = async () => {
    setLoading(true);
    try {
      const res = await communityApi.list();
      setCommunities(res.list || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleAdd = () => {
    setEditing(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await communityApi.delete(id);
      message.success('删除成功');
      loadCommunities();
    } catch (err) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await communityApi.update(editing._id, values);
        message.success('更新成功');
      } else {
        await communityApi.create(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadCommunities();
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    { title: '小区名称', dataIndex: 'name', key: 'name' },
    { title: '地址', dataIndex: 'address', key: 'address' },
    { title: '管理员', dataIndex: 'adminName', key: 'adminName' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (v) => <Tag color={v === 'active' ? 'green' : 'red'}>{v === 'active' ? '正常' : '禁用'}</Tag>,
    },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} style={{ marginRight: 8 }}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record._id)}>
            <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div className="community-page">
      <h1>🏠 小区管理</h1>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增小区</Button>
        </div>
        <Table
          columns={columns}
          dataSource={communities}
          rowKey="_id"
          loading={loading}
        />
      </Card>

      <Modal
        title={editing ? '编辑小区' : '新增小区'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="小区名称" rules={[{ required: true, message: '请输入小区名称' }]}>
            <Input placeholder="请输入小区名称" />
          </Form.Item>
          <Form.Item name="address" label="地址" rules={[{ required: true, message: '请输入地址' }]}>
            <Input placeholder="请输入地址" />
          </Form.Item>
          <Form.Item name="adminName" label="管理员姓名">
            <Input placeholder="管理员姓名（选填）" />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue="active">
            <Select>
              <Select.Option value="active">正常</Select.Option>
              <Select.Option value="inactive">禁用</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CommunityManage;
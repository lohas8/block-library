import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, InputNumber, message, Tag, Popconfirm, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FileTextOutlined } from '@ant-design/icons';
import { ruleApi, communityApi } from '../api';
import { useSelector } from 'react-redux';
import './RuleManage.css';

const RuleManage = () => {
  const { info } = useSelector(state => state.user);
  const [rules, setRules] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadCommunities();
    loadRules();
  }, []);

  const loadRules = async () => {
    setLoading(true);
    try {
      const res = await ruleApi.list({ communityId: info?.communityId || 'c1' });
      setRules(res.list || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const loadCommunities = async () => {
    try {
      const res = await communityApi.list();
      setCommunities(res.list || []);
    } catch (err) {
      console.error(err);
    }
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
      await ruleApi.delete(id);
      message.success('删除成功');
      loadRules();
    } catch (err) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await ruleApi.update(editing._id, values);
        message.success('更新成功');
      } else {
        await ruleApi.create({ ...values, communityId: info?.communityId || 'c1' });
        message.success('创建成功');
      }
      setModalVisible(false);
      loadRules();
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    { title: '规则名称', dataIndex: 'name', key: 'name' },
    { title: '规则内容', dataIndex: 'content', key: 'content', ellipsis: true },
    {
      title: '奖惩积分',
      dataIndex: 'points',
      key: 'points',
      render: (v) => v > 0
        ? <Tag color="green">+{v}</Tag>
        : <Tag color="red">{v}</Tag>,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (v) => <Tag color={v === 'reward' ? 'gold' : 'purple'}>{v === 'reward' ? '奖励' : '惩罚'}</Tag>,
    },
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
    <div className="rule-page">
      <h1>📋 规则管理</h1>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增规则</Button>
        </div>
        <Table
          columns={columns}
          dataSource={rules}
          rowKey="_id"
          loading={loading}
        />
      </Card>

      <Modal
        title={editing ? '编辑规则' : '新增规则'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="规则名称" rules={[{ required: true, message: '请输入规则名称' }]}>
            <Input placeholder="如：主动清理楼道垃圾" />
          </Form.Item>
          <Form.Item name="content" label="规则内容" rules={[{ required: true, message: '请输入规则内容' }]}>
            <Input.TextArea rows={3} placeholder="请描述规则的具体内容..." />
          </Form.Item>
          <Form.Item name="type" label="规则类型" rules={[{ required: true }]} initialValue="reward">
            <Select>
              <Select.Option value="reward">奖励规则</Select.Option>
              <Select.Option value="penalty">惩罚规则</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="points" label="积分数量" rules={[{ required: true, message: '请输入积分' }]}>
            <InputNumber
              style={{ width: '100%' }}
              placeholder="正数为奖励，负数为惩罚"
            />
          </Form.Item>
          <Form.Item name="communityId" label="所属小区" initialValue={info?.communityId || 'c1'}>
            <Select placeholder="选择小区">
              {communities.map(c => (
                <Select.Option key={c._id} value={c._id}>{c.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RuleManage;
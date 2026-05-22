import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Image, Tag, Button, Modal, Form, Input, Select, InputNumber, message, Table, Popconfirm, Tabs, Statistic } from 'antd';
import { PlusOutlined, ToolOutlined, SwapOutlined } from '@ant-design/icons';
import { toolApi } from '../api';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { setTools, setToolStatistics, addTool, updateTool, deleteTool } from '../store';
import './Tools.css';

const { confirm } = Modal;

const Tools = () => {
  const dispatch = useDispatch();
  const { info } = useSelector(state => state.user);
  const { list, statistics } = useSelector(state => state.tools);
  const [loading, setLoading] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [rentModalVisible, setRentModalVisible] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);
  const [activeTab, setActiveTab] = useState('list');

  const [addForm] = Form.useForm();
  const [rentForm] = Form.useForm();

  useEffect(() => {
    loadTools();
    loadStatistics();
  }, []);

  const loadTools = async () => {
    setLoading(true);
    try {
      const res = await toolApi.list();
      dispatch(setTools(res));
    } catch (error) {
      message.error('获取工具列表失败');
    }
    setLoading(false);
  };

  const loadStatistics = async () => {
    try {
      const res = await toolApi.statistics();
      dispatch(setToolStatistics(res));
    } catch (error) {
      console.error('获取统计失败', error);
    }
  };

  const handleAddTool = async (values) => {
    try {
      const data = { ...values, owner: info._id, ownerName: info.name };
      const res = await toolApi.create(data);
      dispatch(addTool(res));
      message.success('工具录入成功');
      setAddModalVisible(false);
      addForm.resetFields();
    } catch (error) {
      message.error('录入失败');
    }
  };

  const handleRentTool = async (values) => {
    try {
      const data = { toolId: selectedTool._id, userId: info._id, userName: info.name, days: values.days };
      await toolApi.rent(data);
      message.success('租赁成功');
      setRentModalVisible(false);
      rentForm.resetFields();
      loadTools();
      loadStatistics();
    } catch (error) {
      message.error(error.response?.data?.msg || '租赁失败');
    }
  };

  const handleReturnTool = async (tool) => {
    try {
      await toolApi.return(tool._id);
      message.success('归还成功');
      loadTools();
      loadStatistics();
    } catch (error) {
      message.error('归还失败');
    }
  };

  const handleDeleteTool = async (tool) => {
    try {
      await toolApi.delete(tool._id);
      dispatch(deleteTool(tool._id));
      message.success('删除成功');
    } catch (error) {
      message.error('删除失败');
    }
  };

  const showRentModal = (tool) => {
    setSelectedTool(tool);
    setRentModalVisible(true);
  };

  const columns = [
    {
      title: '照片',
      dataIndex: 'image',
      key: 'image',
      width: 80,
      render: (img) => img ? <Image src={img} width={50} height={50} style={{ objectFit: 'cover', borderRadius: 4 }} /> : <div style={{ width: 50, height: 50, background: '#f0f0f0', borderRadius: 4 }} />,
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (c) => <Tag color="blue">{c}</Tag>,
    },
    {
      title: '押金(积分)',
      dataIndex: 'depositPoints',
      key: 'depositPoints',
    },
    {
      title: '日租(积分/天)',
      dataIndex: 'rentPointsPerDay',
      key: 'rentPointsPerDay',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
        if (status === 'borrowed') {
          return <Tag color="orange">已借出<br/><span style={{fontSize:11}}>至{record.dueDate}</span></Tag>;
        }
        return <Tag color="green">可借</Tag>;
      },
    },
    {
      title: '拥有者',
      dataIndex: 'ownerName',
      key: 'ownerName',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {record.status === 'available' && (
            <Button size="small" type="primary" onClick={() => showRentModal(record)}>
              租用
            </Button>
          )}
          {record.status === 'borrowed' && record.borrower === info._id && (
            <Popconfirm title="确认归还？" onConfirm={() => handleReturnTool(record)}>
              <Button size="small">归还</Button>
            </Popconfirm>
          )}
          {record.owner === info._id || info.role === 'admin' ? (
            <Popconfirm title="删除此工具？" onConfirm={() => handleDeleteTool(record)}>
              <Button size="small" danger>删除</Button>
            </Popconfirm>
          ) : null}
        </div>
      ),
    },
  ];

  const cardColumns = [
    { title: '总数量', dataIndex: 'totalTools', key: 'totalTools' },
    { title: '可借', dataIndex: 'available', key: 'available' },
    { title: '已借出', dataIndex: 'borrowed', key: 'borrowed' },
  ];

  const tabItems = [
    {
      key: 'list',
      label: '🛠️ 工具列表',
      children: (
        <div>
          <div style={{ marginBottom: 16, textAlign: 'right' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalVisible(true)}>
              录入工具
            </Button>
          </div>
          <Table dataSource={list} columns={columns} rowKey="_id" loading={loading} pagination={{ pageSize: 10 }} />
        </div>
      ),
    },
  ];

  return (
    <div className="tools-page">
      <h1>🛠️ 工具共享中心</h1>

      {statistics && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Card><Statistic title="总工具数" value={statistics.totalTools} prefix={<ToolOutlined />} /></Card>
          </Col>
          <Col span={8}>
            <Card><Statistic title="可借" value={statistics.available} valueStyle={{ color: '#52c41a' }} /></Card>
          </Col>
          <Col span={8}>
            <Card><Statistic title="已借出" value={statistics.borrowed} valueStyle={{ color: '#fa8c16' }} /></Card>
          </Col>
        </Row>
      )}

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Card>

      {/* 录入工具弹窗 */}
      <Modal title="🛠️ 录入工具" open={addModalVisible} onCancel={() => setAddModalVisible(false)} footer={null}>
        <Form form={addForm} layout="vertical" onFinish={handleAddTool}>
          <Form.Item name="name" label="工具名称" rules={[{ required: true, message: '请输入工具名称' }]}>
            <Input placeholder="如：电钻" />
          </Form.Item>
          <Form.Item name="category" label="分类" rules={[{ required: true, message: '请选择分类' }]}>
            <Select placeholder="选择分类">
              <Select.Option value="电动工具">电动工具</Select.Option>
              <Select.Option value="家电">家电</Select.Option>
              <Select.Option value="户外">户外</Select.Option>
              <Select.Option value="交通工具">交通工具</Select.Option>
              <Select.Option value="五金">五金</Select.Option>
              <Select.Option value="其他">其他</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="image" label="图片URL">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} placeholder="工具描述" />
          </Form.Item>
          <Form.Item name="depositPoints" label="押金(积分)" rules={[{ required: true, message: '请输入押金' }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="rentPointsPerDay" label="日租积分" rules={[{ required: true, message: '请输入日租积分' }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>提交录入</Button>
        </Form>
      </Modal>

      {/* 租赁弹窗 */}
      <Modal title={`租用：${selectedTool?.name || ''}`} open={rentModalVisible} onCancel={() => setRentModalVisible(false)} footer={null}>
        <Form form={rentForm} layout="vertical" onFinish={handleRentTool}>
          <div style={{ background: '#f0f0f0', padding: 16, borderRadius: 8, marginBottom: 16 }}>
            <p>押金：<b>{selectedTool?.depositPoints}</b> 积分</p>
            <p>日租：<b>{selectedTool?.rentPointsPerDay}</b> 积分/天</p>
            <p style={{ color: '#888', fontSize: 12 }}>合计 = 押金 + 日租 × 天数</p>
          </div>
          <Form.Item name="days" label="租用天数" rules={[{ required: true, message: '请输入天数' }]}>
            <InputNumber min={1} max={30} style={{ width: '100%' }} />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>确认租用</Button>
        </Form>
      </Modal>
    </div>
  );
};

export default Tools;